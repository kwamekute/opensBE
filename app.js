const express = require("express");
const app = express();
const signupRouter = require("./routes/signup_router");
const signinRouter = require("./routes/signin_router");
const listingRouter =require("./listing_routesroutes/");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const cors = require("cors");
const pool = require("./db/pool");
//const path = require("path");
// const { fileURLToPath } = require("url");

// //file paths
// const reactBuildPath = path.join(__dirname, "../opensanctuaryFE/dist");
// app.use(express.static(reactBuildPath));


// allow React frontend to call API & send cookies
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true // very important for sessions/cookies
}));

// Global body parsing middleware 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//set up session 
app.use(session({
  secret: "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false // true only in production with HTTPS
  }
}));
app.use(passport.initialize());
app.use(passport.session());

//passport config
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM accounts WHERE email = $1", [email]);
      const user = rows[0];
      if (!user) return done(null, false, { message: "Incorrect email" });
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return done(null, false, { message: "Incorrect password" });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);


passport.serializeUser((user, done) => {
  done(null, user.account_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM accounts WHERE account_id = $1", [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});



//signup Mount
app.use("/signup", signupRouter);

//signin Mount
app.use("/signin", signinRouter );

//Listing Mount
app.use("/listing", )


//test session
// app.get('/api/me', (req,res) => {
//   res.json({ account: req.user || null });
// });

app.get('/api/me', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.json({ success: false, account: null, organization: null });
    }

    // req.user should already be whatever you returned from your LocalStrategy
    const account = {
      account_id: req.user.account_id,
      email: req.user.email,
      role: req.user.role
    };

    // fetch org if needed
    let org = null;
    if (account.role === 'organization') {
      const { rows } = await pool.query(
        'SELECT * FROM organizations WHERE account_id = $1',
        [account.account_id]
      );
      org = rows[0] || null;
    }

    res.json({ success: true, account, organization: org });
  } catch (err) {
    next(err);
  }
});



//logout to be implemented later
// app.post('/api/logout', (req, res, next) => {
//   req.logout(function (err) {
//     if (err) return next(err);
//     res.json({ success: true });
//   });
// });

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App running - listening on port ${PORT}...`);
});