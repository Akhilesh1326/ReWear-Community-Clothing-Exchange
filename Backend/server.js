const express = require("express")
const PORT = process.env.PORT || 8000;
const ConnectDB = require("./ConnectDB");
const cors = require('cors');
const bodyParser = require('body-parser')
require('dotenv').config();

// JWT related imports
const cookieParser = require('cookie-parser');
const http = require('http');
const jwt = require('jsonwebtoken');

// Server by express
const app = express()

// cors policy
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE'],
    credentials: true
}));
 
// Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// Connection of Databases as Postgre and MongoDB
ConnectDB.connectToPostgresSQL();
ConnectDB.connectToMongo();

const {createUser, createItem, createItemImages,
    logUser} = require("./Controllers/userController");


const authenticateToken = (req, res, next) => {
    const token = req.cookies.userCookie;
    
    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
};

app.get("/", (req, res)=>{
    res.json({message:"Hello from ReWear server you've reahed the start api"})
})


// API call for registering new user
app.post('/api/register', async(req, res)=>{
    const {username, email, password, firstname, lastname} = req.body;
    console.log("user came")
    if(!username) return res.status(422).json({message:"Username is missing"});
    if(!email) return res.status(422).json({message:"email is missing"});
    if(!password) return res.status(422).json({message:"password is missing"});
    if(!firstname) return res.status(422).json({message:"firstname is missing"});
    if(!lastname) return res.status(422).json({message:"lastname is missing"});
    
    try {
        const DB_res = await createUser(username, email, password, firstname, lastname);

        if(DB_res.status == 201){
            const token = jwt.sign({
                userId: DB_res.data.userid,
                username: DB_res.data.username
            }, process.env.JWT_SECRET);
            res.cookie('userCookie', token);
            res.status(200).json({message:"registration successful"});
        }
        else{
            res.status(DB_res.status).json({message:DB_res.message});
        }
    } catch (error) {
        console.log("Error while registering user", error.message);
        res.status(500).json({message:"Server Error"});
    }
});


app.post('/api/login', async(req, res) => {
    try {
        const {username, password} = req.body;
        console.log(username, password);
        if(!username) return res.status(422).json({message:"Username is missing"});
        if(!password) return res.status(422).json({message:"password is missing"});
        
        const DB_res = await logUser(username, password);
        console.log(DB_res.data[0].user_id)
        console.log(DB_res.data[0].username)
        
        if(DB_res.status == 200){
            const token = jwt.sign({
                userId: DB_res.data[0].user_id,
                username: DB_res.data[0].username
            }, process.env.JWT_SECRET);
            res.cookie('userCookie', token);
            res.status(200).json({message:"registration successful"});
        }
        else if(DB_res.status == 404){
            res.status(DB_res.status).json({message:DB_res.message});
        }
        else{
            res.status(DB_res.status).json({message:DB_res.message});
        }

    } catch (error) {
        console.log("Error while loggin user = ",error);
        res.status(500).json({message:"Server Error"})
    }
})

// Listing realted api calls
app.get("/api/categories", async(req, res)=>{
    try {
        const db_resp = await getAllCategories();
        if(db_resp.status == 200) return res.status(db_resp.status).json({message: db_resp.message, data: db_resp.data});
        
        res.status(db_resp.status).json({message: db_resp.message});
    } catch (error) {
        console.log("error in server for getting all categories ", error);
        res.status(500).json({message:"Internal Server Error"});
    }
});

app.get("/api/category/:id", async(req,res)=>{
    try {
        const id = parseInt(req.params.id);

        if(isNaN(id)){
            return res.status(400).json({message:"Invalid category Id"});
        }

        const DB_res = await getCategoryById(id);

        if(DB_res.status == 200) return res.status(DB_res.status).json({message: DB_res.message, data: DB_res.data});
        res.status(DB_res.status).json({message: DB_res.message});

    } catch (error) {
        console.log("Error in server for getting category by id");
        res.status(500).json({message:"Internal server error"});
    }
})

app.get("/api/listing/:itemId", async (req, res) => {
    try {
        const itemId = req.params.itemId;

        if (!itemId || typeof itemId !== "string") {
            return res.status(400).json({ message: "Invalid item ID" });
        }

        const DB_res = await getListingById(itemId);

        if (DB_res.status === 200)
            return res.status(DB_res.status).json({ message: DB_res.message, data: DB_res.data });

        res.status(DB_res.status).json({ message: DB_res.message });

    } catch (error) {
        console.error("Error in server for getting listing by itemId:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/api/listings/:categoryId", async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        if (!categoryId || typeof categoryId !== "string") {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        const DB_res = await getAllListings(categoryId);

        if (DB_res.status === 200) {
            return res.status(DB_res.status).json({
                message: DB_res.message,
                data: DB_res.data
            });
        }

        return res.status(DB_res.status).json({ message: DB_res.message });

    } catch (error) {
        console.error("Error in server for getting listings by categoryId:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.post('/api/items', authenticateToken, async (req, res) => {
    const {
        categoryId,
        title,
        description,
        size,
        condition,
        color,
        brand,
        tags,
        pointValue,
        imageUrls
    } = req.body;

    console.log("New item creation request received");

    // Validation
    if (!categoryId) return res.status(422).json({ message: "Category ID is missing" });
    if (!title) return res.status(422).json({ message: "Title is missing" });
    if (!description) return res.status(422).json({ message: "Description is missing" });
    if (!condition) return res.status(422).json({ message: "Condition is missing" });
    if (!pointValue) return res.status(422).json({ message: "Point value is missing" });

    // Validate title length
    if (title.length < 5 || title.length > 100) {
        return res.status(422).json({ message: "Title must be between 5 and 100 characters" });
    }

    // Validate description length
    if (description.length < 10 || description.length > 1000) {
        return res.status(422).json({ message: "Description must be between 10 and 1000 characters" });
    }

    // Validate condition
    const validConditions = ["new", "like-new", "good", "fair", "poor"];
    if (!validConditions.includes(condition)) {
        return res.status(422).json({ message: "Invalid condition value" });
    }

    // Validate point value
    const points = parseInt(pointValue);
    if (isNaN(points) || points < 1 || points > 1000) {
        return res.status(422).json({ message: "Point value must be between 1 and 1000" });
    }

    try {
        // Create item data object
        const itemData = {
            userId: req.user.userId,
            categoryId,
            title,
            description,
            size,
            condition,
            color,
            brand,
            tags: Array.isArray(tags) ? tags : [],
            pointValue: points
        };

        // Create the item
        const DB_res = await createItem(itemData);

        if (DB_res.status === 201) {
            // If images are provided, upload them
            if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
                const imageRes = await createItemImages(DB_res.data.itemId, imageUrls);
                
                if (imageRes.status !== 201) {
                    console.warn("Item created but images failed to upload:", imageRes.message);
                }
            }

            res.status(201).json({
                message: "Item created successfully and is pending approval",
                data: {
                    itemId: DB_res.data.itemId,
                    status: DB_res.data.status
                }
            });
        } else {
            res.status(DB_res.status).json({ message: DB_res.message });
        }

    } catch (error) {
        console.error("Error while creating item:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
});


// UserProfile

// GET /api/users/:user_id - Get user profile
app.get('/api/users/:user_id',async (req, res) => {
    const { user_id } = req.params;
    
    const query = `
        SELECT user_id, email, first_name, last_name, username, phone, 
               date_of_birth, gender, address, city, state, zip_code, 
               country, profile_image, bio, points_balance, user_type,
               is_active, email_verified, created_at, updated_at
        FROM USERS 
        WHERE user_id = $1 AND is_active = TRUE
    `;
    
    const result = await pgPool.query(query, [user_id]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    
    res.json({
        success: true,
        data: result.rows[0]
    });
});

// PUT /api/users/:user_id - Update user profile
app.put('/api/users/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const {
        first_name, last_name, username, phone, date_of_birth,
        gender, address, city, state, zip_code, country,
        profile_image, bio
    } = req.body;
    
    const query = `
        UPDATE USERS 
        SET first_name = $1, last_name = $2, username = $3, phone = $4,
            date_of_birth = $5, gender = $6, address = $7, city = $8,
            state = $9, zip_code = $10, country = $11, profile_image = $12,
            bio = $13, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $14 AND is_active = TRUE
        RETURNING *
    `;
    
    const values = [
        first_name, last_name, username, phone, date_of_birth,
        gender, address, city, state, zip_code, country,
        profile_image, bio, user_id
    ];
    
    const result = await pgPool.query(query, values);
    
    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    
    res.json({
        success: true,
        data: result.rows[0]
    });
});

// GET /api/users/:user_id/stats - Get user statistics
app.get('/api/users/:user_id/stats',async (req, res) => {
    const { user_id } = req.params;
    
    // Get user basic info
    const userQuery = `
        SELECT points_balance, created_at 
        FROM USERS 
        WHERE user_id = $1
    `;
    const userResult = await pgPool.query(userQuery, [user_id]);
    
    if (userResult.rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    
    // Get swap statistics
    const swapQuery = `
        SELECT 
            COUNT(*) as total_swaps,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_swaps,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_swaps
        FROM SWAPS 
        WHERE requester_id = $1 OR owner_id = $1
    `;
    const swapResult = await pgPool.query(swapQuery, [user_id]);
    
    // Get item statistics from MongoDB
    const itemStats = await db.collection('items').aggregate([
        { $match: { userId: user_id } },
        {
            $group: {
                _id: null,
                totalItems: { $sum: 1 },
                approvedItems: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
                pendingItems: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                swappedItems: { $sum: { $cond: [{ $eq: ['$status', 'swapped'] }, 1, 0] } },
                totalViews: { $sum: '$viewCount' }
            }
        }
    ]).toArray();
    
    const stats = {
        points_balance: userResult.rows[0].points_balance,
        member_since: userResult.rows[0].created_at,
        total_swaps: parseInt(swapResult.rows[0].total_swaps),
        completed_swaps: parseInt(swapResult.rows[0].completed_swaps),
        pending_swaps: parseInt(swapResult.rows[0].pending_swaps),
        total_items: itemStats[0]?.totalItems || 0,
        approved_items: itemStats[0]?.approvedItems || 0,
        pending_items: itemStats[0]?.pendingItems || 0,
        swapped_items: itemStats[0]?.swappedItems || 0,
        total_views: itemStats[0]?.totalViews || 0
    };
    
    res.json({
        success: true,
        data: stats
    });
});

// =============================================================================
// ITEMS ROUTES
// =============================================================================

// GET /api/users/:user_id/items - Get user's items
app.get('/api/users/:user_id/items', async (req, res) => {
    const { user_id } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    const filter = { userId: user_id };
    
    if (status) {
        filter.status = status;
    }
    
    const items = await db.collection('items')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();
    
    // Get images for each item
    const itemsWithImages = await Promise.all(
        items.map(async (item) => {
            const images = await db.collection('itemImages')
                .find({ itemId: item.itemId })
                .sort({ uploadOrder: 1 })
                .toArray();
            return { ...item, images };
        })
    );
    
    const total = await db.collection('items').countDocuments(filter);
    
    res.json({
        success: true,
        data: itemsWithImages,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// GET /api/items/:item_id - Get specific item
app.get('/api/items/:item_id', async (req, res) => {
    const { item_id } = req.params;
    
    const item = await db.collection('items').findOne({ itemId: item_id });
    
    if (!item) {
        return res.status(404).json({
            success: false,
            error: 'Item not found'
        });
    }
    
    // Get item images
    const images = await db.collection('itemImages')
        .find({ itemId: item_id })
        .sort({ uploadOrder: 1 })
        .toArray();
    
    // Get owner information
    const ownerQuery = `
        SELECT user_id, first_name, last_name, username, profile_image
        FROM USERS 
        WHERE user_id = $1
    `;
    const ownerResult = await pgPool.query(ownerQuery, [item.userId]);
    
    // Get category information
    const categoryQuery = `
        SELECT category_id, name, icon
        FROM CATEGORIES 
        WHERE category_id = $1
    `;
    const categoryResult = await pgPool.query(categoryQuery, [item.categoryId]);
    
    // Increment view count
    await db.collection('items').updateOne(
        { itemId: item_id },
        { $inc: { viewCount: 1 } }
    );
    
    res.json({
        success: true,
        data: {
            ...item,
            images,
            owner: ownerResult.rows[0] || null,
            category: categoryResult.rows[0] || null
        }
    });
});

// POST /api/items - Create new item
app.post('/api/items', async (req, res) => {
    const {
        userId, categoryId, title, description, size, condition,
        color, brand, tags, pointValue, images
    } = req.body;
    
    // Validation
    if (!userId || !categoryId || !title || !description || !pointValue) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }
    
    const itemId = uuidv4();
    
    // Create item in MongoDB
    const newItem = {
        itemId,
        userId,
        categoryId,
        title,
        description,
        size,
        condition,
        color,
        brand,
        tags: tags || [],
        pointValue: parseInt(pointValue),
        status: 'pending',
        isFeatured: false,
        isAvailable: true,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    await db.collection('items').insertOne(newItem);
    
    // Add images if provided
    if (images && images.length > 0) {
        const imageDocuments = images.map((image, index) => ({
            imageId: uuidv4(),
            itemId,
            imageUrl: image.url,
            isPrimary: index === 0,
            uploadOrder: index,
            createdAt: new Date()
        }));
        
        await db.collection('itemImages').insertMany(imageDocuments);
    }
    
    res.status(201).json({
        success: true,
        data: { itemId }
    });
});

// PUT /api/items/:item_id - Update item
app.put('/api/items/:item_id', async (req, res) => {
    const { item_id } = req.params;
    const {
        title, description, size, condition, color, brand,
        tags, pointValue, isAvailable, isFeatured
    } = req.body;
    
    const updateData = {
        title,
        description,
        size,
        condition,
        color,
        brand,
        tags,
        pointValue: pointValue ? parseInt(pointValue) : undefined,
        isAvailable,
        isFeatured,
        updatedAt: new Date()
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });
    
    const result = await db.collection('items').updateOne(
        { itemId: item_id },
        { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
        return res.status(404).json({
            success: false,
            error: 'Item not found'
        });
    }
    
    res.json({
        success: true,
        message: 'Item updated successfully'
    });
});

// =============================================================================
// SWAPS ROUTES
// =============================================================================

// GET /api/users/:user_id/swaps - Get user's swaps
app.get('/api/users/:user_id/swaps', async (req, res) => {
    const { user_id } = req.params;
    const { status, type, page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = `WHERE (requester_id = $1 OR owner_id = $1)`;
    const values = [user_id];
    let paramCount = 1;
    
    if (status) {
        whereClause += ` AND status = $${++paramCount}`;
        values.push(status);
    }
    
    if (type) {
        whereClause += ` AND swap_type = $${++paramCount}`;
        values.push(type);
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
    `;
    
    values.push(parseInt(limit), offset);
    
    const result = await pgPool.query(query, values);
    
    // Get item details for each swap
    const swapsWithItems = await Promise.all(
        result.rows.map(async (swap) => {
            const item = await db.collection('items').findOne(
                { itemId: swap.item_id },
                { projection: { title: 1, pointValue: 1 } }
            );
            
            const primaryImage = await db.collection('itemImages').findOne(
                { itemId: swap.item_id, isPrimary: true },
                { projection: { imageUrl: 1 } }
            );
            
            return {
                ...swap,
                item: {
                    ...item,
                    primaryImage: primaryImage?.imageUrl || null
                }
            };
        })
    );
    
    res.json({
        success: true,
        data: swapsWithItems
    });
});

// POST /api/swaps - Create new swap
app.post('/api/swaps', async (req, res) => {
    const client = await pgPool.connect();
    
    try {
        await client.query('BEGIN');
        
        const {
            requester_id, owner_id, item_id, swap_type, message, points_used
        } = req.body;
        
        // Validation
        if (!requester_id || !owner_id || !item_id || !swap_type) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        // Check if item is available
        const item = await db.collection('items').findOne({
            itemId: item_id,
            isAvailable: true,
            status: 'approved'
        });
        
        if (!item) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                error: 'Item not available for swap'
            });
        }
        
        // Check if requester has enough points (for point-based swaps)
        if (swap_type === 'points' && points_used) {
            const userQuery = `SELECT points_balance FROM USERS WHERE user_id = $1`;
            const userResult = await client.query(userQuery, [requester_id]);
            
            if (userResult.rows[0].points_balance < points_used) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    error: 'Insufficient points'
                });
            }
        }
        
        // Create swap
        const swapId = uuidv4();
        const swapQuery = `
            INSERT INTO SWAPS (swap_id, requester_id, owner_id, item_id, swap_type, message, points_used)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const swapResult = await client.query(swapQuery, [
            swapId, requester_id, owner_id, item_id, swap_type, message, points_used
        ]);
        
        // Create notification for owner
        const notificationId = uuidv4();
        await db.collection('notifications').insertOne({
            notificationId,
            userId: owner_id,
            title: 'New Swap Request',
            message: `Someone wants to swap for your item: ${item.title}`,
            type: 'swap_request',
            isRead: false,
            createdAt: new Date()
        });
        
        await client.query('COMMIT');
        
        res.status(201).json({
            success: true,
            data: swapResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
});

// PUT /api/swaps/:swap_id - Update swap status
app.put('/api/swaps/:swap_id', async (req, res) => {
    const client = await pgPool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { swap_id } = req.params;
        const { status, user_id } = req.body;
        
        // Validation
        if (!status || !user_id) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        // Get swap details
        const swapQuery = `SELECT * FROM SWAPS WHERE swap_id = $1`;
        const swapResult = await client.query(swapQuery, [swap_id]);
        
        if (swapResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                error: 'Swap not found'
            });
        }
        
        const swap = swapResult.rows[0];
        
        // Authorization check
        if (status === 'accepted' || status === 'rejected') {
            if (user_id !== swap.owner_id) {
                await client.query('ROLLBACK');
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized'
                });
            }
        } else if (status === 'cancelled') {
            if (user_id !== swap.requester_id) {
                await client.query('ROLLBACK');
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized'
                });
            }
        }
        
        // Update swap status
        const updateQuery = `
            UPDATE SWAPS 
            SET status = $1, updated_at = CURRENT_TIMESTAMP,
                completed_at = CASE WHEN $1 = 'accepted' THEN CURRENT_TIMESTAMP ELSE completed_at END
            WHERE swap_id = $2
            RETURNING *
        `;
        
        const updateResult = await client.query(updateQuery, [status, swap_id]);
        
        if (status === 'accepted') {
            // Handle point transaction
            if (swap.swap_type === 'points' && swap.points_used) {
                // Deduct points from requester
                await client.query(
                    `UPDATE USERS SET points_balance = points_balance - $1 WHERE user_id = $2`,
                    [swap.points_used, swap.requester_id]
                );
                
                // Add points to owner
                await client.query(
                    `UPDATE USERS SET points_balance = points_balance + $1 WHERE user_id = $2`,
                    [swap.points_used, swap.owner_id]
                );
            }
            
            // Mark item as swapped
            await db.collection('items').updateOne(
                { itemId: swap.item_id },
                { $set: { status: 'swapped', isAvailable: false, updatedAt: new Date() } }
            );
        }
        
        await client.query('COMMIT');
        
        res.json({
            success: true,
            data: updateResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
});

// =============================================================================
// NOTIFICATIONS ROUTES
// =============================================================================

// GET /api/users/:user_id/notifications - Get user notifications
app.get('/api/users/:user_id/notifications', async (req, res) => {
    const { user_id } = req.params;
    const { page = 1, limit = 20, unread_only = false } = req.query;
    
    const skip = (page - 1) * limit;
    const filter = { userId: user_id };
    
    if (unread_only === 'true') {
        filter.isRead = false;
    }
    
    const notifications = await db.collection('notifications')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();
    
    const total = await db.collection('notifications').countDocuments(filter);
    const unreadCount = await db.collection('notifications').countDocuments({
        userId: user_id,
        isRead: false
    });
    
    res.json({
        success: true,
        data: notifications,
        unreadCount,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// PUT /api/notifications/:notification_id - Mark notification as read
app.put('/api/notifications/:notification_id', async (req, res) => {
    const { notification_id } = req.params;
    
    const result = await db.collection('notifications').updateOne(
        { notificationId: notification_id },
        { $set: { isRead: true } }
    );
    
    if (result.matchedCount === 0) {
        return res.status(404).json({
            success: false,
            error: 'Notification not found'
        });
    }
    
    res.json({
        success: true,
        message: 'Notification marked as read'
    });
});

// =============================================================================
// CATEGORIES ROUTES
// =============================================================================

// GET /api/categories - Get all categories
app.get('/api/categories', async (req, res) => {
    const { active_only = true } = req.query;
    
    let whereClause = '';
    if (active_only === 'true') {
        whereClause = 'WHERE is_active = TRUE';
    }
    
    const query = `
        SELECT category_id, name, description, icon, is_active, created_at
        FROM CATEGORIES
        ${whereClause}
        ORDER BY name ASC
    `;
    
    const result = await pgPool.query(query);
    
    res.json({
        success: true,
        data: result.rows
    });
});

// POST /api/categories - Create new category
app.post('/api/categories', async (req, res) => {
    const { name, description, icon } = req.body;
    
    if (!name) {
        return res.status(400).json({
            success: false,
            error: 'Category name is required'
        });
    }
    
    const categoryId = uuidv4();
    const query = `
        INSERT INTO CATEGORIES (category_id, name, description, icon)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    
    const result = await pgPool.query(query, [categoryId, name, description, icon]);
    
    res.status(201).json({
        success: true,
        data: result.rows[0]
    });
});

// =============================================================================
// SEARCH ROUTES
// =============================================================================

// GET /api/search/items - Search items
app.get('/api/search/items', async (req, res) => {
    const {
        q, category_id, condition, min_points, max_points,
        color, brand, size, page = 1, limit = 20, sort = 'newest'
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build search filter
    const filter = {
        status: 'approved',
        isAvailable: true
    };
    
    if (q) {
        filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
        ];
    }
    
    if (category_id) filter.categoryId = category_id;
    if (condition) filter.condition = condition;
    if (color) filter.color = { $regex: color, $options: 'i' };
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (size) filter.size = { $regex: size, $options: 'i' };
    
    if (min_points || max_points) {
        filter.pointValue = {};
        if (min_points) filter.pointValue.$gte = parseInt(min_points);
        if (max_points) filter.pointValue.$lte = parseInt(max_points);
    }
    
    // Build sort options
    let sortOptions = {};
    switch (sort) {
        case 'newest':
            sortOptions = { createdAt: -1 };
            break;
        case 'oldest':
            sortOptions = { createdAt: 1 };
            break;
        case 'points_low':
            sortOptions = { pointValue: 1 };
            break;
        case 'points_high':
            sortOptions = { pointValue: -1 };
            break;
        case 'popular':
            sortOptions = { viewCount: -1 };
            break;
        default:
            sortOptions = { createdAt: -1 };
    }
    
    const items = await db.collection('items')
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();
    
    const total = await db.collection('items').countDocuments(filter);
    
    res.json({
        success: true,
        data: items,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});


app.listen(PORT, ()=>console.log("Server started at ", PORT));
