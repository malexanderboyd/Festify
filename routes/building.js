var express = require('express');
var router = express.Router();
var playlistMaster = require('./index');

// get building playlist information.
router.get('/:id', function (req, res, next) {
    let queueId = req.params.id;
    if (playlistMaster.allPlaylists.has(queueId)) {
        res.status(200).send(playlistMaster.allPlaylists.get(queueId));
        playlistMaster.allPlaylists.remove(queueId);
        playlistMaster.workingLists.splice(playlistMaster.workingLists.indexOf(queueId), 1);
    } else if (playlistMaster.workingLists.indexOf(queueId) != -1) {
        res.status(202).send();
    } else {
        res.status(410).send();
    };

});


module.exports = router;
