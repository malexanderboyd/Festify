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



module.exports = {
    spotifyClient,
    ArtistList,

    findArtists: function (results) {
        var localResults = [];
        var workingResults = results;

        return new Promise(function (fulfill, reject) {

                if (!findArtistSearch(workingResults))
                {
                    console.error("Error: findArtistSearch CB");
                    reject();
                }
                else
                    fulfill(ArtistList); // we want to send back a list of valid arist

        });
    }
};


var promiseList = [];
var ArtistList = [];
var foundArtist = false;
var i = 1;

function findArtist(currentSubSet)
{
    return new Promise(resolve => {
        if (currentSubSet == null)
            return;

        var searchTerm = currentSubSet.toString();
        searchTerm = searchTerm.replace(/,/g, " ");
        resolve(spotifyClient.searchArtists(searchTerm, { limit: 1 })
            .then(function (data) {
                handleSearchResults(data, currentSubSet);
            }));

    });
}

async function findArtistSearch(rs) {


    if (rs == null)
        return null;
    var lastI = 0;
        while (i < 50)
           {
            var currentSubSet = split(rs, i); // creates subset of 4 words based on current indxen
            console.log("Searching for: " + currentSubSet.toString());
            var curr = await findArtist(currentSubSet);
            console.log(curr);
            sleep(1500);
        }

}




function handleSearchResults(data, currentSubSet) {
    i++;
    if (data.body.artists != null) {
        console.log("HandleSearch Results for Search: " + currentSubSet.toString())
        console.log(data.body.artists.items);
    }
    else {
        currentSubSet.pop();
        findArtist(currentSubSet);
    }
        
}



    function processResponse(err, data) {
        if (err) {
            console.log("Something went wrong, processResponse() : " + err)
        } else {
            console.log("Process Response Callback");
            console.log(data.body.artists);
            i++;
        }
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
