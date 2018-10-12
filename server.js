const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");


const db = require("./models");

const PORT = 3000;

const app = express();


app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/scrapingHW");

// Scrapes Data
app.get("/scrape", function (req, res) {
  axios.get("http://www.echojs.com/").then(function (response) {
    const $ = cheerio.load(response.data);

    $("article h2").each(function (i, element) {
      const result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      db.Article.create(result)
        .then(function (dbArticle) {
        }).catch(function (err) {
          return res.json(err);
        });
    });
    res.redirect(`http://localhost:${PORT}`);
  });
});

app.get('/',function(req,res){
  res.send("./index.html")
})

// gets all articles
app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (data) {
      res.json(data);
    }).catch(function (err) {
      res.json(err)
    })
});

// Specific Atricle (used for Note)
app.get("/articles/:id", function (req, res) {
  db.Article.find({ _id: mongoose.Types.ObjectId(req.params.id) })
    .populate('notes')
    .then(function (data) {
      res.json(data);
    }).catch(function (err) {
      res.json(err)
    })
});

// creates note
app.post("/articles/:id", function (req, res) {

  db.Note.create({ title: req.body.title, body: req.body.body })
    .then(function (notes) {
      return db.Article.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.params.id) }, { $push: { notes: mongoose.Types.ObjectId(notes._id) } }, { new: true });
    })
    .then(function (dbUser) {
      res.json(dbUser);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/api/note/delete/:id", function (req, res) {
  db.Note.remove({ _id: mongoose.Types.ObjectId(req.params.id) }).then(function (updatedNote) {
    res.redirect(`http://localhost:${PORT}`);
  }).catch(function(err){
    res.json(err);
  })
})


app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
