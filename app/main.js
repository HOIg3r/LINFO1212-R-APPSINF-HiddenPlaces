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
    console.log(req.session)
    res.render('index.html')
})

app.get('/login.html', function (req, res) {
    res.render('login.html')
})

app.post('/login', (req, res,) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        else {
            const dbo = db.db('hiddenplaces-db');
            dbo.collection('users').findOne({username: req.body.login_identifiant}, (err, doc) => {
                if (doc == null) {
                    res.redirect('login.html')
                } else {
                    // Compare the password and the hashed password stocked in the DB
                    bcrypt.compare(req.body.login_password, doc.hashed_password, function (err, resBcrypt) {
                        if (resBcrypt) {
                            req.session.username = doc.username
                            req.session.fullname = doc.fullname
                            req.session.email = doc.email
                            res.redirect('index.html')
                        } else {
                            res.redirect('login.html')
                        }
                    });
                }
            })
        }
    })

})

app.post('/signup', (req, res,) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        if (req.body.signup_password !== req.body.signup_confirmed_password) {
            res.redirect('login.html')
        } else {
            const dbo = db.db('hiddenplaces-db');
            dbo.collection('users').findOne({username: req.body.signup_username}, (err, doc) => {
                if (err) throw err;
                if (doc != null) {
                    res.redirect('login.html')
                } else {

                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(req.body.signup_password, salt, function (err, hash) {
                            dbo.collection('users').insertOne({
                                username: req.body.signup_username,
                                hashed_password: hash,
                                email: req.body.signup_email,
                                fullname: req.body.signup_fullname,
                            })

                        })
                    })
                    req.session.username = req.body.signup_username
                    req.session.fullname = req.body.signup_fullname
                    req.session.email = req.body.signup_email
                    res.redirect('index.html')
                }
            })
        }
    })


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
app.post("/addplace", function (req, res, next) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        else {
            const dbo = db.db('hiddenplaces-db');
            const latlong = [parseInt(req.body.latitude) ,parseInt(req.body.longitude)];
            dbo.collection("places").insertOne({
                name: req.body.name,
                coordinate: latlong,
                rating: req.body.rating,
                description: req.body.description,
            }, (err, doc) => {
                if (err) throw err;
                res.redirect("index.html")
            })
        }
    })
});


// Start the site
app.use(express.static('static'));
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: 'HiddenPlaces'
}, app).listen(8080);
console.log('---- Site: https://localhost:8080/index.html ----')

