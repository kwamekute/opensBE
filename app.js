const express = require("express");
const app = express();
const signupRouter = require("./routes/signup_router");
const signinRouter = require("./routes/signin_router");
const listingRouter =require("./routes/listing_router");
const requestRouter = require("./routes/request_router");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const cors = require("cors");
const pool = require("./db/pool");



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



//Routes Mounts
app.use("/signup", signupRouter);
app.use("/signin", signinRouter );
app.use("/listing",listingRouter );
app.use("/request", requestRouter);


//Access to session and linked users
app.get('/api/me', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.json({ success: false, account: null, organization: null });
    }

    const account = {
      account_id: req.user.account_id,
      email: req.user.email,
      role: req.user.role
    };
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

//Port 
const PORT = 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`App running - listening on port ${PORT}...`);
});