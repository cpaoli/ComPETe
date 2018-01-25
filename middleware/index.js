var Comment = require("../models/comment");
var Pet = require("../models/pet");

module.exports = {
    isAuthenticated: function (req, res, next) {
  if (req.user){
      return next();
  }
  res.redirect('/login');
}
}