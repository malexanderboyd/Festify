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
    redirectUri: 'http://localhost:3000/callback'
});


var scopes = ['playlist-modify-public'];
var state = 'spotify_auth_state';

var authorizeURL = spotifyClient.createAuthorizeURL(scopes, state);

function getAuthURL() {
    return authorizeURL;
}

function authorizeUser(code) {

    return new Promise(resolve => {
        spotifyClient.authorizationCodeGrant(code)
            .then(function (data) {
                console.log('The token expires in ' + data.body['expires_in']);
                console.log('The access token is ' + data.body['access_token']);
                console.log('The refresh token is ' + data.body['refresh_token']);

                // Set the access token on the API object to use it in later calls
                spotifyClient.setAccessToken(data.body['access_token']);
                spotifyClient.setRefreshToken(data.body['refresh_token']);
                resolve(true);
            }).catch(function (err) {
                console.log(err);
            });
    });
}


module.exports = {
    spotifyClient,
    ArtistList,
    findArtists,
    generateSongList,
    generatePlayList,
    getAuthURL,
    authorizeUser,
    getUserInfo
};



var playlistID = "";
var clientUsername = "";
var ArtistList = new HashMap();
var songsList = [];
var artistIDs = [];
var foundArtist = true;
var processedList = false;
var processedSongs = false;
var builtPlaylist = false;
var createdPlayList = false;
var i = 1;
var j = 0;
let originalData;



function getUserInfo() {

    return new Promise(resolve => {
        spotifyClient.getMe()
            .then(function (data) {
                if (data != null) {
                    try {
                        clientUsername = data.body.id; // grab user id to create playlist later
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                    resolve(data);
                }
            }).catch(function (err) {
                console.log(err);
            });
    })

}


function findArtists(dataSet) {
    return new Promise(resolve => {
        if (dataSet == null)
            return;
        runArtistSearch(dataSet)
            .then((result) => {
                if (result != null) {
                    resolve(ArtistList); // artist list should be full of valid artist now.
                }
            });
    });
}



function generateSongList(artists) {


    return new Promise(resolve => {
        if (artists == null)
            return;

        artists.forEach(function (value, key) {
            console.log("Key: " + key + "\nValue: " + value);
            artistIDs.push(key);
        });


        findTopTracks(artistIDs)
            .then((result) => {
                if (result != null) {
                    resolve(songsList);
                }
            }).catch(error => {
                console.error(error);
            });
    });
}


function generatePlayList(songs)
{
    return new Promise(resolve => {
        if (songs == null)
            return;


        buildPlayList(songs)
            .then((result) => {
                if (result != null) {
                    resolve(songsList);
                }
            }).catch(error => {
                console.error(error);
            });
    });

}

async function buildPlayList(songs) {
    try {
        let results;
        let playlistID;
       
        while (!createdPlayList) {
            results = await spotifyClient.createPlaylist(clientUsername, 'Festify Playlist', { 'public': true }) 
            console.log("Playlist creation Complete");
            if (results != null) {
                try {
                    playlistID = results.body.id;
                    createdPlayList = true;
                }
                catch (Ex) {
                    console.log("create playlist");
                    console.error(Ex);
                }

            }
        }

        let FFor = false;
        let SFor = false;
        let TFor = false;
        let FFin = false;

        var songSplitFourth = Math.floor((songsList.length) / 4);
        var songSplitHalf = Math.floor((songsList.length) / 2);
        var songSplitThird = Math.floor((songsList.length) * (3 / 4));

        while (!builtPlaylist && createdPlayList) {
            try {
                console.log("User: " + clientUsername);
                console.log("Playlist id: " + playlistID);
                if (!FFor) {
                    results = await spotifyClient.addTracksToPlaylist(clientUsername, playlistID, songsList.slice(0, songSplitFourth))
                        .then(function (data) {
                            console.log('Added 1st Fourth to playlist!');
                            FFor = true;

                        }, function (err) {
                            console.log('Something went wrong!', err);
                        });
                }
                else if (!SFor) {
                    results = await spotifyClient.addTracksToPlaylist(clientUsername, playlistID, songsList.slice(songSplitFourth, songSplitHalf))
                        .then(function (data) {
                            console.log('Added 2nd Fourth to playlist!');
                            SFor = true;

                        }, function (err) {
                            console.log('Something went wrong!', err);
                        });

                } else if (!TFor) {
                    results = await spotifyClient.addTracksToPlaylist(clientUsername, playlistID, songsList.slice(songSplitHalf, songSplitThird))
                        .then(function (data) {
                            console.log('Added 3rd Fourth to playlist!');
                            TFor = true;

                        }, function (err) {
                            console.log('Something went wrong!', err);
                        });
                } else if (!FFin) {
                    results = await spotifyClient.addTracksToPlaylist(clientUsername, playlistID, songsList.slice(songSplitThird, songsList.length-1))
                        .then(function (data) {
                            console.log('Added Last Fourth to playlist!');
                            TFor = true;

                        }, function (err) {
                            console.log('Something went wrong!', err);
                        });
                    builtPlaylist = true;
                    FFin = true;
                }
            }
            catch (ex) {
                console.log("Build playlist");
                console.error(ex);
            }
        }


        return true;

    }
    catch (Ex) {
        console.error(Ex);
    }



}



async function findTopTracks(artists) {

      try {
        let results;
        let artistID;
        while (!processedSongs) {
            sleep(300); // yay spotify limiting!
            artistID = artistIDs[j];
            results = await spotifyClient.getArtistTopTracks(artistID, 'US')
            if (results != null) {
                console.log("song search results -" + j);
                //console.log(results);
                if (results.body != null && results.body.tracks != null && results.body.tracks.length >= 3) {
                    if (results.body.tracks[0] != null) {
                        var song = results.body.tracks[0].id;
                        songsList.push('spotify:track:' + song);
                    }
                    if (results.body.tracks[1] != null) {
                        var song = results.body.tracks[1].id;
                        songsList.push('spotify:track:' + song);
                    }
                    if (results.body.tracks[2] != null) {
                        var song = results.body.tracks[2].id;
                        songsList.push('spotify:track:' + song);
                    }
                }
                if (j + 1 > artistIDs.length) {
                    processedSongs = true;
                } else {
                    j++;
                }
            } else {
                if (j + 1 > artistIDs.length) {
                    processedSongs = true;
                } else {
                    j++;
                }
            }
        }
    }
    catch (e) {
        console.error(e);
    }
    return true;
    // // get top 3 tracks from each artists

}


function findTop(key) {
    return ;
}






async function runArtistSearch(rs) {

    if (rs == null)
        return null;


    originalData = rs;
    while (!processedList) {
        if (foundArtist == true) {
            var currentSubSet = split(rs, i); // creates subset of 4 words based on current index
            foundArtist = false;
        }
        await findArtist(currentSubSet)
            .then((result) => {
                if (result != null && result != undefined) {

                    console.log("Current findArtistSearch");
                    console.log(result);
                }
                else {
                    console.log("Undefined or Null Results.");
                }
            }).catch(function (err) {
                console.error(err);
            });
        sleep(500); // Spotify Rate Limiting, yay!
    }
    //console.log("Done Finding Valid Artists: Current List \n");
    /*ArtistList.forEach(function (value, key) {
        console.log("Key: " + key + "\nValue: " + value);
    });*/
    return true;
}

async function findArtist(searchTerm) {
    if (searchTerm == null)
        return null;

    let searchData = searchTerm.toString();
    let zeroRE = "/0/g";
    let commaRE = "/,/gi";
    searchData = searchData.replace(/0/g, 'O');
    searchData = searchData.replace(/,/g, ' ');
    searchData = searchData.trim();
    console.log("Current Search Term: " + searchData);
    let resultData;
    try {
        if (searchData != "") {
            console.log("sending this to spotify: " + searchData);
            resultData = await spotifyClient.searchArtists(searchData, { limit: 1 })
        } else {
            return resultData = null;
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
                console.log("Skipping current subSet");
                if (i + 1 >= originalData.length) {
                    processedList = true;
                } else {
                    i += 1; // no valid artist in subgroup, goto next one.
                }
                foundArtist = true; // so we can keep moving on list
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
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
