import mysql from "mysql2/promise";
import "dotenv/config";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = mysql.createPool(process.env.DATABASE_URL);

export default pool;
