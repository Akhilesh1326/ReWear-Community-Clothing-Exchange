const connectDB = require('../connectDB');

const client = connectDB.connectToPostgresSQL();

async function createUser(username, email, password, firstname, lastname, phonenumber, dateofbirth) {
    try {
        const response = await client.query(`INSERT INTO users(username, email, password, firstname, lastname, phonenumber, dateofbirth) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[username, email, password, firstname, lastname, phonenumber, dateofbirth]);
        return {status : 201, message: "user registered", data: response.rows[0]};
    } catch (error) {
        if(error.code == 23505){
            console.log("Error occured because of username repeation");
            return{status: 409, message: "username or email is already present"};
        }
        console.log("Error occured in create new user in controller");
        return {status: 400, message : "User register error occured"};
    }
};

async function logUser(username, password) {
    try {
        const response = await client.query(`SELECT * FROM users WHERE username = $1 and password = $2`,[username, password])
        if(response.rows.length == 0){
            return {status:404, message: "No user found"};
        }

        return {status: 200, message: "UserFound", data: response.rows};
    } catch (error) {
        console.log("error while logging user in controller = ",error);
        return {status: 500, message: "Internal server error"};
    }
    
}
module.exports = {createUser, 
logUser
};