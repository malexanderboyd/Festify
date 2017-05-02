var environment = require('node-env-file');

var HashMap = require('hashmap');


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
    findArtists
};


var ArtistList = new HashMap();
var foundArtist = true;
var processedList = false;
var i = 1

let originalData;

 function findArtists(dataSet)
{
    return new Promise(resolve => {
        if (dataSet == null)
                return;
        runArtistSearch(dataSet)
        .then((result) => {
            if(result != null)
            {
                resolve(ArtistList); // artist list should be full of valid artist now.
            }
        });
    });
}

async function runArtistSearch(rs) {

    if (rs == null)
        return null;


    originalData = rs;
    while (!processedList)
    {
        if (foundArtist == true) {
            var currentSubSet = split(rs, i); // creates subset of 4 words based on current index
            foundArtist = false;
        }
            await findArtist(currentSubSet)
            .then((result) => {
                if (result != null && result != undefined)
                {
                    
                    console.log("Current findArtistSearch");
                    console.log(result);
                }
                else {
                    console.log("Undefined or Null Results.");
                }
                }).catch(function (err) {
                    console.error(err);
                });
            sleep(1600); // Spotify Rate Limiting, yay!
     }

    console.log("Done Finding Valid Artists: Current List \n");
    console.log(ArtistList.join("\n"));
    return true;
}

 async function findArtist(searchTerm)
 {
     if (searchTerm == null)
            return null;

         let searchData = searchTerm.toString();
         let zeroRE = "/0/g";
         let commaRE = "/,/gi";
         searchData = searchData.replace(/0/g, 'O');
         searchData = searchData.replace(/,/g, ' ');
         console.log("Current Search Term: " + searchData);
        
         let resultData;
         try {
             if (searchData != "") {
                 resultData = await spotifyClient.searchArtists(searchData, { limit: 1 })
             } else {
                 resultData = null;
             }
             //console.log(resultData);
             resultData = await handleSearchResults(resultData, searchTerm)
             return resultData;

         } catch (ex) {
             console.error(ex);
         }

           /*  .then((result) => {
                 if (result != null && result != undefined) {
                     handleSearchResults(result, subset);
                     console.log(result);
                     resultData = result;
                     resolve(resultData);
                 }
                 else {
                     handleSearchResults(result, subset);
                 }
             });*/

 }





function handleSearchResults(data, currentSubSet) {

    return new Promise(resolve => {


        if (data != null && data.body.artists.total > 0) {
            // spotify uses the artist Id to pull songs, we'll need this later.
            var artistID = data.body.artists.items[0].id;
            if (ArtistList.get(artistID) == -1) {
                console.log("HandleSearch Results for Search: " + currentSubSet.toString())
            }
            // Check if we're at the end of our list
            if (i + currentSubSet.length >= originalData.length) {
                processedList = true;
            }
            else {
                i += currentSubSet.length;
            }

            // add found Artist Name so we can use it for displaying later
            let artistName = currentSubSet.toString().replace(/[^\w\s]/gi, '');

            // HashMap so we can easily access names
            ArtistList.set(artistID, artistName);
            foundArtist = true;
            resolve(artistName);
        }
        else {
            currentSubSet.pop();
            if (currentSubSet.length == 0) {
                i += 4; // no valid artist in subgroup, goto next one.
            }
            resolve(null);
        }

    }).catch(function (err) {
        console.error(err);
    });
        
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
