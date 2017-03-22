var environment = require('node-env-file');
try{
    environment('./private/spotify.env');
}catch(e){
  console.log("Couldn't find environment variables: " + e);
}

const SpotifyWebAPI = require('spotify-web-api-node');
var spotifyClient = new SpotifyWebAPI({
  clientId : process.env.CLIENTID,
  clientSecret : process.env.CLIENTSECRET,
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

  sleep(1200);    // spotify api pls dont blow up

  // Search artists whose name contains current searchTerm
  spotifyClient.searchArtists(searchTerm, { limit: 1 })
  .then(function(data){

    console.log("Search  Term: " + searchTerm);
    console.log(data);
    if(data != null && data.body != null && data.body.artist != null && data.body.artist.items != null && data.body.artist.items[0] != null)
    {
        console.log("Found match, added to list");
        var artistID = data.body.artist.items[0].id;
        ArtistList.push(artistID);
    }
    else
     {
        localSet.pop();
        extractHelper(localSet);
      }

    })
    .catch(function(err) {
      console.error(err);
    });



} // end of helper



function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
