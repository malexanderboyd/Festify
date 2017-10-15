var express = require('express');
var router = express.Router();
var Multer  = require('multer');
var fs = require('fs');
var gcs = require('../gc');
var spotify = require('../spotify')
var stateKey = 'spotify_auth_state';

var uuid = require('small-uuid');
var HashMap = require('hashmap');
var allPlaylists = new HashMap();
var workingLists = [];
const Logging = require('@google-cloud/logging');


const multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const projectId = 'festify-162216';
const logging = Logging({
    projectId: projectId
});
// The name of the log to write to
const logName = 'my-log';
// Selects the log to write to
const log = logging.log(logName);
// The metadata associated with the entry
const metadata = { resource: { type: 'global' } };




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Festify Alpha' });
});


router.post('/v1/authMe', (req, res, next) => {
    if (req.body == null) {
        res.status(400).send("Missing fields: authToken, username");
    } else if (req.body.authToken == null) {
        res.status(400).send("Missing field: authToken");
    } else if (req.body.username == null) {
        res.status(400).send("Missing field: username");
    } else {
        let authToken = req.body.authToken;
        let username = req.body.username;
        spotify.setAccessTkn(authToken, username);
        res.status(200).send();
    }
});


router.post('/v1/upload', multer.any(), (req, res, next) => {

    if(!req.files) {
    res.status(400).send('No file uploaded.');
    next();
    }
    else if (!spotify.isAuthed()) {
        res.status(401).send("Not Authorized, Must call /v1/authMe before uploading images.");
        next();
    }
    else {
        let queueID = uuid.create();
        let queueURL = "/build/" + queueID
        workingLists.push(queueID);
        res.status(202).send(queueURL);
        try {
            let image = req.files;
            gcs.uploadImage(image)
                .then(function (extractedText) {
                    spotify.findArtists(extractedText)
                        .then(function (artist) {
                            spotify.generateSongList(artist)
                                .then((songs) => {
                                    spotify.generatePlayList(songs)
                                        .then((playlistID) => {
                                            console.log(`Playlist Built`);                                        
                                            allPlaylists.set(queueID, playlistID);                                       
                                        })
                                        .catch((err) => {
                                            console.log(`Generating Playlist Error:`);
                                            console.error(err);
                                        })
                                })
                                .catch((error) => {
                                    console.error(`Generating Playlist Error:`);
                                    console.error(error);
                                });

                        })
                        .catch(function (err) {
                            console.error(`Finding Artist Error:`);
                            console.error(err);
                        });
                })
                .catch((err) => {
                    console.error(`Uploading Image Error:`);
                    console.error(err);
                });
        }
        catch (ex) {
            errorLogger.error(ex);
            res.status(500).send();
            next();
        }
    }

    //console.log(req.file);
    // fieldname:
    // originalname:
    // encoding
    // mimetype
    // destination
    // filename
    // path
    // size
    /* 
    console.log(req);
    console.log(req.files)
    let foundFile = req.files;
    try {
        gcs.retrieveText(foundFile) // upload to Google Cloud, and extract text using Google Vision
            .then(function (data) { // Use extracted text
                console.log("Step 4: Find Valid Artist - Start");
                console.log("Current Data: \n");
                console.log(data);
                textData = data;

                spotify.findArtists(textData) // Find valid artist within extracted text
                    .then(function (data) { 
                        if (data != null)
                        {
                            console.log("Step 5: Found Valid Artist - End\n Step 6: Find Artist Top Tracks");
                            ArtistList = data;
                            spotify.generateSongList(ArtistList) //  generate playlist using returned valid artist
                                .then(function (data) {
                                    if (data != null) {
                                        spotify.generatePlayList(data)
                                            .then(function (data) {
                                               // yay
                                            }).catch(function (err) {
                                                console.log("generatePlayList ind playlist");
                                            console.log(err);
                                        });
                                    }
                                 
                                }).catch(function (err) {
                                    console.log("generateSongList ind playlist");
                                    console.error(err);
                                });
 
                            
                          }
                    }).catch(function (err) {
                        console.error(err);
                        console.error(err.response);
                        console.error(err.response.responses);
                    });


                console.log("\n");              
            }).catch(function (err) {
                console.error(err);
                console.error(err.response);
                console.error(err.response.responses);
            });

        // used  to timeout doesn't occur, maybe send this template information about generation? will it complete? the world may never know!
        res.statusCode = 200;
        res.render('test', { title: 'Generating Playlist...' });
    }
    catch (ex) {
        console.error(err);
        console.error(err.response);
        console.error(err.response.responses);
    }
    */
});

module.exports = {
    router,
    allPlaylists,
    workingLists
};


/* Old Routes

router.get('/login', function (req, res) {


    var url = spotify.getAuthURL();
    res.redirect(url);
});


router.get('/begin', function (req, res) {
    res.render('begin', { title: 'Logged In' });
});

router.get('/callback', function (req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (code == null) {
        console.log("Problem authenticating user, try again?");
    }
    else {
        spotify.authorizeUser(code)
            .then(function (data) {
                if (data != null) {
                    spotify.getUserInfo()
                        .then(function (data) {
                            console.log(data);
                            res.redirect('/begin');
                        }).catch(function (err) {
                            console.log(err);
                        });
                }
            }).catch(function (error) {
                console.error(error);
            });
    }
});



router.get('/test/:id', function(req, res, next)
{
  res.render('test', { id: req.params.id});
});


*/
