var express = require('express');
var router = express.Router();
var multer  = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage })

var gcs = require('../gc');
var spotify = require('../spotify')



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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
    var upload = req.file;
    var textData;
    try {
        gcs.retrieveText(upload) // upload to Google Cloud, and extract text using Google Vision
            .then(function (data) { // Use extracted text
                console.log("Step 4: Find Valid Arist - Start");
                console.log("Current Data: \n");
                console.log(data);
                textData = data;

                spotify.findArtists(textData) // Find valid artist within extracted text
                    .then(function (data) { //  generate playlist using returned valid artist
                        //spotify.generatePlayList(data);
                        res.render('index', { title: 'Uploaded' });
                        res.statusCode = 200;
                        console.log("Found dis artist list");
                        console.log(data);
                    }).catch(function (err) {
                        console.error(err);
                    });


                console.log("\n");              
            }).catch(function (err) {
                console.error(err);
            });
    }
    catch (ex) {
        console.error(ex);
    }

});

module.exports = router;
