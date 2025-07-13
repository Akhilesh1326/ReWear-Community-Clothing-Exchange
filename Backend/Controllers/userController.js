const connectDB = require("../connectDB")
const { v4: uuidv4 } = require("uuid")
const bcrypt = require("bcrypt")

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

    // Hash the password for security
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Generate UUID for user
    const userId = uuidv4()

    const query = `
            INSERT INTO users(user_id, username, email, password_hash, first_name, last_name, points_balance, is_active, created_at, updated_at) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
            RETURNING user_id, username, email, first_name, last_name, points_balance, created_at
        `

    const values = [userId, username, email, hashedPassword, firstname, lastname, 100, true]

    const response = await pgClient.query(query, values)

    return {
      status: 201,
      message: "User registered successfully",
      data: {
        userid: response.rows[0].user_id,
        username: response.rows[0].username,
        email: response.rows[0].email,
        firstname: response.rows[0].first_name,
        lastname: response.rows[0].last_name,
        points_balance: response.rows[0].points_balance,
      },
    }
  } catch (error) {
    console.error("Error occurred in create new user in controller:", error)

    // Handle duplicate key error (username or email already exists)
    if (error.code === "23505") {
      if (error.constraint?.includes("username")) {
        return { status: 409, message: "Username is already taken" }
      } else if (error.constraint?.includes("email")) {
        return { status: 409, message: "Email is already registered" }
      }
      return { status: 409, message: "Username or email is already present" }
    }

    // Handle other constraint violations
    if (error.code === "23502") {
      return { status: 400, message: "Missing required fields" }
    }

    return { status: 500, message: "Internal server error" }
  }
}

async function logUser(username, password) {
  try {
    await initializeConnections()

    const query = `
            SELECT user_id, username, email, password_hash, first_name, last_name, points_balance, is_active
            FROM users 
            WHERE username = $1 AND is_active = TRUE
        `

    const response = await pgClient.query(query, [username])

    if (response.rows.length === 0) {
      return { status: 404, message: "User not found" }
    }

    const user = response.rows[0]

    // Check if account is active
    if (!user.is_active) {
      return { status: 403, message: "Account is deactivated" }
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return { status: 401, message: "Invalid credentials" }
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user

    return {
      status: 200,
      message: "Login successful",
      data: [userWithoutPassword],
    }
  } catch (error) {
    console.error("Error while logging user in controller:", error)
    return { status: 500, message: "Internal server error" }
  }
}

async function createItem(itemData) {
  try {
    await initializeConnections()

    // Validate required fields
    if (!itemData.userId || !itemData.categoryId || !itemData.title || !itemData.description || !itemData.pointValue) {
      return {
        status: 400,
        message: "Missing required fields: userId, categoryId, title, description, pointValue",
      }
    }

    // Validate point value
    const pointValue = Number.parseInt(itemData.pointValue)
    if (isNaN(pointValue) || pointValue < 1 || pointValue > 1000) {
      return {
        status: 400,
        message: "Point value must be a number between 1 and 1000",
      }
    }

    // Generate UUID for the item
    const itemId = uuidv4()

    // Prepare item document
    const newItem = {
      itemId: itemId,
      userId: itemData.userId,
      categoryId: itemData.categoryId,
      title: itemData.title.trim(),
      description: itemData.description.trim(),
      size: itemData.size || null,
      condition: itemData.condition,
      color: itemData.color || null,
      brand: itemData.brand || null,
      tags: Array.isArray(itemData.tags) ? itemData.tags : [],
      pointValue: pointValue,
      status: "pending", // New items start as pending
      isFeatured: false,
      isAvailable: true,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
    }

    // Insert the item into MongoDB
    const result = await mongoDb.collection("items").insertOne(newItem)

    if (result.insertedId) {
      return {
        status: 201,
        message: "Item created successfully and is pending approval",
        data: {
          itemId: itemId,
          status: "pending",
        },
      }
    } else {
      return {
        status: 500,
        message: "Failed to create item",
      }
    }
  } catch (error) {
    console.error("Error while creating item:", error)

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      return {
        status: 400,
        message: "Validation error: " + error.message,
      }
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return {
        status: 409,
        message: "Item with this ID already exists",
      }
    }

    return {
      status: 500,
      message: "Internal server error",
    }
  }
}

async function createItemImages(itemId, imageUrls) {
  try {
    await initializeConnections()

    // Validate inputs
    if (!itemId) {
      return {
        status: 400,
        message: "Item ID is required",
      }
    }

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return {
        status: 400,
        message: "At least one image URL is required",
      }
    }

    // Validate image URLs
    const validUrls = imageUrls.filter((url) => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    })

    if (validUrls.length === 0) {
      return {
        status: 400,
        message: "No valid image URLs provided",
      }
    }

    // Check if item exists
    const itemExists = await mongoDb.collection("items").findOne({ itemId: itemId })
    if (!itemExists) {
      return {
        status: 404,
        message: "Item not found",
      }
    }

    // Check if images already exist for this item
    const existingImages = await mongoDb.collection("itemImages").countDocuments({ itemId: itemId })

    const imageDocuments = validUrls.map((url, index) => ({
      imageId: uuidv4(),
      itemId: itemId,
      imageUrl: url,
      isPrimary: existingImages === 0 && index === 0, // First image is primary only if no existing images
      uploadOrder: existingImages + index,
      createdAt: new Date(),
    }))

    const result = await mongoDb.collection("itemImages").insertMany(imageDocuments)

    if (result.insertedCount === validUrls.length) {
      return {
        status: 201,
        message: "Images uploaded successfully",
        data: {
          imagesCount: result.insertedCount,
          skippedUrls: imageUrls.length - validUrls.length,
        },
      }
    } else {
      return {
        status: 500,
        message: "Failed to upload some images",
      }
    }
  } catch (error) {
    console.error("Error while creating item images:", error)
    return {
      status: 500,
      message: "Internal server error",
    }
  }
}

// Additional helper functions
async function getUserById(userId) {
  try {
    await initializeConnections()

    const query = `
            SELECT user_id, username, email, first_name, last_name, points_balance, 
                   profile_image, bio, created_at, is_active
            FROM users 
            WHERE user_id = $1 AND is_active = TRUE
        `

    const response = await pgClient.query(query, [userId])

    if (response.rows.length === 0) {
      return { status: 404, message: "User not found" }
    }

    return {
      status: 200,
      message: "User found",
      data: response.rows[0],
    }
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return { status: 500, message: "Internal server error" }
  }
}

async function updateUserPoints(userId, pointsChange, operation = "add") {
  try {
    await initializeConnections()

    const operator = operation === "add" ? "+" : "-"
    const query = `
            UPDATE users 
            SET points_balance = points_balance ${operator} $1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2 AND is_active = TRUE
            RETURNING points_balance
        `

    const response = await pgClient.query(query, [Math.abs(pointsChange), userId])

    if (response.rows.length === 0) {
      return { status: 404, message: "User not found" }
    }

    return {
      status: 200,
      message: "Points updated successfully",
      data: { newBalance: response.rows[0].points_balance },
    }
  } catch (error) {
    console.error("Error updating user points:", error)
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
  getUserById,
  updateUserPoints,
}
