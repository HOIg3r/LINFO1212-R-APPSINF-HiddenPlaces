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

let convert = require('mongo-image-converter')


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
app.use(bodyParser.json({limit: '16mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '16mb', extended: true}))

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
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        else {
            const dbo = db.db('hiddenplaces');
            dbo.collection('users').findOne({username: req.body.login_identifiant}, (err, doc) =>{
                if (doc == null){
                    res.redirect('login.html')
                }else{
                    // Compare the password and the hashed password stocked in the DB
                    bcrypt.compare(req.body.login_password, doc.password, function (err, res) {
                        if (res) {
                            res.session.username = req.body.login_identifiant
                            res.redirect('index.html')
                        }else{
                            res.redirect('login.html')
                        }
                    });
                }
            })
        }
    })
    // close the DB
    // We open the DB only if it's necessary
    MongoClient.close()
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

