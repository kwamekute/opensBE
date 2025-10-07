const {Router} = require("express");
const listingRouter = Router();
const listingController = require("../controllers/listing_controller")



listingRouter.get("/:id", listingController.getListingById);
listingRouter.get("/org", listingController.getListingsByOrg);

listingRouter.get("/", listingController.getListings);
listingRouter.post("/", listingController.postListing);
//listingRouter.post("/:id/photos", listingController.addListingPhotos);


module.exports = listingRouter;