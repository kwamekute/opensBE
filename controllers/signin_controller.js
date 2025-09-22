
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

    // At this point `user` is what you returned in your LocalStrategy
    req.login(user, async (err) => {
      if (err) return next(err);

      try {
        let org = null;

        // fetch organization only if role is organization
        if (user.role === "organization") {
          const { rows } = await pool.query(
            `SELECT * FROM organizations WHERE account_id = $1`,
            [user.account_id]
          );
          org = rows[0] || null;
        }
         const account = {
      account_id: user.account_id,
      email: user.email,
      role: user.role,
    };

        res.json({ success: true, account, organization: org });
      } catch (dbErr) {
        next(dbErr);
      }
    });
  })(req, res, next);
};
