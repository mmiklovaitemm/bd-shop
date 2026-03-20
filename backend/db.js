import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bd_shop",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

export default pool;
