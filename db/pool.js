const {Pool} = require("pg");

const pool = new Pool({
  host: "localhost", // or your db host
  user: "postgres",
  database: "opensanctuary",
  password: "root",
  port: 5432,
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