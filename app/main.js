// Import module
var express = require('express');
//var session = require('express-session');
//var bodyParser = require("body-parser");
var app = express();
//var consolidate = require('consolidate');
//var mongo = require("mongodb");
//var MongoClient = mongo.MongoClient;
//var url = "mongodb://localhost:27017/";
var https = require('https');
var fs = require('fs');


// Create the Cookie settings



// Start the site
app.use(express.static('static'));
https.createServer({
    key : fs.readFileSync('key.pem'),
    cert : fs.readFileSync('cert.pem'),
    passphrase : "HiddenPlaces"
}, app).listen(8080);
console.log("---- Site: https://localhost:8080/index.html ----")
