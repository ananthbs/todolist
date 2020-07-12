//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose =require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

  mongoose.connect("mongodb+srv://admin-ananth:admin@cluster0.udu6l.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true, useFindAndModify: false });




const itemScema={
  name: String
};

const Item = mongoose.model("Item",itemScema);

const item1 = new Item({
  name:"ball1"
});

const item2 = new Item({
  name:"ball2"
});
const item3 = new Item({
  name:"ball3"
});

const defaultItems =[item1,item2,item3];

const listSchema = {
  name:String,
  items: [itemScema]
};

const List = mongoose.model("list",listSchema)




app.get("/", function(req, res) {

  

const day = date.getDate();

Item.find({},function(err,results){
  if(results.length===0){
    
    Item.insertMany(defaultItems,function (err) {
      if(err){
        console.log("error");
        
      }else{
        console.log("sucessfull");
      } 
    });
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: day, newListItems: results});
    
  }
  
  
})

  

});

app.post("/", function(req, res){
  
  const day = date.getDate();
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item =new Item({
    name:itemName
  });

  if(listName === day){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err, foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);
    })
  }


}); 

app.post("/delete",function (req,res) {

  const day = date.getDate();

  const checkesItemid= req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(checkesItemid,function(err){
      if(!err){
        console.log(" sucess");
        res.redirect("/")
      }
      });
    }
    else{
       List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkesItemid}}},function (err,foundlist){
       if(!err){
         res.redirect("/"+listName);
       }  
         
       });
    }
  
  
   
 
});

//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
// });
app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;

  List.findOne({name:customListName},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name:customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName); 
      }
      else{
        res.render("list",{listTitle: foundlist.name, newListItems: foundlist.items});
      }
    }
  })
    
});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
