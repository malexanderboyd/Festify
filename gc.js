const Vision = require('@google-cloud/vision');
const spotify = require('./spotify');

const projectId = 'festify-162216';

var gcs = require('@google-cloud/storage')({
  projectId: projectId,

  // The path to your key file:
  keyFilename: './private/Festify-Storage.json'
});

// Instantiates a client
const visionClient = Vision({
  projectId: projectId
  //credentials: './private/Festify-Vision.json'
});


module.exports = {
  gcs,
  uploadImageToBucket: function(upload)
  {
    return new Promise(function (fulfill, reject) {
      var bucket = gcs.bucket('festify')
      bucket.upload(upload.path, function(err, file) {
        if (!err) {
          // "zebra.jpg" is now in your bucket.
          console.log("File Uploaded! Now Retrieving Text");
          retrieveText(upload)
          .then(function(data) {
            fulfill(true);
          }, function(err) {
            console.error(err);
            reject(err);
          });
        }
        else {
          reject(err);
        }
      });
    });
  }
}

function retrieveText(upload)
{
  return new Promise(function(fulfill, reject) {
    console.log("Retrieving Text");
    visionClient.detectText(gcs.bucket('festify').file(upload.filename))
    .then((results) => {
      const detections = results[0];
      spotify.extractText(detections)
      fulfill();

    },function(reason) {
      console.log(reason);
      reject(reason);
    });

  });
}
