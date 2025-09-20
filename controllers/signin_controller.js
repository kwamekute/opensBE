const passport = require("passport");

exports.postSignin = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in'
  })(req, res, next); // 👈 call the returned middleware with req,res,next
};