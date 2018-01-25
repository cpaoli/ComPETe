var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");


router.get("/", function(req, res) {
    res.render("landing");
});

// login - register

router.get('/register', function(req, res) {
  res.render('register');
});

router.post('/register', function(req, res) {
   console.log("trying to post");
    User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
        if (err) {
            console.log("trying to post1, but err: " + err.message);
            req.flash("error", err.message);
            console.log(err.message);
            return res.render('register', {err: err});
        }
    
        passport.authenticate('local')(req, res, function () {
             console.log("trying to post2");
             req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
          res.redirect('/pets');
        });
    });
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', passport.authenticate('local', 
{ failureRedirect: '/login'}), function(req, res) { res.redirect('/pets');});

router.get('/logout', function(req, res) {
    console.log("logged out");
  req.logout();
  req.flash("success", "LOGGED YOU OUT!");
  res.redirect('/pet');
});

module.exports = router;