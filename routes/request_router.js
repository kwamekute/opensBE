const {Router} = require("express");
const requestRouter = Router();
const requestController = require("../controllers/request_controller");


requestRouter.post("/", requestController.postRequest);
requestRouter.get("/", requestController.getRequests);

module.exports = requestRouter;