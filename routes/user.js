const express = require('express')
const router = express.Router({mergeParams: true});//...creates new Router object(to segregate primary code into sub code)
const wrapAsync = require("../utils/wrapAync.js");
const passport = require("passport")
const { saveRedirectUrl } = require("../middleware.js");


const userController = require("../controller/users.js") 

router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));


router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", { failureRedirect:'/login', failureFlash: true}), userController.login);

//logout
router.get("/logout", userController.logout)

module.exports = router;