//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;


const app = express();



app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(session({
  secret: "Wow this is donald trumps stuff.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect(`mongodb://localhost:${process.env.MONGOPASS}`, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema({
  email: String,
  password: String
});


userSchema.plugin(passportLocalMongoose);





const User = new mongoose.model("User", userSchema)



passport.use(User.createStrategy());


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.user(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://www.example.com/auth/google/callback"
},
  function (accessTocken, refreshToken, profile, cb) {
    User.findOrCreate({ googleID: profile.id }, fucntion(err, user){
      return cb(err, user);
    })
  }
));


app.get("/", function (req, res) {
  res.render("home");
});


app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {


  res.render("register");
});





app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");

  } else {
    res.redirect("/login");
  }
});


app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/")
})





app.post("/register", function (req, res) {

  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {

      passport.authenticate("local")(req, res, function () {

        res.redirect("/secrets");


      })

    }
  })

});


app.post("/login", function (req, res) {

  const user = new User({

    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function (err) {

    if (err) {
      console.log(err);

    }
    else {

      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  })

});





app.listen(3000, function () {
  console.log("Server started on port 3000.");
});