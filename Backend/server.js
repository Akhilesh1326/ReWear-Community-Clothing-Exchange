const express = require("express")
const PORT = process.env.PORT || 8000
const ConnectDB = require("./ConnectDB")
const cors = require("cors")
const bodyParser = require("body-parser")
const { v4: uuidv4 } = require("uuid") // Added missing UUID import
require("dotenv").config()

// JWT related imports
const cookieParser = require("cookie-parser")
const http = require("http")
const jwt = require("jsonwebtoken")

// Server by express
const app = express()

// CORS policy - Fixed UPDATE to PUT
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  }),
)

// Middlewares
app.use(express.json())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Connection of Databases as PostgreSQL and MongoDB
let pgClient
let mongoDb

async function initializeDatabases() {
  try {
    pgClient = await ConnectDB.connectToPostgresSQL()
    mongoDb = await ConnectDB.connectToMongo()
    console.log("Databases connected successfully")
  } catch (error) {
    console.error("Database connection failed:", error)
    process.exit(1)
  }
}

// Import controllers
const {
    getAllCategories,
    getCategoryById,
    getAllListings,
    getListingById,
    createUser,
    logUser,
    createItem,
    createItemImages,
    getUserById,
    updateUserPoints,
} = require("./Controllers/userController")
// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.userCookie

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" })
  }
}

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Hello from ReWear server you've reached the start api" })
})
// GET /api/auth/me - Get current user from JWT
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const query = `
      SELECT user_id, email, first_name, last_name, username, 
             profile_image, user_type, is_active, email_verified
      FROM USERS 
      WHERE user_id = $1 AND is_active = TRUE
    `

    const result = await pgClient.query(query, [userId])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    res.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error("Error getting current user:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// GET /api/users/:user_id/items - Get user's items
app.get("/api/users/:user_id/items", async (req, res) => {
  try {
    const { user_id } = req.params
    const { status, page = 1, limit = 10 } = req.query

    const skip = (page - 1) * limit
    const filter = { userId: user_id }

    if (status) {
      filter.status = status
    }

    const items = await mongoDb
      .collection("items")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))
      .toArray()

    // Get images for each item
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        const images = await mongoDb
          .collection("itemImages")
          .find({ itemId: item.itemId })
          .sort({ uploadOrder: 1 })
          .toArray()
        return { ...item, images }
      }),
    )

    const total = await mongoDb.collection("items").countDocuments(filter)

    res.json({
      success: true,
      data: itemsWithImages,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error getting user items:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// GET /api/users/:user_id/swaps - Get user's swaps
app.get("/api/users/:user_id/swaps", async (req, res) => {
  try {
    const { user_id } = req.params
    const { status, type, page = 1, limit = 10 } = req.query

    const offset = (page - 1) * limit
    let whereClause = `WHERE (requester_id = $1 OR owner_id = $1)`
    const values = [user_id]
    let paramCount = 1

    if (status) {
      whereClause += ` AND status = $${++paramCount}`
      values.push(status)
    }

    if (type) {
      whereClause += ` AND swap_type = $${++paramCount}`
      values.push(type)
    }

    const query = `
      SELECT s.*,
             u_req.first_name as requester_first_name,
             u_req.last_name as requester_last_name,
             u_req.username as requester_username,
             u_req.profile_image as requester_profile_image,
             u_own.first_name as owner_first_name,
             u_own.last_name as owner_last_name,
             u_own.username as owner_username,
             u_own.profile_image as owner_profile_image
      FROM SWAPS s
      JOIN USERS u_req ON s.requester_id = u_req.user_id
      JOIN USERS u_own ON s.owner_id = u_own.user_id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `

    values.push(Number.parseInt(limit), offset)

    const result = await pgClient.query(query, values)

    // Get item details for each swap
    const swapsWithItems = await Promise.all(
      result.rows.map(async (swap) => {
        const item = await mongoDb
          .collection("items")
          .findOne({ itemId: swap.item_id }, { projection: { title: 1, pointValue: 1 } })

        const primaryImage = await mongoDb
          .collection("itemImages")
          .findOne({ itemId: swap.item_id, isPrimary: true }, { projection: { imageUrl: 1 } })

        return {
          ...swap,
          item: {
            ...item,
            primaryImage: primaryImage?.imageUrl || null,
          },
        }
      }),
    )

    res.json({
      success: true,
      data: swapsWithItems,
    })
  } catch (error) {
    console.error("Error getting user swaps:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// GET /api/users/:user_id/notifications - Get user notifications
app.get("/api/users/:user_id/notifications", async (req, res) => {
  try {
    const { user_id } = req.params
    const { page = 1, limit = 20, unread_only = false } = req.query

    const skip = (page - 1) * limit
    const filter = { userId: user_id }

    if (unread_only === "true") {
      filter.isRead = false
    }

    const notifications = await mongoDb
      .collection("notifications")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))
      .toArray()

    const total = await mongoDb.collection("notifications").countDocuments(filter)
    const unreadCount = await mongoDb.collection("notifications").countDocuments({
      userId: user_id,
      isRead: false,
    })

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error getting notifications:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// API call for registering new user
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, firstname, lastname } = req.body
    console.log("User registration request received")

    // Validation
    if (!username) return res.status(422).json({ message: "Username is missing" })
    if (!email) return res.status(422).json({ message: "Email is missing" })
    if (!password) return res.status(422).json({ message: "Password is missing" })
    if (!firstname) return res.status(422).json({ message: "First name is missing" })
    if (!lastname) return res.status(422).json({ message: "Last name is missing" })

    const DB_res = await createUser(username, email, password, firstname, lastname)

    if (DB_res.status === 201) {
      const token = jwt.sign(
        {
          userId: DB_res.data.userid,
          username: DB_res.data.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      res.cookie("userCookie", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })

      res.status(200).json({ message: "Registration successful" })
    } else {
      res.status(DB_res.status).json({ message: DB_res.message })
    }
  } catch (error) {
    console.error("Error while registering user:", error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// API call for user login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username) return res.status(422).json({ message: "Username is missing" })
    if (!password) return res.status(422).json({ message: "Password is missing" })

    const DB_res = await logUser(username, password)

    if (DB_res.status === 200) {
      const token = jwt.sign(
        {
          userId: DB_res.data[0].user_id,
          username: DB_res.data[0].username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      res.cookie("userCookie", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })

      res.status(200).json({ message: "Login successful" })
    } else {
      res.status(DB_res.status).json({ message: DB_res.message })
    }
  } catch (error) {
    console.error("Error while logging user:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// Categories endpoints
app.get("/api/categories", async (req, res) => {
  try {
    const { active_only = true } = req.query

    let whereClause = ""
    if (active_only === "true") {
      whereClause = "WHERE is_active = TRUE"
    }

    const query = `
            SELECT category_id, name, description, icon, is_active, created_at
            FROM CATEGORIES
            ${whereClause}
            ORDER BY name ASC
        `

    const result = await pgClient.query(query)

    res.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Error getting all categories:", error)
    res.status(500).json({ message: "Internal Server Error" })
  }
})

app.get("/api/category/:id", async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" })
    }

    const query = `
            SELECT category_id, name, description, icon, is_active, created_at
            FROM CATEGORIES
            WHERE category_id = $1
        `

    const result = await pgClient.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error("Error getting category by ID:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Listing endpoints
app.get("/api/listing/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId

    if (!itemId || typeof itemId !== "string") {
      return res.status(400).json({ message: "Invalid item ID" })
    }

    const item = await mongoDb.collection("items").findOne({ itemId: itemId })

    if (!item) {
      return res.status(404).json({ message: "Item not found" })
    }

    // Get item images
    const images = await mongoDb.collection("itemImages").find({ itemId: itemId }).sort({ uploadOrder: 1 }).toArray()

    // Get owner information
    const ownerQuery = `
            SELECT user_id, first_name, last_name, username, profile_image
            FROM USERS 
            WHERE user_id = $1
        `
    const ownerResult = await pgClient.query(ownerQuery, [item.userId])

    // Get category information
    const categoryQuery = `
            SELECT category_id, name, icon
            FROM CATEGORIES 
            WHERE category_id = $1
        `
    const categoryResult = await pgClient.query(categoryQuery, [item.categoryId])

    // Increment view count
    await mongoDb.collection("items").updateOne({ itemId: itemId }, { $inc: { viewCount: 1 } })

    res.status(200).json({
      success: true,
      data: {
        ...item,
        images,
        owner: ownerResult.rows[0] || null,
        category: categoryResult.rows[0] || null,
      },
    })
  } catch (error) {
    console.error("Error getting listing by itemId:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

app.get("/api/listings/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId

    if (!categoryId || typeof categoryId !== "string") {
      return res.status(400).json({ message: "Invalid category ID" })
    }

    const items = await mongoDb
      .collection("items")
      .find({
        categoryId: categoryId,
        status: "approved",
        isAvailable: true,
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Get images for each item
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        const images = await mongoDb
          .collection("itemImages")
          .find({ itemId: item.itemId })
          .sort({ uploadOrder: 1 })
          .toArray()
        return { ...item, images }
      }),
    )

    res.status(200).json({
      success: true,
      data: itemsWithImages,
    })
  } catch (error) {
    console.error("Error getting listings by categoryId:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Create new item
app.post("/api/items", authenticateToken, async (req, res) => {
  try {
    const { categoryId, title, description, size, condition, color, brand, tags, pointValue, imageUrls } = req.body

    console.log("New item creation request received")

    // Validation
    if (!categoryId) return res.status(422).json({ message: "Category ID is missing" })
    if (!title) return res.status(422).json({ message: "Title is missing" })
    if (!description) return res.status(422).json({ message: "Description is missing" })
    if (!condition) return res.status(422).json({ message: "Condition is missing" })
    if (!pointValue) return res.status(422).json({ message: "Point value is missing" })

    // Validate title length
    if (title.length < 5 || title.length > 100) {
      return res.status(422).json({ message: "Title must be between 5 and 100 characters" })
    }

    // Validate description length
    if (description.length < 10 || description.length > 1000) {
      return res.status(422).json({ message: "Description must be between 10 and 1000 characters" })
    }

    // Validate condition
    const validConditions = ["new", "like-new", "good", "fair", "poor"]
    if (!validConditions.includes(condition)) {
      return res.status(422).json({ message: "Invalid condition value" })
    }

    // Validate point value
    const points = Number.parseInt(pointValue)
    if (isNaN(points) || points < 1 || points > 1000) {
      return res.status(422).json({ message: "Point value must be between 1 and 1000" })
    }

    const itemId = uuidv4()

    // Create item data object
    const itemData = {
      itemId,
      userId: req.user.userId,
      categoryId,
      title,
      description,
      size,
      condition,
      color,
      brand,
      tags: Array.isArray(tags) ? tags : [],
      pointValue: points,
      status: "pending",
      isFeatured: false,
      isAvailable: true,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Create the item in MongoDB
    await mongoDb.collection("items").insertOne(itemData)

    // If images are provided, upload them
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      const imageDocuments = imageUrls.map((imageUrl, index) => ({
        imageId: uuidv4(),
        itemId,
        imageUrl,
        isPrimary: index === 0,
        uploadOrder: index,
        createdAt: new Date(),
      }))

      await mongoDb.collection("itemImages").insertMany(imageDocuments)
    }

    res.status(201).json({
      message: "Item created successfully and is pending approval",
      data: {
        itemId: itemId,
        status: "pending",
      },
    })
  } catch (error) {
    console.error("Error while creating item:", error.message)
    res.status(500).json({ message: "Server Error" })
  }
})

// User Profile endpoints
app.get("/api/users/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params

    const query = `
            SELECT user_id, email, first_name, last_name, username, phone,
                   date_of_birth, gender, address, city, state, zip_code,
                   country, profile_image, bio, points_balance, user_type,
                   is_active, email_verified, created_at, updated_at
            FROM USERS 
            WHERE user_id = $1 AND is_active = TRUE
        `

    const result = await pgClient.query(query, [user_id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    res.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error("Error getting user profile:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

app.put("/api/users/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params
    const {
      first_name,
      last_name,
      username,
      phone,
      date_of_birth,
      gender,
      address,
      city,
      state,
      zip_code,
      country,
      profile_image,
      bio,
    } = req.body

    const query = `
            UPDATE USERS 
            SET first_name = $1, last_name = $2, username = $3, phone = $4,
                date_of_birth = $5, gender = $6, address = $7, city = $8,
                state = $9, zip_code = $10, country = $11, profile_image = $12,
                bio = $13, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $14 AND is_active = TRUE
            RETURNING *
        `

    const values = [
      first_name,
      last_name,
      username,
      phone,
      date_of_birth,
      gender,
      address,
      city,
      state,
      zip_code,
      country,
      profile_image,
      bio,
      user_id,
    ]

    const result = await pgClient.query(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    res.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// User statistics
app.get("/api/users/:user_id/stats", async (req, res) => {
  try {
    const { user_id } = req.params

    // Get user basic info
    const userQuery = `
            SELECT points_balance, created_at 
            FROM USERS 
            WHERE user_id = $1
        `
    const userResult = await pgClient.query(userQuery, [user_id])

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    // Get swap statistics
    const swapQuery = `
            SELECT 
                COUNT(*) as total_swaps,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_swaps,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_swaps
            FROM SWAPS 
            WHERE requester_id = $1 OR owner_id = $1
        `
    const swapResult = await pgClient.query(swapQuery, [user_id])

    // Get item statistics from MongoDB
    const itemStats = await mongoDb
      .collection("items")
      .aggregate([
        { $match: { userId: user_id } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            approvedItems: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
            pendingItems: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            swappedItems: { $sum: { $cond: [{ $eq: ["$status", "swapped"] }, 1, 0] } },
            totalViews: { $sum: "$viewCount" },
          },
        },
      ])
      .toArray()

    const stats = {
      points_balance: userResult.rows[0].points_balance,
      member_since: userResult.rows[0].created_at,
      total_swaps: Number.parseInt(swapResult.rows[0].total_swaps),
      completed_swaps: Number.parseInt(swapResult.rows[0].completed_swaps),
      pending_swaps: Number.parseInt(swapResult.rows[0].pending_swaps),
      total_items: itemStats[0]?.totalItems || 0,
      approved_items: itemStats[0]?.approvedItems || 0,
      pending_items: itemStats[0]?.pendingItems || 0,
      swapped_items: itemStats[0]?.swappedItems || 0,
      total_views: itemStats[0]?.totalViews || 0,
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error getting user stats:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// Search items
app.get("/api/search/items", async (req, res) => {
  try {
    const {
      q,
      category_id,
      condition,
      min_points,
      max_points,
      color,
      brand,
      size,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query

    const skip = (page - 1) * limit

    // Build search filter
    const filter = {
      status: "approved",
      isAvailable: true,
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ]
    }

    if (category_id) filter.categoryId = category_id
    if (condition) filter.condition = condition
    if (color) filter.color = { $regex: color, $options: "i" }
    if (brand) filter.brand = { $regex: brand, $options: "i" }
    if (size) filter.size = { $regex: size, $options: "i" }

    if (min_points || max_points) {
      filter.pointValue = {}
      if (min_points) filter.pointValue.$gte = Number.parseInt(min_points)
      if (max_points) filter.pointValue.$lte = Number.parseInt(max_points)
    }

    // Build sort options
    let sortOptions = {}
    switch (sort) {
      case "newest":
        sortOptions = { createdAt: -1 }
        break
      case "oldest":
        sortOptions = { createdAt: 1 }
        break
      case "points_low":
        sortOptions = { pointValue: 1 }
        break
      case "points_high":
        sortOptions = { pointValue: -1 }
        break
      case "popular":
        sortOptions = { viewCount: -1 }
        break
      default:
        sortOptions = { createdAt: -1 }
    }

    const items = await mongoDb
      .collection("items")
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))
      .toArray()

    const total = await mongoDb.collection("items").countDocuments(filter)

    res.json({
      success: true,
      data: items,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error searching items:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error)
  res.status(500).json({ message: "Internal Server Error" })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Initialize databases and start server
async function startServer() {
  await initializeDatabases()

  app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...")
  if (pgClient) {
    await pgClient.end()
  }
  if (mongoDb) {
    await mongoDb.client.close()
  }
  process.exit(0)
})
