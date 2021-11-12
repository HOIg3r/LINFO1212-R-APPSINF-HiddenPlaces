// Import module
var express = require('express');
var app = express();
var https = require('https');
var fs = require('fs');


// Start the site
app.use(express.static('static'));
https.createServer({
    key : fs.readFileSync('./key.pem'),
    cert : fs.readFileSync('./cert.pem'),
    passphrase : "HiddenPlaces"
}, app).listen(8080);
console.log("---- Site: https://localhost:8080/index.html ----")
