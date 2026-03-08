import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // XAMPP default
  database: "bd_shop",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
