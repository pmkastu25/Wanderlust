
//condition for not deploying .env file in deployment phase of proj.
if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
console.log(process.env.SECRET); //accessed from .env file

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

//to connect to db;
// const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

const dbURL = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbURL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))


main()
.then(()=>{
    console.log('Connected Successfully');
})
.catch((err) => {
    console.log(err);
});
//new 
const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto:{
        secret : process.env.SECRET,
    },
    touchAfter: 24 * 3600, //session is updated after 24hrs;
})

store.on("error",()=>{
    console.log("Error in Mongo Session store",err);
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, //to prevent cross scripting attacks
    }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());//middleware-initialize passport
app.use(passport.session());//to ensure weather same user is sending request from page to page
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());//User session info is saved
passport.deserializeUser(User.deserializeUser());

// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//New Dummy User Auth Example
app.get("/demouser", async(req,res) => {
    let fakeUser = new User({
        email:"student@gmail.com",
        username: "delta-student"
    });

    let reguser = await User.register(fakeUser, "helloWorld");
    res.send(reguser);
})

//refers to listings routers(./routes/listing.js)
app.use("/listings", listingRouter);
//refers to reviews router(./routes/review.js)
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter);

//Error Handling Middlewares
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});
app.use((err, req, res, next) => {

    let {status = 500, message = "Something Went Wrong!"} = err;

    res.status(status).render("error.ejs", {message});
    // res.status(status).send(message);
})


app.listen(8080, () => {
    console.log("Server is listening to 8080");
});