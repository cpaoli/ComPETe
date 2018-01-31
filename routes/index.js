var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");


router.get("/", function(req, res) {
    res.render("landing", {req: req});
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/pets',
                                      failureRedirect: '/login' }));

// login - register

router.get('/register', function(req, res) {
  res.render('register',  {req: req});
});

router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.render('register', {req: req});
        }
    
        passport.authenticate('local')(req, res, function () {
             req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
             res.redirect('/pets');
        });
    });
});

router.get('/login', function(req, res) {
  res.render('login',  {req: req});
});

router.post('/login', passport.authenticate('local', 
{ failureRedirect: '/login', failureFlash: true}), function(req, res) { res.redirect('/pets');
});

router.get('/logout', function(req, res) {
  req.logout();
  req.flash("success", "LOGGED YOU OUT!");
  res.redirect('/pets');
});

module.exports = router;