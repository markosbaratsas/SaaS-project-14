var express = require('express');
var router = express.Router();

const { pool } = require("../config/database");

const redis_pool = require('redis-connection-pool')('myRedisPool', {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    }
);

redis_pool.hget('subscribers', 'create-question', async(err, data) => {
    let currentSubscribers = JSON.parse(data);
    let alreadySubscribed = false;

    let myAddress = process.env.MY_ADDRESS;
    for(let i = 0; i < currentSubscribers.length; i++) {
        if (currentSubscribers[i] === myAddress)
            alreadySubscribed = true;
    }
    if(alreadySubscribed === false){
        currentSubscribers.push(myAddress);
        redis_pool.hset('subscribers', 'create-question', JSON.stringify(currentSubscribers), () => {})
        console.log("Subscribed");
    }
    else
        console.log("Already subscribed")
});

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
                        console.log(row);
                        return {keyword: row['keyword'], count: row['count'] }
                    })
                    return res.json({ questions_per_keyword: answer });
                }
            }
        )
    });


router.post('/bus', (req, res) => {
    let event = req.body.event;
    let keywords = event['keywords'] ? event['keywords'] : [];

    for (let i = 0; i < keywords.length; i++) {
        pool.query(
            `SELECT * FROM question_keyword WHERE keyword = $1`,
            [keywords[i]],
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.status(500);
                    res.json({ error: "Something went wrong..." });
                }
                else if(results.rows.length > 0) {
                    pool.query(
                        `UPDATE question_keyword
                        SET count = $1
                        WHERE keyword = $2`,
                        [parseInt(results.rows[0]['count']) + 1, keywords[i]],
                        (err, results) => {
                            if (err) {
                                console.log(err);
                                res.status(500);
                                res.json({error: "Something went wrong..."});
                            } else if (i === (keywords.length - 1)) res.json({success: "Successfully increased count of date"});
                        }
                    )
                } else {
                    pool.query(`INSERT INTO question_keyword (keyword, count)
                                VALUES ($1, 1)`,
                        [keywords[i]],
                        (err, results) => {
                            if (err) {
                                console.log(err);
                                res.status(500);
                                res.json({ error: "Something went wrong..." });
                            }
                            else if (i === (keywords.length - 1)) res.json({ success: "Successfully increased count of date" });
                        }
                    )
                }
            }
        );
    }
})

module.exports = router;
