const {Router} = require("express");
const signupRouter = Router();
const signupController = require("../controllers/signup_controller")


 signupRouter.get("/", (req,res) => res.send("Sign Up Route"));

signupRouter.post("/", signupController.postSignup);

module.exports = signupRouter;