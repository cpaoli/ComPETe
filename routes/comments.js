var express = require("express");
var router  = express.Router({mergeParams: true});
var Pet = require("../models/pet");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// comments
router.get("/new", middleware.isAuthenticated, function(req, res){
 Pet.findById(req.params.id, function(err, pet){
        if (err){
            console.log(err);
        }
        else{
             res.render("comment", {pet: pet});
        }
    });
});

router.post("/", function (req, res) {
    Pet.findById(req.params.id, function(err, pet){
        if (err){
         console.log(err);
        } else {
           Comment.create(req.body.comment, function(err, comment){
            
            comment.author.id =  req.user.id;
            comment.author.username =  req.user.username;
               if(err){
                console.log(err);
               } else {
                 comment.save();
                 pet.comments.push(comment._id);
                 pet.save();
                 res.redirect('/pets/' + pet._id);
               }
            }); 
        }
    });
});

router.put('/:comm_id', function(req, res){
    Pet.findById(req.params.id, function(err, pet){
        if (err){
         console.log(err);
        } else {
        	Comment.findByIdAndUpdate(req.params.comm_id, req.body.comment, function(err, comment){
        	 	if(err){
        	 	    console.log(err);
        	 	} else {
        		   res.redirect('/pets/'+req.params.id);
        		 }
        	 });
        }
    });
});

router.get('/:comm_id/edit', function (req, res){
     Pet.findById(req.params.id, function(err, pet){
        if (err){
         console.log(err);
        } else {
            Comment.findById(req.params.comm_id, function(err, comment){
            if (err) {
                console.log(err);
          } else{
           res.render("editComment", {comment: comment, pet: pet}); 
          }
            });
        }
    });
});

router.delete('/:comm_id', function(req, res){
	Comment.findByIdAndRemove(req.params.comm_id, function (err) {
          if (err) {
            console.log(err);
          } else{
           res.redirect("/pets/"+ req.params.id);
          }
    });
});


module.exports = router;