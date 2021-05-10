const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send({
    test: "test",
    hello: "hello"
  });
});

module.exports = router;
