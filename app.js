var  express               = require("express"),
     app                   = express(),
     passport              = require("passport"),
     LocalStrategy         = require("passport-local"),
     bodyParser            = require("body-parser"),
     mongoose              = require("mongoose"),
     campground            = require("./models/camp"),
     comment               = require("./models/comments"),
     User                  = require("./models/user")

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.listen(3000, () => console.log('server started!'));
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(express.static(__dirname + "/public"));

app.use(require("express-session")({

    secret:"MOO MOO!",
    resave:false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(function(req, res, next){
console.log(req.user);
 res.locals.currentUser = req.user;
 next();

});
//auth routes

//register
app.get("/register", function(req, res){

       res.render("register");
     });

app.post("/register", function(req, res){
      
       var newUser = new User({username: req.body.username});
       User.register(newUser, req.body.password , function(err, user){
        if(err){
           console.log(err);

         }else{
         passport.authenticate("local")(req, res, function(){
          res.redirect("/campgrounds");
   });
}
       
    });

});

//login

app.get("/login", function(req,res){

 res.render("login");

});

app.post("/login", passport.authenticate("local", 
{
  successRedirect: "/campgrounds",
  failureRedirect: "/login"

}),

 function(req, res){
 


});

//logout

app.get("/logout" , function(req, res){

req.logout();
res.redirect("/campgrounds");


});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();

  }

   res.redirect("/login");

}



//campground.create({
//}, function(err, campground){
  //  if(err){
     //  console.log("OH NO");
   // }else{
    //   console.log("Success");
    //   console.log(campground);

    //  }
//});

app.get('/', function(req, res){

res.render("landing");

});
app.get('/campnew', function(req, res){

res.render("form")

});


app.get('/campgrounds', function(req, res){

campground.find({}, function(err, allcampground){
  if(err){
   console.log("ERROR");
  }else{
   res.render("index", {camp:allcampground});
  }


});
});
app.get("/campgrounds/:id", function(req,res){

       campground.findById(req.params.id).populate("comments").exec (function(err, foundCamp){
        if(err){
              console.log(err);
         }else{
             console.log(foundCamp);
             res.render("show", {campground: foundCamp});
           }
              
});
});
app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req,res){
   campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
       }else{
           res.render("new",{camp : campground});
         }

});
});


app.post("/campgrounds/:id/comments", isLoggedIn, function(req,res){
 campground.findById(req.params.id, function(err, campground){
 if(err){
      console.log(err);
      res.redirect("/campgrounds");
 }else{
   comment.create(req.body.comment, function(err, comment){
 if(err){
      console.log(err)
    }else{
      comment.author.id = req.user._id;
      comment.author.username = req.user.username;
      comment.save();
      campground.comment.push(comment);
      campground.save();
      res.redirect('/campgrounds/' + campground._id);
  }
});
      
 }

});



});

app.post("/campgrounds", function(req, res){
     var name = req.body.name;
     var image= req.body.image;
      var desc= req.body.desc;
     var newcampgrounds = {name:name , image:image, desc: desc };
     campground.create(newcampgrounds,function(err, campgrounds){
      if(err){
           console.log(err);
         }else{
           res.redirect("/campgrounds");
        }

});
});
