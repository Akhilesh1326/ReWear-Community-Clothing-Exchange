const connectDB = require("../connectDB")
const { v4: uuidv4 } = require("uuid")

// Get database connections
let pgClient
let mongoDb

async function initializeConnections() {
  if (!pgClient) {
    pgClient = await connectDB.connectToPostgresSQL()
  }
  if (!mongoDb) {
    mongoDb = await connectDB.connectToMongo()
  }
}

// Categories functions (PostgreSQL)
async function getAllCategories() {
  try {
    await initializeConnections()

    const query = `
            SELECT category_id, name, description, icon, is_active, created_at
            FROM categories 
            WHERE is_active = TRUE
            ORDER BY name ASC
        `

    const response = await pgClient.query(query)

    if (response.rows.length === 0) {
      return { status: 404, message: "Categories not found" }
    }

    return { status: 200, message: "Categories found", data: response.rows }
  } catch (error) {
    console.error("Error while getting all categories in controller:", error)
    return { status: 500, message: "Internal server error" }
  }
}

async function getCategoryById(id) {
  try {
    await initializeConnections()

    const query = `
            SELECT category_id, name, description, icon, is_active, created_at
            FROM categories 
            WHERE category_id = $1 AND is_active = TRUE
        `

    const response = await pgClient.query(query, [id])

    if (response.rows.length === 0) {
      return { status: 404, message: "No category found by id" }
    }

    return { status: 200, message: "Category found", data: response.rows[0] }
  } catch (error) {
    console.error("Error getting category by id in controller:", error)
    return { status: 500, message: "Internal server error" }
  }
}

// Listings functions (MongoDB)
async function getAllListings(categoryId) {
  try {
    await initializeConnections()

    const filter = {
      status: "approved",
      isAvailable: true,
    }

    if (categoryId) {
      filter.categoryId = categoryId
    }

    const listings = await mongoDb.collection("items").find(filter).sort({ createdAt: -1 }).toArray()

    if (listings.length === 0) {
      return { status: 404, message: "Listings not found" }
    }

    // Get images for each listing
    const listingsWithImages = await Promise.all(
      listings.map(async (listing) => {
        const images = await mongoDb
          .collection("itemImages")
          .find({ itemId: listing.itemId })
          .sort({ uploadOrder: 1 })
          .toArray()
        return { ...listing, images }
      }),
    )

    return { status: 200, message: "Listings found", data: listingsWithImages }
  } catch (error) {
    console.error("Error while getting all listings:", error)
    return { status: 500, message: "Internal server error" }
  }
}

async function getListingById(itemId) {
  try {
    await initializeConnections()

    if (!itemId || typeof itemId !== "string") {
      return { status: 400, message: "Invalid item ID" }
    }

    const listing = await mongoDb.collection("items").findOne({
      itemId: itemId,
      status: "approved",
      isAvailable: true,
    })

    if (!listing) {
      return { status: 404, message: "Listing not found" }
    }

    // Get item images
    const images = await mongoDb.collection("itemImages").find({ itemId: itemId }).sort({ uploadOrder: 1 }).toArray()

    // Get owner information from PostgreSQL
    const ownerQuery = `
            SELECT user_id, first_name, last_name, username, profile_image
            FROM users 
            WHERE user_id = $1 AND is_active = TRUE
        `
    const ownerResult = await pgClient.query(ownerQuery, [listing.userId])

    // Get category information from PostgreSQL
    const categoryQuery = `
            SELECT category_id, name, icon
            FROM categories 
            WHERE category_id = $1 AND is_active = TRUE
        `
    const categoryResult = await pgClient.query(categoryQuery, [listing.categoryId])

    // Increment view count
    await mongoDb.collection("items").updateOne({ itemId: itemId }, { $inc: { viewCount: 1 } })

    const listingData = {
      ...listing,
      images,
      owner: ownerResult.rows[0] || null,
      category: categoryResult.rows[0] || null,
    }

    return { status: 200, message: "Listing found", data: listingData }
  } catch (error) {
    console.error("Error getting listing by ID:", error)
    return { status: 500, message: "Internal server error" }
  }
}

// User functions
async function createUser(username, email, password, firstname, lastname) {
  try {
    await initializeConnections()

    // Check if user already exists
    const checkQuery = `
            SELECT user_id FROM users 
            WHERE username = $1 OR email = $2
        `
    const existingUser = await pgClient.query(checkQuery, [username, email])

    if (existingUser.rows.length > 0) {
      return { status: 409, message: "User already exists with this username or email" }
    }

    // Hash password (you should use bcrypt in production)
    // const hashedPassword = await bcrypt.hash(password, 10);

    const userId = uuidv4()
    const insertQuery = `
            INSERT INTO users (user_id, username, email, password, first_name, last_name, points_balance, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, 100, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING user_id, username, email, first_name, last_name
        `

    const result = await pgClient.query(insertQuery, [userId, username, email, password, firstname, lastname])

    return {
      status: 201,
      message: "User created successfully",
      data: { userid: result.rows[0].user_id, username: result.rows[0].username },
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return { status: 500, message: "Internal server error" }
  }
}

async function logUser(username, password) {
  try {
    await initializeConnections()

    const query = `
            SELECT user_id, username, email, first_name, last_name, password
            FROM users 
            WHERE username = $1 AND is_active = TRUE
        `

    const result = await pgClient.query(query, [username])

    if (result.rows.length === 0) {
      return { status: 404, message: "User not found" }
    }

    const user = result.rows[0]

    // In production, use bcrypt.compare(password, user.password)
    if (password !== user.password) {
      return { status: 401, message: "Invalid credentials" }
    }

    return {
      status: 200,
      message: "Login successful",
      data: [{ user_id: user.user_id, username: user.username }],
    }
  } catch (error) {
    console.error("Error logging user:", error)
    return { status: 500, message: "Internal server error" }
  }
}

async function createItem(itemData) {
  try {
    await initializeConnections()

    const itemId = uuidv4()

    const newItem = {
      itemId,
      userId: itemData.userId,
      categoryId: itemData.categoryId,
      title: itemData.title,
      description: itemData.description,
      size: itemData.size || null,
      condition: itemData.condition,
      color: itemData.color || null,
      brand: itemData.brand || null,
      tags: itemData.tags || [],
      pointValue: itemData.pointValue,
      status: "pending",
      isFeatured: false,
      isAvailable: true,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await mongoDb.collection("items").insertOne(newItem)

    return {
      status: 201,
      message: "Item created successfully",
      data: { itemId, status: "pending" },
    }
  } catch (error) {
    console.error("Error creating item:", error)
    return { status: 500, message: "Internal server error" }
  }
}

async function createItemImages(itemId, imageUrls) {
  try {
    await initializeConnections()

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return { status: 400, message: "No images provided" }
    }

    const imageDocuments = imageUrls.map((imageUrl, index) => ({
      imageId: uuidv4(),
      itemId,
      imageUrl,
      isPrimary: index === 0,
      uploadOrder: index,
      createdAt: new Date(),
    }))

    await mongoDb.collection("itemImages").insertMany(imageDocuments)

    return {
      status: 201,
      message: "Images uploaded successfully",
      data: { count: imageDocuments.length },
    }
  } catch (error) {
    console.error("Error creating item images:", error)
    return { status: 500, message: "Internal server error" }
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  getAllListings,
  getListingById,
  createUser,
  logUser,
  createItem,
  createItemImages,
}
