//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const uriAtlas = "mongodb+srv://"+process.env.DB_USER+":"+process.env.DB_PASSWORD+"@cluster0.vbbdz.mongodb.net/?retryWrites=true&w=majority";					

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: "This is a secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(uriAtlas, {					
useNewUrlParser: true,					
useUnifiedTopology: true,					
dbName: "usersDB"					
});			

// mongoose.set("useCreateIndex", true);
					
const userSchema = new mongoose.Schema ({					
    email: String,
    password: String				
    });

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);	

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function (req, res){
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.post("/register", function(req, res){
    User.register({username: req.body.username}, req.body.password, function(err, newRegisteredUser){
        if (err){
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
    });
    
app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err){
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
    });

//TODO
app.listen(3000, function() {
console.log("Server started on port 3000");
});