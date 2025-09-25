const {Router} = require("express");
const listingRouter = Router();


 listingRouter.get("/", (req,res) => res.send("Sign Up Route"));

//listingRouter.post("/add", signupController.postSignup);

module.exports = listingRouter;