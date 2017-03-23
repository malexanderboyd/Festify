var environment = require('node-env-file');
try {
    environment('./private/spotify.env');
} catch (e) {
    console.log("Couldn't find environment variables: " + e);
}

const SpotifyWebAPI = require('spotify-web-api-node');
var spotifyClient = new SpotifyWebAPI({
    clientId: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    redirectUri: 'http://localhost:3000/'
});


var ArtistList = [];
var foundArtist = false;
module.exports = {
    spotifyClient,
    ArtistList,

    findArtists: function (results) {
        var localResults = [];
        var workingResults = results;

        return new Promise(function (fulfill, reject) {

                if (!findArtistSearch(workingResults))
                {
                    console.error("Error: findArtistSearch CB: " + err);
                    reject(err);
                }
                else
                    fulfill(ArtistList); // we want to send back a list of valid arist

        });
    }
};


function findArtistSearch(rs) {


    if (rs == null)
        return null;

    var i = 1; // 0 index contains ALL text as a blob, start start at 1
    while (i < rs.length) {

        var currentSubSet = split(rs, i); // creates subset of 4 words based on current index
        findArtist(currentSubSet)





    }



    return true; // return true when ArtistList is full of valid artist
    }


    function findArtist(currentSubSet) {

        return new Promise(function (fulfill, reject) {
              var searchTerm = currentSubSet.toString();
              searchTerm = searchTerm.replace(/,/g, " ");
              spotifyClient.searchArtists(searchTerm, { limit: 1 })
              .then(function(data))
              {

              }
              .catch(function(ex))
              {

              }
        });

    }


    /* Helper function to easily divide up subsets */
    function split(rs, i) {
        var curr = [];
        if (rs[i] != null)
            curr.push(rs[i]);
        if (rs[i + 1] != null)
            curr.push(rs[i + 1]);
        if (rs[i + 2] != null)
            curr.push(rs[i + 2]);
        if (rs[i + 3] != null)
            curr.push(rs[i + 3]);

        return curr;
    }



/* Spotfi API prevents rapid API calls, so must limit the rate somehow... */
function sleep(milliseconds)
{
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
