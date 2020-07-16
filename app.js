//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose =require("mongoose");
const app = express();
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


  mongoose.connect("mongodb+srv://admin-ananth:admin@cluster0.udu6l.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true, useFindAndModify: false });
  mongoose.set("useCreateIndex", true);

  const userSchema = new mongoose.Schema ({
    email: String,
    password: String
  });

  userSchema.plugin(passportLocalMongoose);

  const User = new mongoose.model("User", userSchema);

  passport.use(User.createStrategy());

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser())

const itemScema={
  name: String
};

const Item = mongoose.model("Item",itemScema);

const item1 = new Item({
  name:"Type down to add new "
});

const item2 = new Item({
  name:"click enter or +"
});
const item3 = new Item({
  name:"<--check to delete"
});

const defaultItems =[item1,item2,item3];

const listSchema = {
  name:String,
  items: [itemScema]
};

const List = mongoose.model("list",listSchema)



app.get("/", function(req, res) {

if(req.isAuthenticated()){
const day = date.getDate();

//List.find({items:""},function(err,results){
  List.find({name: req.user.username},function(err, foundlist){
   if(foundlist.length===0){
     const list =new List({
       name:req.user.username,
       items:defaultItems
     });
     list.save();
    // List.findOneAndUpdate({name:req.user.username},{$push:{items:item1}},function(err){
    //   if(!err){
    //     console.log("sucess");
    //   }
   
     //});
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: day, newListItems: foundlist[0].items});
  
  }

});
}
else{
  res.redirect("/register")
} 
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/login");
});

app.post("/", function(req, res){
  
  const day = date.getDate();
  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  // const item =new Item({
  //   name:itemName
  // });
  
  if(listName === day){
    List.findOneAndUpdate({name: req.user.username},{$push: {items: {name: itemName}}},function (err,foundlist){
      if(!err){
        res.redirect("/");
      }  
    });
    //res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err, foundlist){
      foundlist.items.push(itemName);
      foundlist.save();
      res.redirect("/"+listName);
    })
  }


}); 

;


app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});


app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/");
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
        res.redirect("/login");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/");
        });
      }
    });
  });

  app.get("/about", function(req, res){
    res.render("about");
  });

  // app.get("/:customListName",function(req,res){
  //   const customListName = req.params.customListName;

  //   List.findOne({name:customListName},function(err,foundlist){
  //     if(!err){
  //       if(!foundlist){
  //         const list = new List({
  //           name:customListName,
  //           items: defaultItems
  //         });
  //         list.save();
  //         res.redirect("/"+customListName); 
  //       }
  //       else{
  //         res.render("list",{listTitle: foundlist.name, newListItems: foundlist.items});
  //       }
  //     }
  //   });
      
  // });

  app.post("/delete",function (req,res) {

    const day = date.getDate();
  
    const checkesItemid= req.body.checkbox;
    const listName = req.body.listName;
  
  
    if(listName === day){
      List.findOneAndUpdate({name: req.user.username},{$pull: {items: {_id: checkesItemid}}},function (err,foundlist){
        if(!err){
          res.redirect("/");
        }  
          
        });
      // Item.findByIdAndRemove(checkesItemid,function(err){
      //   if(!err){
      //     console.log(" sucess");
      //     res.redirect("/")
      //   }
      //   });
      }
      else{
         List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkesItemid}}},function (err,foundlist){
         if(!err){
           res.redirect("/"+listName);
         }  
           
         });
      }
    
   
  });


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
