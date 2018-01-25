var express = require("express");
var router  = express.Router();
var Pet = require("../models/pet");
var middleware = require("../middleware");
var request = require("request");

router.get("/", function(req, res){
    Pet.find({}, function(err, allPets){
        if (err){
            console.log(err);
        }
        else{
             res.render("index", {pet: allPets, message: "ciao", user: req.user });
        }
    });
});

router.post("/", function (req, res) {
     var pet = new Pet({
        name: req.body.name,
        image: req.body.image,
        desc: req.body.desc
    });
    pet.author.username = req.user.username;
    pet.author.id = req.user;
    
    pet.save(function(err) {
        if (err){
           throw err;
        } else {
           res.redirect("/pets");
        }
    });
});

router.get("/new", middleware.isAuthenticated, function(req, res){
    res.render("new");
});

router.get("/:id", function(req, res){
    Pet.findById(req.params.id).populate("comments").exec(function(err, seePet){
        if (err){
            console.log(err);
        } else{
            res.render("show", {pet: seePet});
        }
    });
});

router.put('/:id', function(req, res){
	Pet.findByIdAndUpdate( req.params.id, req.body, function(err){
    	 	if(err){
    	 	    console.log(err);
    	 	} else {
    		   res.redirect('/pets/'+req.params.id);
    		 }
    	 });
});

router.get('/:id/edit', function (req, res){
    Pet.findById(req.params.id, function(err, pet){
        if (err) {
            console.log(err);
          } else{
           res.render("editPet", {pet: pet}); 
          }
    });
});

router.delete('/:id', function(req, res){
    console.log(req.params.id);
	Pet.findByIdAndRemove(req.params.id, function (err, pet) {
          if (err) {
            console.log(err);
          } else{
            res.redirect("/pets");
          }
    });
});


module.exports = router;