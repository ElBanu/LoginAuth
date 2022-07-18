//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const uriAtlas = "mongodb+srv://"+process.env.DB_USER+":"+process.env.DB_PASSWORD+"@cluster0.vbbdz.mongodb.net/?retryWrites=true&w=majority";					

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect(uriAtlas, {					
useNewUrlParser: true,					
useUnifiedTopology: true,					
dbName: "usersDB"					
});					
					
const userSchema = new mongoose.Schema ({					
    email: {					
        type: String,					
        required: [true, 'missing email adress']					
    },					
    password: {					
        type: String,					
        required: [true, 'missing paswword']					
    }					
    });


const User = mongoose.model("User", userSchema);					

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email: req.body.username ,
            password: hash
        });
        newUser.save(function(err){
            if(!err) {
                res.render("secrets");
            } else {
                console.log(err)
            }
        });
    });
    });
    
app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser){
        if (err){
            console.log(err);
        } else {
            if (foundUser){
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if (result === true) {
                        res.render("secrets");
                    }
                });
                }
            }
        });
    });


//TODO
app.listen(3000, function() {
console.log("Server started on port 3000");
});