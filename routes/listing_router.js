const {Router} = require("express");
const listingRouter = Router();
const listingController = require("../controllers/listing_controller")


 listingRouter.get("/", (req,res) => res.send("Listing Router"));

listingRouter.post("/", listingController.postListing);
//listingRouter.post("/:id/photos", listingController.addListingPhotos);



module.exports = listingRouter;