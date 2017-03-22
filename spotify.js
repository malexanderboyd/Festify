const SpotifyWebAPI = require('spotify-web-api-node');
var spotifyClient = new SpotifyWebAPI({
  clientId : '8969dde512b748f1b47555759c6226d5',
  clientSecret : '640853b425d44374b4bb7619ccf33a5c',
  redirectUri : 'http://localhost:3000/'
});

      var ArtistList = [];

module.exports = {
  spotifyClient,
  ArtistList,

  extractText: function(results)
  {
      var localResults = [];
      var workingResults = results;

      console.log(workingResults);
      for(var i = 1; i <= 10; i++)
      {
        console.log("ITERATION: " + i);
        localResults.push(workingResults[i]);
        if(workingResults[i+1] != null)
          localResults.push(workingResults[i+1]);
        if(workingResults[i+2] != null)
          localResults.push(workingResults[i+2]);
        if(workingResults[i+3] != null)
          localResults.push(workingResults[i+3]);

          extractHelper(localResults)
          localResults = [];
      }


      return true;


  }


};

function split(subset)
{
  var localSet = [];
  if(subset[0] != null) {
  localSet.push(subset[0].toString());

  }
  if(subset[1] != null) {
  localSet.push(subset[1].toString());

  }
  if(subset[2] != null) {
  localSet.push(subset[2].toString());

  }
  if(subset[3] != null) {
  localSet.push(subset[3].toString());

  }

  return localSet;
}

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

  localSet = split(subset);
  counter = localSet.length;





    var searchTerm = localSet.toString();
    searchTerm = searchTerm.replace(/,/g, " ");

  sleep(1200);
  // Search artists whose name contains
  spotifyClient.searchArtists(searchTerm, { limit: 1 }, function(err, data) {
    console.log("Search  Term: " + searchTerm);
    if (err) {
      console.error('Something went wrong', err.message);
      return;
    }
    if(data != null && data.body != null && data.body.artist != null && data.body.artist.items != null && data.body.artist.items[0] != null)
    {
      if(data != undefined && data.body != undefined && data.body.artist != undefined && data.body.artist.items != undefined && data.body.artist.items[0] != undefined)
      {
        console.log("Found match, added to list");
        var artistID = data.body.artist.items[0].id;
        ArtistList.push(artistID);
      }
    }
    else
     {
        localSet.pop();
        extractHelper(localSet);
      }
  });

     // spotify api pls dont blow up
    // end of spotify clientSecret

  } // end of helper



function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
