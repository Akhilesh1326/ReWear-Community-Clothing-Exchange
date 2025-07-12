const connectDB = require('../connectDB');

const client = connectDB.connectToPostgresSQL();



async function getAllCategories() {
    try {
        const response = await client.query(`SELECT * FROM categories`);
        console.log(response.rows);
        if(response.rows.length === 0) return {status: 404, message: "Categories not found"};

        return {status: 200, message: "Categories Found", data: response.rows};

    } catch (error) {
        console.log("Error while getting all categories in controller", error);
        return {status: 500, message: "Internal server error"};
    }
}

async function getCategoryById(id) {
    try {
        const response = await client.query(`SELECT * FROM categories WHERE id = $1`, [id]);

        if (response.rows.length === 0) {
            return { status: 404, message: "No category found by id" };
        }

        return { status: 200, message: "Category found", data: response.rows };
    } catch (error) {
        console.error("Error at getting the category by id in controller:", error);
        return { status: 500, message: "Internal server error" };
    }
}


async function getAllListings(categoryId) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const itemsCollection = db.collection("items");

        const filter = {
            status: "approved",
            isAvailable: true
        };

        if (categoryId) {
            filter.categoryId = categoryId;
        }

        const listings = await itemsCollection.find(filter).toArray();

        if (listings.length === 0) {
            return { status: 404, message: "Listings not found" };
        }

        return { status: 200, message: "Listings found", data: listings };

    } catch (error) {
        console.error("Error while getting all listings:", error);
        return { status: 500, message: "Internal server error" };
    } finally {
        await client.close();
    }
}




module.exports = {
    getAllCategories, 
    getCategoryById, 
    getAllListings,
    getListingById
};