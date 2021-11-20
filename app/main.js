// Import module
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var consolidate = require('consolidate');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = 'mongodb://localhost:27017/';
var https = require('https');
var fs = require('fs');


// Create the Cookie settings
app.use(session({
    secret: 'HiDdEnPlAcEsRoJaNe1212nveEnfEZ',
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        httpOnly: true,
        secure: true,
        maxAge: null,
    }
}))

//Create body for the info send by form
app.use(bodyParser.urlencoded({extended: true}))

//use hogan and set the files
app.engine('html', consolidate.hogan);
app.set('views', 'static');

//render the good html

app.get('/index.html', function (req, res) {
    res.render('index.html')
})

app.get('/login.html', function (req, res) {
    res.render('login.html')
})

app.get('/place.html', function (req, res) {
    res.render('places.html')
})

app.get('/addPlaces.html', function (req, res) {
    res.render('addPlaces.html')
})

app.get('/map.html', function (req, res) {
    res.render('map.html')
})

app.get('/myProfile.html', function (req, res) {
    res.render('myProfile.html')
})

app.get('/logout.html', function (req, res) {
    res.render('logout.html')
})


// Start the site
app.use(express.static('static'));
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: 'HiddenPlaces'
}, app).listen(8080);
console.log('---- Site: https://localhost:8080/index.html ----')
