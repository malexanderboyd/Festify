var express = require('express');
var router = express.Router();
var records = require('../playlistStash');

// get building playlist information.
router.get('/:id', function (req, res, next) {
    let queueId = req.params.id;
    if (records.allPlaylists.has(queueId)) {
        res.status(200).send(records.allPlaylists.get(queueId));
        records.allPlaylists.remove(queueId);
        records.workingLists.splice(records.workingLists.indexOf(queueId), 1);
    } else if (records.workingLists.indexOf(queueId) != -1) {
        res.status(202).send();
    } else {
        res.status(410).send();
    };

});


module.exports = router;
