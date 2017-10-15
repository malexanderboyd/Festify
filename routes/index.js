var express = require('express');
var router = express.Router();
var Multer  = require('multer');
var fs = require('fs');
var gcs = require('../gc');
var records = require('../playlistStash');
var spotify = require('../spotify')
var stateKey = 'spotify_auth_state';
var uuid = require('small-uuid');
var HashMap = require('hashmap');
var allPlaylists = new HashMap();
var workingLists = [];
const Logging = require('@google-cloud/logging');
var kue = require('kue');

var environment = require('node-env-file');

try {
    environment('./private/redis.env');
} catch (e) {
    console.log("Couldn't find environment variables: " + e);
}



var workerQueue = kue.createQueue({
    redis: process.env.REDISURL
});




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



function startFestifyProcess(photo, done) {
    try {
        gcs.uploadImage(photo)
            .then(function (extractedText) {
                spotify.findArtists(extractedText)
                    .then(function (artist) {
                        spotify.generateSongList(artist)
                            .then((songs) => {
                                spotify.generatePlayList(songs)
                                    .then((playlistID) => {
                                        console.log(`Playlist Built`);
                                        records.allPlaylists.set(queueID, playlistID);
                                        done();
                                    })
                                    .catch((err) => {
                                        console.log(`Generating Playlist Error:`);
                                        console.error(err);
                                        return done(new Error(err));
                                    })
                            })
                            .catch((err) => {
                                console.error(`Generating Playlist Error:`);
                                console.error(err);
                                return done(new Error(err));
                            });

                    })
                    .catch(function (err) {
                        console.error(`Finding Artist Error:`);
                        console.error(err);
                        return done(new Error(err));
                    });
            })
            .catch((err) => {
                console.error(`Uploading Image Error:`);
                console.error(err);
                return done(new Error(err));        
            });
    }
    catch (ex) {
        errorLogger.error(ex);
        return done(new Error(ex));
    }
}


workerQueue.process('festifyProcessing', function (job, done) {
    startFestifyProcess(job.data.photo, done);
});


router.post('/v1/upload', multer.any(), (req, res, next) => {

    if (!req.files) {
        res.status(400).send('No file uploaded.');
        next();
    }
    else if (!spotify.isAuthed()) {
        res.status(401).send("Not Authorized, Must call /v1/authMe before uploading images.");
        next();
    }
    else {
        let job = workerQueue.create('festifyProcessing', {
            title: 'Processing new photo',
            photo: req.files
        }).save(function (err) {
            if (!err) console.log(job.id);
        });
        let queueID = uuid.create();
        let queueURL = "/build/" + job.id;
        records.workingLists.push(job.id);
        res.status(202).send(queueURL);
    }
});

module.exports = {
    router
};