var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    cookieParser = require("cookie-parser"),
    LocalStrategy = require('passport-local'),
    flash        = require("connect-flash"),
    Pet          = require("./models/pet"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    session = require("express-session"),
    methodOverride = require('method-override');
    
    //requiring routes
var commentRoutes    = require("./routes/comments"),
    petRoutes = require("./routes/pets"),
    indexRoutes      = require("./routes/index");
    
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


// passport.use(new FacebookStrategy({
//     clientID: FACEBOOK_APP_ID,
//     clientSecret: FACEBOOK_APP_SECRET,
//     callbackURL: "http://localhost:8080/auth/facebook/callback",
//     profileFields: ['id', 'displayName', 'photos', 'email']
//   },
//   function(accessToken, refreshToken, profile, done) {
//     User.findOrCreate({ facebookId: profile.id }, function(err, user) {
//       if (err) { return done(err); }
//       done(null, user);
//     });
//   }
// ));


app.use("/", indexRoutes);
app.use("/pets", petRoutes);
app.use("/pets/:id/comment", commentRoutes);

app.listen(process.env.PORT, process.env.IP , function(){
    console.log("The ComPETe server has started!");
});
