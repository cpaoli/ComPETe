var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport = require('passport'),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require('passport-local'),
    flash        = require("connect-flash"),
    Pet          = require("./models/pet"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    session = require("express-session"),
    methodOverride = require('method-override');
    
mongoose.connect("mongodb://localhost/compete");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));

app.use(require("express-session")({
    secret: "Keyboard cat",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});
app.use(function(req, res, next){
  // all the stuff from the example
  if (req.session.user) {
    res.locals.user = req.session.user
  }
  next();
});

app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  next();
});

// passport.use(
//   function(username, password, done) {
//     User.findOne({ username: username }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!user.validPassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// );

app.delete('/pets/:id', function(req, res){
    console.log(req.params.id);
	Pet.findByIdAndRemove(req.params.id, function (err, pet) {
          if (err) {
            console.log(err);
          } else{
            res.redirect("/pets");
          }
    });
});

app.put('/pets/:id', function(req, res){
	Pet.findByIdAndUpdate( req.params.id, req.body, function(err){
    	 	if(err){
    	 	    console.log(err);
    	 	} else {
    		   res.redirect('/pets/'+req.params.id);
    		 }
    	 });
});

app.get('/pets/:id/edit', function (req, res){
    Pet.findById(req.params.id, function(err, pet){
        if (err) {
            console.log(err);
          } else{
           res.render("editPet", {pet: pet}); 
          }
    });
});

app.delete('/pets/:id/comment/:comm_id', function(req, res){
	Comment.findByIdAndRemove(req.params.comm_id, function (err) {
          if (err) {
            console.log(err);
          } else{
           res.redirect("/pets/"+ req.params.id);
          }
    });
});


app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/pets", function(req, res){
    Pet.find({}, function(err, allPets){
        if (err){
            console.log(err);
        }
        else{
             res.render("index", {pet: allPets, message: "ciao", user: req.user });
        }
    });
});

app.post("/pets", function (req, res) {
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

app.get("/pets/new", isAuthenticated, function(req, res){
    res.render("new");
});

app.get("/pets/:id", function(req, res){
    Pet.findById(req.params.id).populate("comments").exec(function(err, seePet){
        if (err){
            console.log(err);
        } else{
            res.render("show", {pet: seePet});
        }
    });
});

// comments
app.get("/pets/:id/comment/new", isAuthenticated, function(req, res){
 Pet.findById(req.params.id, function(err, pet){
        if (err){
            console.log(err);
        }
        else{
             res.render("comment", {pet: pet});
        }
    });
});

app.post("/pets/:id/comment", function (req, res) {
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

app.put('/pets/:id/comment/:comm_id', function(req, res){
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

app.get('/pets/:id/comment/:comm_id/edit', function (req, res){
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

// login - register

app.get('/register', function(req, res) {
  res.render('register');
});

app.post('/register', function(req, res) {
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

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', passport.authenticate('local', 
{ failureRedirect: '/login'}), function(req, res) { res.redirect('/pets');});

app.get('/logout', function(req, res) {
    console.log("logged out");
  req.logout();
  req.flash("success", "LOGGED YOU OUT!");
  res.redirect('/pet');
});

function isAuthenticated(req, res, next) {
  if (req.user){
      return next();
  }
  res.redirect('/login');
}

app.listen(process.env.PORT, process.env.IP , function(){
    console.log("The ComPETe server has started!");
});
