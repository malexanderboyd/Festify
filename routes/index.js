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




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test/:id', function(req, res, next)
{
  res.render('test', { id: req.params.id});
});


router.post('/test/submit', upload.single('fileUpload'), function(req, res, next) {

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

    gcs.uploadImageToBucket(upload);
    gcs.retrieveText(upload);
});

module.exports = router;
