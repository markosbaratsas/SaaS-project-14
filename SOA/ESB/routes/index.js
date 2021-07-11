var express = require('express');
var router = express.Router();
const axios = require("axios");
require("dotenv").config();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/authenticate',
    async function(req, res, next) {
        axios({
            method: 'get',
            url: process.env.AUTHENTICATOR_URL + 'authenticate/',
            headers: { Authorization: `Bearer ` + req.body["token"] }
        })
            .then((response) => {
                return res.json({ email: response.data.email, id: response.data.id })
            })
            .catch(() => {
                return res.json({ error: "Unauthorized" })
            })
    })

module.exports = router;
