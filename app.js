var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require('connect-flash'),
    passport    = require('passport'),
    LocalStrategy = require('passport-local'),
    session     = require('express-session'),
    cookieParser = require('cookie-parser'),
    bcrypt      = require('bcrypt'),
    Pet          = require("./models/pet"),
    Comment     = require("./models/comment"),
    User        = require("./models/user");
    
mongoose.connect("mongodb://localhost/compete");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())),
passport.serializeUser(User.serializeUser()),
passport.deserializeUser(User.deserializeUser());
    
    
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

// passport.serializeUser(function(user, done) {
//   done(null, user._id);
// });
// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });

app.set('trust proxy', 1); // trust first proxy

app.use(cookieParser('secret'));

// app.all('/', function(req, res){
//   req.flash('index', 'it worked');
//   res.redirect('/index')
// });

// app.all('/index', function(req, res){
//   res.send(JSON.stringify(req.flash('index')));
// });

app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/pets", function(req, res){
    Pet.find({}, function(err, allPets){
        if (err){
            console.log(err);
        }
        else{
             res.render("index", {pet: allPets});
        }
    });
});

app.post("/pets", function (req, res) {
     var pet = new Pet({
        name: req.body.name,
        image: req.body.image,
        desc: req.body.desc
    });

    pet.save(function(err) {
        if (err){
           throw err;
        } else {
           res.redirect("/pets");
        }
    });
});

app.get("/pets/new", function(req, res){
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

app.get("/pets/:id/comment/new", function(req, res){
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

// app.get("/register", function(req, res){
//     res.render("register");
// });
// app.get("/login", function(req, res){
//     res.render("login");
// });


// passport/login.js
passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    User.findOne({ 'username' :  username }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false, 
                req.flash('message', 'User Not found.'));                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
          return done(null, false, 
              req.flash('message', 'Invalid Password'));
        }
        // User and password both match, return user from 
        // done method which will be treated like success
        return done(null, user);
      }
    );
}));

var isValidPassword = function(user, password){
  return bcrypt.compareSync(password, user.password);
}

passport.use('register', new LocalStrategy({
    username : 'username',
    password : 'password',
    passReqToCallback : true
  },
  function(req, username, password, done) {
   var findOrCreateUser = function(){
      // find a user in Mongo with provided username
      User.findOne({'username':username},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, false, 
             req.flash('message','User Already Exists'));
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = createHash(password);
          
          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }
            console.log('User Registration succesful');    
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
);

// Generates hash using bCrypt
var createHash = function(password){
 return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}


/* GET login page. */
  app.get('/login', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('login', { message: req.flash('message') });
  });
 
  /* Handle Login POST */
  app.post('/login', passport.authenticate('login', {
    successRedirect: '/pets',
    failureRedirect: '/',
    failureFlash : true 
  }));
 
  /* GET Registration Page */
  app.get('/register', function(req, res){
    res.render('register',{message: req.flash('message')});
  });
 
  /* Handle Registration POST */
  app.post('/register', passport.authenticate('register', {
    successRedirect: '/pets',
    failureRedirect: '/register',
    failureFlash : true 
  }));
 


/* Handle Logout */
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/pets');
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The ComPETe server has started!");
});