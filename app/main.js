// Import module
let express = require('express');
let session = require('express-session');
let bodyParser = require('body-parser');
let app = express();
let consolidate = require('consolidate');
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let url = 'mongodb://localhost:27017/';
let https = require('https');
let fs = require('fs');

//import hash algo and create salt and hash code
let bcrypt = require('bcryptjs');


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

app.post('/login', (req, res,) => {
    // Compare the password and the hashed password stocked in the DB
    bcrypt.compare(req.body.login_password, hashed_password, function (err, res) {
        if (res) {
            res.redirect('index.html')
        }
    });
})

app.post('/signup', (req, res,) => {
    if (req.body.signup_password === req.body.signup_confirmed_password) {
        // Generate the password
        bcrypt.genSalt(10, function (err, salt) {
            // Hash the password
            bcrypt.hash(req.body.signup_password, salt, function (err, hash) {
                // Store hash in your password DB.
            });
        });
    }

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
    res.redirect('index.html')
})


// Start the site
app.use(express.static('static'));
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: 'HiddenPlaces'
}, app).listen(8080);
console.log('---- Site: https://localhost:8080/index.html ----')

