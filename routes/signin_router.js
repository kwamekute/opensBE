const {Router} = require("express");
const signinRouter = Router();
const signinController = require("../controllers/signin_controller");

signinRouter.get("/", (req,res) => res.send("Sign In Route"));

signinRouter.post("/", signinController.postSignin);

module.exports = signinRouter;