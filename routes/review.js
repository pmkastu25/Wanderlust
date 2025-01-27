const express = require('express')
const router = express.Router({mergeParams: true}); //creates new Router object(to segregate primary code into sub code)
const wrapAsync = require('../utils/wrapAync.js')
const{validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")

const reviewController = require("../controller/reviews.js");

//Reviews, POSt Route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Delete Review Route
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;