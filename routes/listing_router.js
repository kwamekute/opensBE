const {Router} = require("express");
const listingRouter = Router();
const listingController = require("../controllers/listing_controller")


listingRouter.get("/org", listingController.getListingsByOrg);
listingRouter.post("/filtered",listingController.getFilteredListings );

listingRouter.get("/:id", listingController.getListingById);

listingRouter.get("/", listingController.getListings);
listingRouter.post("/", listingController.postListing);


module.exports = listingRouter;