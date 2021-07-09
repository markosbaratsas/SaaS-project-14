var express = require('express');
var router = express.Router();
const axios = require('axios');

router.post('/answer-question', async function(req, res, next) {
    let details = {
        method: 'post',
        url: 'http://localhost:3003/bus/',
        data: {
            'event': req.body,
            'channel': 'answer-question'
        }
    }
    await axios(details)
        .then(() => {
            res.json({ success: "Successfully added answer" });
        })
        .catch((er) => {
            console.log(er);
            res.status(400);
        })
});

module.exports = router;
