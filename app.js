const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
// const date=require(__dirname + "/date.js");
const _ = require("lodash");
const app=express();
app.set('view engine', 'ejs');
// let items=["A","B",];
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://varun_11:vanur_12340@cluster0.c00evic.mongodb.net/todolistsDB",{useNewUrlParser:true});
const itemsSchema = new mongoose.Schema({
    name: String
  });
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to your todo list"
});
const item2=new Item({
    name:"Hit the + button to add a new item"
});
const item3=new Item({
    name:"<---Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name: String,
  items: [itemsSchema]
};

const List=mongoose.model("List",listSchema);
 
app.get("/",function(req,res){
    // let day=date(); 
    Item.find({}).then(function(foundItems){
      if(foundItems.length===0){
        Item.insertMany(defaultItems)
        .then(function(){
          console.log("Successfully saved into our DB.");
        })
        .catch(function(err){
          console.log(err);
        });
        res.redirect("/");
      }
      else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch(function(err){
      console.log(err);
    });
  
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});
app.post("/", async (req, res) => {
  let itemName = req.body.newItem;
  let listName = req.body.list;

  const item = new Item({
      name: itemName,
  })

  if (listName === "Today") {
      item.save()
      res.redirect("/")
  } else {

      await List.findOne({ name: listName }).exec().then(foundList => {
          foundList.items.push(item)
          foundList.save()
          res.redirect("/" + listName)
      }).catch(err => {
          console.log(err);
      });
  }
})

app.post("/delete", function(req, res){
 
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName;
 
  if(listName === "Today") {
 
    Item.findByIdAndRemove(checkedItemId).then(function(foundItem){Item.deleteOne({_id: checkedItemId})})
 
    res.redirect("/");
 
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function (foundList)
      {
        res.redirect("/" + listName);
      });
  }
 
});


app.listen(3000,function(){
    console.log("Server is running");
});