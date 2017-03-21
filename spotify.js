var spotify = require('spotify-web-api-node');

var spotifyClient = new spotify({
  clientId : '8969dde512b748f1b47555759c6226d5',
  clientSecret : '640853b425d44374b4bb7619ccf33a5c',
  redirectUri : 'http://www.github.com/malexanderboyd'
});

module.exports = {
  spotifyClient,

  extractText: function(results)
  {
      var localResults = [];
      var workingResults = results;
      var ArtistList = [];
      for(var i = 1; i < workingResults.length; i++)
      {
        console.log("ITERATION: " + i);
        localResults.push(workingResults[i]);
        if(workingResults[i+1] != null)
          localResults.push(workingResults[i+1]);
        if(workingResults[i+2] != null)
          localResults.push(workingResults[i+2]);
        if(workingResults[i+3] != null)
          localResults.push(workingResults[i+3]);

          ArtistList.push(
            extractHelper(localResults)
          );

          localResults = [];
      }
      // break results into 4 word subsection

      // search 4 words vs spotifyClient

      // if return yes,
          // get top tracks
          // add to playlist

      // if return no,
          // remove 1 from 4 word, creating 3 word block
          // search vs spotify



  }


};


function extractHelper(subset)
{

  if(subset == null)
    return null;

  if(subset.length == 0)
    return null;

  console.log("Subset");
  console.log(subset);

  var localSet = [];
  var counter = 0; // used to keep track of how many words we're going to remove later from main array.


  if(subset[0] != null) {
  localSet.push(subset[0].toString());
  counter += 1;
  }
  if(subset[1] != null) {
  localSet.push(subset[1].toString());
  counter += 1;
  }
  if(subset[2] != null) {
  localSet.push(subset[2].toString());
  counter += 1;
  }
  if(subset[3] != null) {
  localSet.push(subset[3].toString());
  counter += 1;
  }




  var searchTerm = localSet.toString();
  console.log("Search Term");
  console.log(searchTerm);

  localSet.pop();
  extractHelper(localSet);
  // Search artists whose name contains
  /*spotifyClient.searchArtists('Love')
  .then(function(data) {
    console.log('Search artists by "Love"', data.body);
  }, function(err) {
    console.error(err);
  });*/

}
