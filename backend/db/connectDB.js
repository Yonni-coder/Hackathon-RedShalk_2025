const mysql = require("mysql2/promise");
const dbConfig = require("../config/db.config");

const connectDB = mysql.createPool(dbConfig);

module.exports = connectDB;
