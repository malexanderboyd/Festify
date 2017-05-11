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
  projectId: projectId,
  keyFilename: './private/Festify-Vision.json'
});


module.exports = {
  gcs,
  retrieveText: function(upload)
  {
    return new Promise(function (fulfill, reject) {
        var bucket = gcs.bucket('festify');
      bucket.upload(upload.path, function(err, file) {
          if (!err) {
              console.log("Step 1: File " + upload.filename + " uploaded to bucket.");
          retrieveText(upload)
              .then(function (data) {
                  console.log("Step 2: Text Extract - Complete");
            fulfill(data);
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
    visionClient.detectText(gcs.bucket('festify').file(upload.filename))
    .then((results) => {
      const detections = results[0];
      fulfill(detections);
    },function(reason) {
      console.log(reason);
      reject(reason);
    });

  });
}
