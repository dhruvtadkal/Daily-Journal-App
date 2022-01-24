const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var clients = 1;
  io.on('connect', function(socket) {
    clients++;
    console.log(clients)
    io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
    socket.on('disconnect', function () {
      clients--;
      console.log(clients)
      io.sockets.emit('broadcast',{ description: clients + ' clients connected!'});
    }); 
  });

const homeStartingContent = "Welcome, to your Daily Journal! Go over to the 'Write' section to get started with your very own journal.";
const aboutContent = "The only website where you can store the daily events of your life. I can assure, we don't store your data and later sell it to other companies. We care about a lot,like a lot about your privacy, hence feel free to share every single thing you do, without any worry.";
const contactContent = "Feel free to contact us anytime regarding full stack issues, we'll be more than glad to help :) "


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res){

  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });


  post.save(function(err){
    if (!err){
        res.redirect("/");
    }
  });
});

app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

//delete function
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;

    Post.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose", {contactContent: contactContent});
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
