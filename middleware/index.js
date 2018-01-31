var Comment = require("../models/comment");
var Pet = require("../models/pet");

module.exports = {
    isAuthenticated: function (req, res, next) {
      if (req.user){
          return next();
      }
      res.redirect('/login');
    },
    
    checkUserPet: function (req, res, next){
        if(req.isAuthenticated){
            Pet.findById(req.params.id, function(err, pet){
                if(err) {
                    console.log(err);
                } else if(JSON.stringify(pet.author.id) === JSON.stringify(req.user._id)){
                        next();
                    }
                    else{
                         res.redirect("/pets");
                    }
            });
        } else{
            req.flash("error");
            res.redirect("/pets");
        }
    },
    
    checkUserComment: function (req, res, next){
        if(req.isAuthenticated){
            Pet.findById(req.params.id, function(err, pet){
                if (err){
                 console.log(err);
                } else {
                    Comment.findById(req.params.comm_id, function(err, comment){
                        if (err) {
                           console.log(err);
                         } else {
                            if(JSON.stringify(comment.author.id) === JSON.stringify(req.user._id)){
                                next();
                            } else{
                               res.redirect("/pets"); 
                            }
                        }       
                    });
                 }
            });
        } else{
            req.flash("error");
            res.redirect("/pets");
        }
    }
}