const Listing = require("../models/listing.js")
const Review = require("../models/review.js");

module.exports.createReview = async(req, res) => {
    //use mergeParams: true in router object to get the id from :id in index.js file
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    //logged in user is author of new review
    newReview.author = req.user._id; 
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing.id}`)
}

module.exports.destroyReview = async (req,res) => {
        let {id, reviewId} = req.params;
        await Listing.findByIdAndUpdate(id, {$pull:{reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted!");
        res.redirect(`/listings/${id}`);
}