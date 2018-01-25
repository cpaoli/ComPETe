var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

var User = new mongoose.Schema({
    username: String,
    password: String
});

User.methods.validPassword = function( pwd ) {
    // EXAMPLE CODE!
    return ( this.password === pwd );
};

User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);