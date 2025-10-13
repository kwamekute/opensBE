const passport = require("passport");
const pool = require("../db/pool");

// Handle sign-in POST
exports.postSignin = (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Invalid email or password",
      });
    }

    // Log in the user and attach session
    req.login(user, async (err) => {
      if (err) return next(err);

      try {
        let org = null;

        // Fetch organization only if role is organization
        if (user.role === "organization") {
          const { rows } = await pool.query(
            `SELECT * FROM organizations WHERE account_id = $1`,
            [user.account_id]
          );
          org = rows[0] || null;

          // Store organization_id in session for future use
          if (org) req.session.organization_id = org.organization_id;
        }

        // Store account_id and role in session for general access
        req.session.account_id = user.account_id;
        req.session.role = user.role;

        // Send clean response to frontend
        res.json({
          success: true,
          account: {
            account_id: user.account_id,
            email: user.email,
            role: user.role,
          },
          organization: org,
        });
      } catch (dbErr) {
        console.error("Error during signin:", dbErr);
        next(dbErr);
      }
    });
  })(req, res, next);
};

//logout

exports.logout = (req, res, next) => {
  // Passport's built-in logout (for session cleanup)
  req.logout(function (err) {
    if (err) return next(err);

    // Destroy the session explicitly
    req.session.destroy((sessionErr) => {
      if (sessionErr) return next(sessionErr);

      // Clear the cookie from the client
      res.clearCookie("connect.sid");

      // Send success response
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
};
