var express = require('express');
var router = express.Router();

const { pool } = require("../config/database");

router.get('/get-questions-per-keyword/',
    function(req, res, next) {
        pool.query(
            `SELECT * FROM "question_keyword"`,
            [],
            (err, results) => {
                if (err) {
                    res.status(400);
                    return res.json({error: "Something went wrong..."});
                }
                else {
                    let answer = results.rows.map((row) => {
                        return {keyword: row['keyword'], count: row['count'] }
                    })
                    return res.json({ questions_per_keyword: answer });
                }
            }
        )
    });

module.exports = router;
