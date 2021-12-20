// Import module

//Module to run server
let express = require('express');
let session = require('express-session');
let app = express();

//Module to session, body form and cookie
let bodyParser = require('body-parser');
let consolidate = require('consolidate');

//Module for the DB MongoDB
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let url = 'mongodb://localhost:27017/';

// Module for the SSL certificate
let https = require('https');
let fs = require('fs');

// other module
let NlpjsTFr = require('nlp-js-tools-french');
let bcrypt = require('bcryptjs');
const {ObjectId} = require("mongodb");
let crypto = require('crypto');


// Create the Cookie settings
app.use(session({
    //Random secret each time we restart the server
    secret: crypto.randomBytes(20).toString("hex"),
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        httpOnly: true,
        secure: true,
        maxAge: 600000,//10 min of session cookie after that you must reconnect
    }
}))

// At each action on the site the maxAge is given at the beginning
function validateCookie(req,res) {
    const { maxAge } = req;
}

//Create body for the info send by form
app.use(bodyParser.json({limit: '16mb', extended:false}))
app.use(bodyParser.urlencoded({limit: '16mb', extended: false}))

//use hogan and set the files with HTML and CSS
app.engine('html', consolidate.hogan);
app.set('views', 'static');


//render the good html
//Send index.html, Send errormessage on a popup if error and connect the user if is connected with cookie
app.get('/index.html', function (req, res) {
    validateCookie(req,res)
    if (req.session.errorMessage === undefined) {

        if (req.session.username !== undefined) {
            res.render('index.html', {
                username: req.session.username,
                style: 'none'
            })
        } else {
            res.render('index.html', {
                username: 'Anonyme',
                style: 'none'
            })
        }

    } else {

        if (req.session.username !== undefined) {
            res.render('index.html', {
                username: req.session.username,
                style: 'block',
                errorMessage: req.session.errorMessage
            })
            //delete the errorMessage
            req.session.errorMessage = undefined
        } else {
            res.render('index.html', {
                username: 'Anonyme',
                style: 'block',
                errorMessage: req.session.errorMessage
            })
            //delete the errorMessage
            req.session.errorMessage = undefined
        }
    }
})

// send login.html, redirect on index.html whit errormessage popup if user already connected
app.get('/login.html', function (req, res) {
    if (req.session.username !== undefined) {
        req.session.errorMessage = "You are already connected, please disconnect before login or sign-up a other account"
        res.redirect('index.html')
    } else if (req.session.errorMessage === undefined) {
        res.render('login.html', {username: "Anonyme"})
    } else {
        res.render('login.html', {username: "Anonyme", errorMessage: req.session.errorMessage, style: 'block'})
        req.session.errorMessage = undefined
    }
})

// check if user in db and log it if exist, if not send login.html and don't connect
app.post('/login', (req, res,) => {
    if (req.session.username !== undefined) {
        res.redirect('login.html')
    }
    MongoClient.connect(url, function (err, db) {
        const dbo = db.db('hiddenplaces-db');
        dbo.collection('users').findOne({$or: [{username: req.body.login_identifiant}, {email: req.body.login_identifiant}]}, (err, doc) => {
            if (doc == null) {
                req.session.errorMessage = 'No account with the username : ' + req.body.login_identifiant + ' was found, maybe you are not registered.'
                res.redirect('login.html')
            } else {
                // Compare the password and the hashed password stocked in the DB
                bcrypt.compare(req.body.login_password, doc.hashed_password, function (err, resBcrypt) {
                    if (resBcrypt) {
                        req.session._id = doc._id
                        req.session.username = doc.username
                        req.session.fullname = doc.fullname
                        req.session.email = doc.email
                        req.session.errorMessage = undefined
                        res.redirect('index.html')
                    } else {
                        req.session.errorMessage = "Wrong password"
                        res.redirect('login.html')
                    }
                });
            }
        })

    })
})

// sinup user if all input are correct
app.post('/signup', (req, res,) => {
    if (req.session.username !== undefined) {
        res.redirect('login.html')
    }
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        if (req.body.signup_password !== req.body.signup_confirmed_password) {
            req.session.errorMessage = 'The password and the confirmation password was not the same.'
            db.close().then(r => res.redirect('login.html'))
        } else {
            const dbo = db.db('hiddenplaces-db');
            dbo.collection('users').findOne({$or:[{username: req.body.signup_username},{email:req.body.signup_email}]}, (err, doc) => {
                if (err) throw err;
                if (doc != null) {
                    if(doc.username === req.body.signup_username){
                        req.session.errorMessage = "The username : '" + req.body.signup_username + "' is already taken. Try a other"
                        res.redirect('login.html')
                    }else{
                        req.session.errorMessage = "The email : '" + req.body.signup_email + "' is already taken. Try a other"
                        res.redirect('login.html')
                    }
                } else {

                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(req.body.signup_password, salt, function (err, hash) {
                            dbo.collection('users').insertOne({
                                username: req.body.signup_username,
                                hashed_password: hash,
                                fullname: req.body.signup_fullname,
                                email: req.body.signup_email,
                            }, function (err){
                                if (err) throw err;
                                req.session.errorMessage = "You account has been successfully created. Now you can login at it."
                                db.close()
                                res.redirect('login.html')
                            })
                        })
                    })
                }
            })
        }
    })
})

// sned addPlace only if connected
app.get('/addPlaces.html', function (req, res) {
    if (req.session.username !== undefined) {
        res.render('addPlaces.html', {
            username: req.session.username
        })
    } else {
        req.session.errorMessage = 'You must be connected to add a place\n Please login or sign-up'
        res.redirect('index.html')
    }

})

//add a places on the db
app.post("/addplace", function (req, res) {
    if (req.body.latitude === "") {
        req.session.errorMessage = "You need to pick a location to add a place"
        res.render('addPlaces.html', {
            username: req.session.username,
            style: 'block',
            errorMessage: req.session.errorMessage
        })
        req.session.errorMessage = undefined
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
                        popupContent: req.body.description,
                        author: req.session.username
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
                    author: req.session.username,
                    commentaries: []
                }, (err, doc) => {
                    if (err) throw err;
                    db.close()
                    res.redirect("index.html")
                })
            }
        })
    }
});

// send Places with the places on the map
app.get('/places.html', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        else {
            const dbo = db.db('hiddenplaces-db');
            dbo.collection("geojson").find({}).toArray((err, doc) => {
                dbo.collection("places").find({}).toArray((err, placelist) => {
                    var mapgeojson = JSON.stringify(doc);
                    var placelistJSON = JSON.stringify(placelist);
                    if (req.session.username !== undefined) {
                        res.render('places.html', {
                            username: req.session.username,
                            mapgeojson: mapgeojson,
                            placelist: placelist,
                            placelistJSON: placelist
                        })
                    }
                    db.close().then(r =>
                        res.render('places.html', {
                        username: "Anonyme",
                        mapgeojson: mapgeojson,
                        placelist: placelist})
                    )
                })
            })
        }
    })
});

//can add a comment on every place
app.post("/addComment", function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        else {
            const dbo = db.db('hiddenplaces-db');
            if (req.session.username === undefined) {
                var username = "Anonyme";
            } else {
                var username = req.session.username;
            }
            dbo.collection("places").find({name: req.body.commentId}).toArray((err, place) => {
                dbo.collection("places").updateOne(place[0], {
                    $push: {
                        commentaries: {
                            comment: req.body.comment,
                            commentAuthor: username
                        }
                    }
                }, function (err) {
                    if (err) throw err;
                    db.close()
                    res.redirect("places.html")
                });
            })


        }
    })
});

// send Myprofile if connected if not send index with a errormessage
app.get('/myProfile.html', function (req, res) {
    if (req.session.errorMessage !== undefined) {
        res.render('myProfile.html', {
            username: req.session.username,
            fullname: req.session.fullname,
            email: req.session.email,
            errorMessage: req.session.errorMessage,
            style: 'block'
        })
        req.session.errorMessage = undefined;
    } else if (req.session.username !== undefined) {
        res.render('myProfile.html', {
            username: req.session.username,
            fullname: req.session.fullname,
            email: req.session.email,
        })
    } else {
        req.session.errorMessage = "You are not connected, you cant access to your profile. Please login or create a account."
        res.redirect('index.html')
    }

})

// change the data of the account
app.post('/changeData', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        if (req.body.newPassword !== req.body.confirmNewPassword) {
            req.session.errorMessage = 'The password is not the same as the confirm password'
            db.close().then(r => res.redirect('myProfile.html'))
        } else {
            const dbo = db.db('hiddenplaces-db');
            dbo.collection('users').findOne({$or: [{username: req.body.newUsername}, {email: req.body.newEmail}]}, (err, doc) => {
                if (err) throw err;
                if (doc != null) {
                    if(doc.username === req.body.signup_username){
                        req.session.errorMessage = "The username : '" + req.body.signup_username + "' is already taken. Try a other"
                        db.close().then(r =>res.redirect('login.html'))

                    }else{
                        req.session.errorMessage = "The email : '" + req.body.signup_email + "' is already taken. Try a other"
                        db.close().then(r =>res.redirect('login.html') )
                    }
                } else {
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(req.body.newPassword, salt, function (err, hash) {

                            dbo.collection('users').updateOne({
                                _id: ObjectId(req.session._id),
                                username: req.session.username,
                                fullname: req.session.fullname,
                                email: req.session.email,
                            }, {
                                $set: {
                                    username: req.body.newUsername,
                                    hashed_password: hash,
                                    fullname: req.body.newFullname,
                                    email: req.body.newEmail,
                                }
                            },function (err){
                                req.session.username = req.body.newUsername
                                req.session.fullname = req.body.newFullname
                                req.session.email = req.body.newEmail
                                db.close()
                                res.redirect('index.html')
                            })
                        })
                    })
                }
            })
        }
    })
})

//delete the account
app.post('/delete', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        if (req.session.email !== req.body.delete_confirm_email) {
            req.session.errorMessage = 'The email you gave is not the same as your HiddenPlaces account'
            db.close().then(r => res.redirect("myProfile.html"))

        } else {

            const dbo = db.db('hiddenplaces-db');
            dbo.collection('users').deleteOne({
                _id: ObjectId(req.session._id),
                username: req.session.username,
                fullname: req.session.fullname,
                email: req.session.email,
            },function(err){
                db.close()
                res.redirect('logout.html')
            })

        }
    })
})

//disconnect the user
app.get('/logout.html', function (req, res) {
    req.session.destroy()
    res.redirect('index.html')
})

// show the search
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
            for (const element of lemmatizedWords) {
                if (element["word"] === element["lemma"]) {
                    wordlist += element["word"] + " ";
                } else {
                    wordlist += element["word"] + " ";
                    wordlist += element["lemma"] + " ";
                }
            }
            wordlist = wordlist.slice(0, -1);
        }
        if (err) throw err;
        else {
            const dbo = db.db('hiddenplaces-db');
            dbo.collection("places").createIndex({name: "text"}).then(r => {
                dbo.collection("places").find({
                    "$text": {
                        "$search": wordlist, "$caseSensitive": false,
                        "$diacriticSensitive": false
                    }
                }).toArray((err, placelist) => {
                    if (placelist.length === 0) {
                        req.session.errorMessage = "No place was found"
                        db.close().then(r => res.redirect("index.html"))
                    } else {
                        dbo.collection("geojson").createIndex({"properties.name": "text"}).then(r => {
                            dbo.collection("geojson").find({
                                "$text": {
                                    "$search": wordlist, "$caseSensitive": false,
                                    "$diacriticSensitive": false
                                }
                            }).toArray((err, doc) => {
                                if (err) {
                                    throw err;
                                } else {
                                    var mapgeojson = JSON.stringify(doc);
                                    if (req.session.username !== undefined) {
                                        db.close().then(r =>
                                            res.render('places.html', {
                                                username: req.session.username,
                                                mapgeojson: mapgeojson,
                                                placelist: placelist
                                            })
                                        )
                                    }
                                    db.close().then(r=>
                                        res.render('places.html', {
                                            username: "Anonyme",
                                            mapgeojson: mapgeojson,
                                            placelist: placelist
                                        })
                                    )
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

