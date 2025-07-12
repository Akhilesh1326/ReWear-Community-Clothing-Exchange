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

const {createUser, 
    logUser} = require("./Controllers/userController");


app.get("/", (req, res)=>{
    res.json({message:"Hello from ReWear server you've reahed the start api"})
})

app.post('/api/login', async(req, res) => {
    try {
        const {username, password} = req.body;
        console.log(username, password);
        if(!username) return res.status(422).json({message:"Username is missing"});
        if(!password) return res.status(422).json({message:"password is missing"});
        
        const DB_res = await logUser(username, password);
        console.log(DB_res.data[0].userid)
        console.log(DB_res.data[0].username)
        
        if(DB_res.status == 200){
            const token = jwt.sign({
                userId: DB_res.data[0].userid,
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


app.listen(PORT, ()=>console.log("Server started at ", PORT));
