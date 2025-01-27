const Listing = require("../models/listing.js")
const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxgeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    console.log(req.user)

    res.render("listings/new.ejs")
}

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {
        path: "author",
    },
}).populate("owner");
if(!listing){
    req.flash("error","Listing You Requested for does Not Exist!");
    res.redirect("/listings");
}
    console.log(listing);
    res.render("./listings/show.ejs", {listing});
}

module.exports.createListing =  async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
    .send();

    let url = req.file.path;
    let filename = req.file.filename;
    //let {title, description, image, price, country, location} = req.body;
    
    //Schema(Database) Validation
    console.log(req.body);
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = {url, filename};
    //handle geoJson data related map
    newlisting.geometry = response.body.features[0].geometry;
    newlisting.category = req.body.listing.category;
    await newlisting.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) =>{
    let {id} = req.params;
    console.log(id);
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalimageurl = listing.image.url; 
    originalimageurl = originalimageurl.replace("/upload","/upload/h_300,w_250");
    res.render("./listings/edit.ejs", {listing, originalimageurl});
}

module.exports.updateListing =  async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.showCategory= async(req, res) => {
    let { inpcategory } = req.params;
    console.log(req.params); 
    const allListings = await Listing.find({"category":inpcategory});
    console.log(allListings)
    if(allListings.length === 0){
        req.flash("error","No Listings For Such Category Exists");
        res.redirect("/listings");
    }
    res.render("./listings/category.ejs", {inpcategory, allListings});
}

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedlisting =await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}

module.exports.handleSearch = async(req, res)=>{
    console.log(req.body.location);
    let results = await Listing.find({$or:[{"location":req.body.location},{"country":req.body.location}]});
    console.log(results);
    if(results.length === 0){
        req.flash("error","No Listings for such location exists");
        res.redirect("/listings");
    }
    res.render("./listings/searchresults.ejs", {results, dest:req.body.location});
}