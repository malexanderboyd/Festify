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
  uploadImage: function (file) {
      return new Promise((fulfill, reject) => {
          var bucket = gcs.bucket('festify');
          let gcsname = Date.now() + file[0].originalname;
          const blob = bucket.file(gcsname);
          const blobStream = blob.createWriteStream({
              metadata: {
                  contentType: file[0].mimetype
              },
          });

          blobStream.on('error', (err) => {
              reject(err);
          });

          blobStream.on('finish', () => {
             // const publicURL = `https://storage.googleapis.com/` + bucket.name + `/` + gcsname;
              // fulfill(publicURL);
              retrieveText(gcsname)
                  .then(function (text) {       
                      fulfill(text);
                  })
                  .catch(function (err) {
                      reject(err);
                  })
          });

          blobStream.end(file[0].buffer);
      });
    }
}

function retrieveText(fileName)
{
  return new Promise(function(fulfill, reject) {
      visionClient.detectText(gcs.bucket('festify').file(fileName))
    .then((results) => {
      const detections = results[0];
      fulfill(detections);
          }, function (reason) {
              reject(reason);
    });
  });
}
