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


app.listen(PORT, ()=>console.log("Server started at ", PORT));
