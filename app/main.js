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
let NlpjsTFr = require('nlp-js-tools-french');


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
app.use(bodyParser.json({limit: '16mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '16mb', extended: true}))

//use hogan and set the files
app.engine('html', consolidate.hogan);
app.set('views', 'static');


//render the good html

//TODO: errormessage
app.get('/index.html', function (req, res) {

    if (req.session.errorMessage === '' || req.session.errorMessage === undefined){
        if(req.session.username !== undefined){
            res.render('index.html',{username:req.session.username, style:'none'})
        }
        res.render('index.html',{username:'Anonyme',style:'none'})
    }else{
        if(req.session.username !== undefined){
            res.render('index.html',{username:req.session.username, style:'block',errorMessage:req.session.errorMessage})
        }
        res.render('index.html',{username:'Anonyme', style:'block', errorMessage:req.session.errorMessage})
        req.session.errorMessage = ''
    }

})

app.get('/login.html', function (req, res) {
    var connected = "You are already connected, please disconnect before login or sign-up a other account"
    if(req.session.username !== undefined){
        res.render('login.html',{username:req.session.username,style:'block', errorMessage:connected})
    }
    res.render('login.html',{username:"Anonyme"})
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
                            console.log(doc)
                            req.session._id = doc._id
                            req.session.username = doc.username
                            req.session.fullname = doc.fullname
                            req.session.email = doc.email
                            req.session.errorMessage = "";
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
                    req.session.errorMessage = ""
                    res.redirect('index.html')
                }
            })
        }
    })


})

app.get('/place.html', function (req, res) {
    if(req.session.username !== undefined){
        res.render('place.html',{username:req.session.username})
    }
    res.render('place.html',{username:"Anonyme"})
})

app.get('/addPlaces.html', function (req, res) {
    if(req.session.username !== undefined){
        res.render('addPlaces.html',{username:req.session.username})
    }
    res.render('addPlaces.html',{username:"Anonyme"})
})

app.get('/places.html', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        else {
            const dbo = db.db('hiddenplaces-db');
            dbo.collection("geojson").find({}).toArray((err, doc) => {
                dbo.collection("places").find({}).toArray((err, placelist) => {
                    var mapgeojson = JSON.stringify(doc);
                    if(req.session.username !== undefined){
                        res.render('places.html',{username:req.session.username, mapgeojson: mapgeojson, placelist: placelist})
                    }
                    res.render('places.html',{username:"Anonyme", mapgeojson: mapgeojson, placelist: placelist})
                    })
                })

            }

        })
    });

app.get('/myProfile.html', function (req, res) {
    if(req.session.username !== undefined){
        res.render('myProfile.html',{username:req.session.username, fullname: req.session.fullname, email:req.session.email})
    }else{
        req.session.errorMessage = "You are not connected, you cant access to your profile\n please login or create a account."
        res.redirect('index.html')
    }

})

app.get('/logout.html', function (req, res) {
    req.session.destroy()
    res.redirect('index.html')
})
app.post("/addplace", function (req, res, next) {
    if (req.body.latitude == "") {
        req.session.errorMessage = "You need to pick a location to add a place"
        res.render('addPlaces.html',{username:req.session.username, style:'block',errorMessage:req.session.errorMessage})
        req.session.errorMessage = ''
    } else {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            else {
                const dbo = db.db('hiddenplaces-db');
                const latlong = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];
                dbo.collection("geojson").insertOne({
                    type: "Feature",
                    properties: {
                        name: req.body.name,
                        popupContent: req.body.description
                    },
                    geometry: {
                        type: "Point",
                        coordinates: latlong
                    }
                }, (err, doc) => {
                    if (err) throw err;
                })
                dbo.collection("places").insertOne({
                    name: req.body.name,
                    coordinate: latlong,
                    rating: req.body.rating,
                    description: req.body.description,
                }, (err, doc) => {
                    if (err) throw err;
                })
                res.redirect("index.html")
            }
        })
    }
});
app.post("/search", function (req, res, next) {
    MongoClient.connect(url, function (err, db) {
        let config = {
            tagTypes: ['art', 'ver', 'nom'],
            strictness: false,
            minimumLength: 2,
            debug: false
        };
        var nlpToolsFr = new NlpjsTFr(req.body.input, config);
        var lemmatizedWords = nlpToolsFr.lemmatizer();
        var wordlist = "";
        if (lemmatizedWords.length === 1 && lemmatizedWords[0]["word"] === lemmatizedWords[0]["lemma"]) {
            wordlist = lemmatizedWords[0]["word"];
        } else {
            for(const element of lemmatizedWords) {
                if (element["word"] === element["lemma"]) {
                    wordlist += element["word"] + " ";
                } else {
                    wordlist += element["word"] + " ";
                    wordlist += element["lemma"] + " ";
                }
            }
            wordlist = wordlist.slice(0,-1);
        }
        if (err) throw err;
        else {
            const dbo = db.db('hiddenplaces-db');
            dbo.collection("places").createIndex({name: "text"}).then(r => {
                dbo.collection("places").find({"$text": {"$search": wordlist,"$caseSensitive": false,
                        "$diacriticSensitive": false }}).toArray((err,placelist) => {
                            if (placelist.length === 0) {
                                if(req.session.username !== undefined){
                                    res.render('index.html',{username:req.session.username, style:'block',errorMessage:"No place was found"})
                                }
                                res.render('index.html',{username:"Anonyme", style:'block',errorMessage:"No place was found"})
                            } else {
                                dbo.collection("geojson").createIndex({"properties.name": "text"}).then(r => {
                                    dbo.collection("geojson").find({
                                        "$text": {
                                            "$search": wordlist, "$caseSensitive": false,
                                            "$diacriticSensitive": false
                                        }
                                    }).toArray((err, doc) => {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            var mapgeojson = JSON.stringify(doc);
                                            if (req.session.username !== undefined) {
                                                res.render('places.html', {
                                                    username: req.session.username,
                                                    mapgeojson: mapgeojson,
                                                    placelist: placelist
                                                })
                                            }
                                            res.render('places.html', {
                                                username: "Anonyme",
                                                mapgeojson: mapgeojson,
                                                placelist: placelist
                                            })
                                        }
                                    })
                                })
                            }
                    })
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
console.log('---- Site: https://localhost:8080/index.html ----');

