const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const {ListingSchema, reviewSchema} = require("./schema.js");
const ExpressError = require('./utils/ExpressError.js');


module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.path, "..", req.originalUrl);
    if(!req.isAuthenticated()){
        //redirecturl save
        req.session.redirectUrl = req.originalUrl;

        req.flash("error","You must be Logged In to create Listing!")
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    //check for unauthorized access
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You Are Not the Owner of This Listing");
        return res.redirect(`/listings/${id}`)
    }

    next();
};

module.exports.validateListing = (req, res, next) => {
    let {error} =  ListingSchema.validate(req.body);
    console.log(error);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log(errMsg);
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    let {error} =  reviewSchema.validate(req.body);
    console.log(error);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log(errMsg);
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async(req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    //check for unauthorized access
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You Are Not The Author of this Review");
        return res.redirect(`/listings/${id}`)
    }
    next();
};