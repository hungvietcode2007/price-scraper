const mysql2 = require("mysql2/promise");
const isProduction = process.env.NODE_ENV === "production";
const connection = mysql2.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  queueLimit: 0,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
  timezone: "Z",
  ssl: isProduction
    ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
    : false,
});
module.exports = connection;
