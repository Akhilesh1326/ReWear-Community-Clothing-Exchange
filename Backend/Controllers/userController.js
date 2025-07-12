const connectDB = require('../connectDB');
const { v4: uuidv4 } = require('uuid');
const client = connectDB.connectToPostgresSQL();

async function createUser(username, email, password, firstname, lastname) {
    try {
        const response = await client.query(`INSERT INTO users(username, email, password_hash, first_name, last_name) VALUES($1,$2,$3,$4,$5) RETURNING *`,[username, email, password, firstname, lastname]);
        return {status : 201, message: "user registered", data: response.rows[0]};
    } catch (error) {
        if(error.code == 23505){
            console.log("Error occured because of username repeation");
            return{status: 409, message: "username or email is already present"};
        }
        console.log("Error occured in create new user in controller",error);
        return {status: 400, message : "User register error occured"};
    }
};

async function logUser(username, password) {
    try {
        const response = await client.query(`SELECT * FROM users WHERE username = $1 and password_hash = $2`,[username, password])
        if(response.rows.length == 0){
            return {status:404, message: "No user found"};
        }
        console.log(response.rows)
        return {status: 200, message: "UserFound", data: response.rows};
    } catch (error) {
        console.log("error while logging user in controller = ",error);
        return {status: 500, message: "Internal server error"};
    }
    
}

async function createItem(itemData) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const itemsCollection = db.collection("items");

        // Generate UUID for the item
        const itemId = uuidv4();
        
        // Prepare item document
        const newItem = {
            itemId: itemId,
            userId: itemData.userId,
            categoryId: itemData.categoryId,
            title: itemData.title,
            description: itemData.description,
            size: itemData.size || null,
            condition: itemData.condition,
            color: itemData.color || null,
            brand: itemData.brand || null,
            tags: itemData.tags || [],
            pointValue: parseInt(itemData.pointValue),
            status: "pending", // New items start as pending
            isFeatured: false,
            isAvailable: true,
            viewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            approvedAt: null,
            approvedBy: null
        };

        // Insert the item
        const result = await itemsCollection.insertOne(newItem);

        if (result.insertedId) {
            return {
                status: 201,
                message: "Item created successfully",
                data: {
                    itemId: itemId,
                    status: "pending"
                }
            };
        } else {
            return {
                status: 500,
                message: "Failed to create item"
            };
        }

    } catch (error) {
        console.error("Error while creating item:", error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return {
                status: 400,
                message: "Validation error: " + error.message
            };
        }

        return {
            status: 500,
            message: "Internal server error"
        };
    } finally {
        await client.close();
    }
}

async function createItemImages(itemId, imageUrls) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const itemImagesCollection = db.collection("itemImages");

        const imageDocuments = imageUrls.map((url, index) => ({
            imageId: uuidv4(),
            itemId: itemId,
            imageUrl: url,
            isPrimary: index === 0, // First image is primary
            uploadOrder: index + 1,
            createdAt: new Date()
        }));

        const result = await itemImagesCollection.insertMany(imageDocuments);

        if (result.insertedCount === imageUrls.length) {
            return {
                status: 201,
                message: "Images uploaded successfully",
                data: {
                    imagesCount: result.insertedCount
                }
            };
        } else {
            return {
                status: 500,
                message: "Failed to upload some images"
            };
        }

    } catch (error) {
        console.error("Error while creating item images:", error);
        return {
            status: 500,
            message: "Internal server error"
        };
    } finally {
        await client.close();
    }
}

module.exports = {createUser,createItem, createItemImages,
logUser
};