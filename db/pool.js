require('dotenv').config();
const {Pool} = require("pg");

const pool = new Pool({
 host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection
pool.connect()
  .then(client => {
    console.log("✅ Database connection successful!");
    client.release(); // release back to the pool
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });

module.exports = pool;