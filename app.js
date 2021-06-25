//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const lodash = require("lodash");
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// variables

mongoose.connect("mongodb://localhost:27017/todolist", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const todoSchema = {
  name: String,
};

const Todo = mongoose.model("Todo", todoSchema);

const TodoList1 = new Todo({
  name: "welcome to todolist",
});

const TodoList2 = new Todo({
  name: "click '+' to add new todo",
});

const TodoList3 = new Todo({
  name: "click check box to delete todo from your list",
});
const defaultTodo = [TodoList1, TodoList2, TodoList3];

// Todo.deleteMany(
//   {
//     _id: ["60ceb6d1d62ab0429bd9d833", "60ceb6fbf23d7f43cec94376"],
//   },
//   (err, deltodos) => {
//     console.log(err ? err : deltodos);
//   }
// );

// Todo.insertMany([TodoList1, TodoList2, TodoList3], (err, todos) => {
//   const status = err ? err : todos;
//   console.log(status);
// });

const listSchema = {
  name: String,
  items: [todoSchema],
};

const List = mongoose.model("List", listSchema);

const day = date.getDate();

app.get("/", function (req, res) {
  Todo.find((err, Todos) => {
    // items = err ? err : Todos;
    // console.log(items);

    if (Todos.length === 0) {
      Todo.insertMany([TodoList1, TodoList2, TodoList3], (err, todos) => {
        const status = err ? err : todos;
        console.log(status);
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: Todos });
    }
    3000;
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const listName = req.body.list;

  const ITEM = new Todo({
    name: item,
  });
  List.findOne({ name: listName }, (err, foundItems) => {
    if (foundItems) {
      foundItems.items.push(ITEM);
      foundItems.save();

      res.redirect("/todos/" + listName);
    } else {
      ITEM.save();
      res.redirect("/");
    }
  });
});

app.post("/delete", (req, res) => {
  let listName = req.body.todolist;
  const itemid = req.body.checkbox;
  if (listName == day) {
    Todo.findByIdAndRemove(req.body.checkbox, (err, delTodo) => {
      console.log(err ? err : delTodo);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemid } } },
      (err, lists) => {
        console.log(err ? "item does not exist" : "item deleted");
      }
    );
    res.redirect("/todos/" + listName);
  }
});

app.get("/todos/:clist", function (req, res) {
  const costumList = lodash.capitalize(req.params.clist);
  console.log(costumList);
  List.findOne({ name: costumList }, (err, foundList) => {
    if (!foundList) {
      const list = new List({
        name: costumList,
        items: defaultTodo,
      });
      list.save();
      res.redirect("/todos/" + costumList);
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
