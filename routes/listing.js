const express = require('express')
const router = express.Router();
const wrapAsync = require('../utils/wrapAync.js')
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controller/listings.js")
const multer = require("multer");
const {storage} = require("../cloudconfig.js"); 
const upload = multer({storage});

//router.route implementation to merge requests at same path
//get and post to display and create listings
router
.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing));

//create route get req
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, 
    upload.single("listing[image]"),validateListing,  wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));


//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

router.post("/search",wrapAsync(listingController.handleSearch));

router.get("/category/:inpcategory",wrapAsync(listingController.showCategory));

module.exports = router;