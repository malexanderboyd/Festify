var express = require('express');
var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../../tmp/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage })

var gcs = require('../gc');
var spotify = require('../spotify')
var stateKey = 'spotify_auth_state';

var HashMap = require('hashmap');
var ArtistList = new HashMap();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Festify Alpha' });
});


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


router.post('/test/submit', upload.single('fileUpload'), function (req, res, next) {

    //console.log(req.file);
    // fieldname:
    // originalname:
    // encoding
    // mimetype
    // destination
    // filename
    // path
    // size
    var foundFile = req.file;
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
                                                console.log(data);
                                                res.statusCode = 200;
                                                res.render('test', { title: 'GENERATION COMPLETE' });
                                        }).catch(function (err) {
                                            console.log(err);
                                        });
                                    }
                                 
                                }).catch(function (err) {
                                    console.error(err);
                                });
                            //res.render('index', { title: 'Uploaded' });
                            
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

});

module.exports = router;
