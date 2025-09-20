// controllers/authController.js
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");

// Render signup form
// exports.getSignup = (req, res) => {
//   res.render("sign-up");
// };

// Handle signup form POST
exports.postSignup = async (req, res, next) => {
  
     const {
    email,
    password,
    name,
    denomination,
    contact,
    role
  } = req.body;

   
  const client = await pool.connect();

  try {
    // hash the password
    
    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash(password, 10);

    //  Create the account
    const insertAccountQuery = `
      INSERT INTO accounts (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING account_id, email, role
    `;
    const { rows: accountRows } = await client.query(insertAccountQuery, [
      email,
      hashedPassword,
      role || "organization" // default if not passed
    ]);

    const account = accountRows[0];

    // Create the organization if role === 'organization'
        let org = null;

    if (account.role === "organization") {
      const insertOrgQuery = `
        INSERT INTO organizations (account_id, name, denomination, contact)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const { rows: orgRows } = await client.query(insertOrgQuery, [
        account.account_id,
        name,
        denomination,
        contact
      ]);
      org = orgRows[0];
    }

    await client.query("COMMIT");

    // 3️⃣ Log them in immediately
    req.login(account, (err) => {
      if (err) return next(err);
      res.json({
        success: true,
        account,
        organization: org,
      }); //return the account details
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}
