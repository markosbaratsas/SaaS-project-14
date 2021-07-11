var express = require('express');
var router = express.Router();
require("dotenv").config();

const { pool } = require("../config/database");

const redis_pool = require('redis-connection-pool')('myRedisPool', {
        url: process.env.REDIS_URL
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

router.post('/get-questions/',
    function(req, res, next) {
        let keywords = req.body['keywords'] ? req.body['keywords'] : [];
        let date_from = req.body['date_from'] ? (new Date(String(req.body['date_from']))).getTime() : 0o000000000000;
        let date_to = req.body['date_to'] ? (new Date(String(req.body['date_to']))).getTime() : 9999999999999;
        if (!(date_from >= 0)) {
            res.status(400);
            return res.json({error: "Please provide a valid date_from format..." });
        }
        if (!(date_to > 0)) {
            res.status(400);
            return res.json({error: "Please provide a valid date_to format..." });
        }
        let user_id = req.body['from_user'];
        let user_string = user_id ? ` AND UserID = ${user_id} ` : ``;
        let query_string = ``;
        if (keywords.length !== 0) {
            query_string += `(SELECT * FROM (`;
            let first = true;
            for( let i = 0; i < keywords.length; i++) {
                if(first) {
                    first = false;
                    query_string += `SELECT questionid FROM "keyword_question" WHERE keywordid IN (SELECT id AS Keyword_id FROM "keyword" WHERE keyword='${keywords[i]}')`;
                }
                else query_string += ` UNION ALL SELECT questionid FROM "keyword_question" WHERE keywordid IN (SELECT id AS Keyword_id FROM "keyword" WHERE keyword='${keywords[i]}')`;
            }
            query_string += `
                INTERSECT ALL
                    SELECT id as questionid FROM "question" WHERE dateasked > to_timestamp(${date_from}/ 1000.0) 
                    AND dateasked < to_timestamp(${date_to}/ 1000.0)`+ user_string +`)ss
                    GROUP BY questionid
                    ORDER BY COUNT(*) DESC)
                    `
            }
            else {
                query_string = `SELECT id as questionid FROM "question" WHERE dateasked > to_timestamp(${date_from}/ 1000.0) 
                            AND dateasked < to_timestamp(${date_to}/ 1000.0)`+ user_string;
        }
        // console.log(query_string)
        pool.query(
            query_string,
            [],
            async (err, results) => {
                if(err) {
                    res.status(400);
                    return res.json({error: "Something went wrong..." });
                }
                else {
                    let questions = [];
                    let questions_added = 0;
                    let total_questions = results.rows.length;
                    for( let i = 0; i < results.rows.length; i++) {
                        await pool.query(
                            `SELECT * FROM "question" WHERE id = $1`,
                            [results.rows[i]['questionid']],
                            async (err, results) => {
                                if(err) {
                                  res.status(400);
                                  res.json({error: "Something went wrong..." });
                                }
                                else {
                                  // console.log({ id: results.rows[0]['id'], title: results.rows[0]['title']})
                                  await questions.push({ id: results.rows[0]['id'], title: results.rows[0]['title']});
                                  if(++questions_added === total_questions) return res.json( {questions: questions});
                                }
                            }
                        )
                    }
                    if(results.rows.length === 0) return res.json( {questions: questions});
                }
            }
        )
    })

router.post('/bus', (req, res) => {
    let event = req.body.event;
    let question_id = event['id']
    let title = event['title'];
    let keywords = event['keywords'];
    let DateAsked = event['DateAsked'];
    pool.query(
        `INSERT INTO "question" (ID, title, DateAsked, userID)
        VALUES ($1, $2, to_timestamp($3/ 1000.0), 0)
        RETURNING title, id`,
        [question_id, title, DateAsked],
        async (err, results) => {
            if (err) {
                console.log(err);
                res.status(400);
                return res.json({error: "Something went wrong..."});
            } else {
                let keywords_added = true;
                for (let i = 0; i < keywords.length; i++) {
                    pool.query(
                        `SELECT id FROM "keyword" WHERE keyword = $1`,
                        [keywords[i]],
                        (err, result) => {
                            if (err) {
                                console.log(err);
                                keywords_added = false;
                            } else if (result.rows.length > 0) {
                                pool.query(
                                    `INSERT INTO "keyword_question" (KeywordID, QuestionID)
                                                    VALUES ($1, $2)`,
                                    [result.rows[0]['id'], question_id],
                                    (err, result) => {
                                        if (err) {
                                            keywords_added = false;
                                            res.status(400);
                                            return res.json({error: "Something went wrong..."});
                                        }
                                    }
                                );
                            } else {
                                pool.query(
                                    `INSERT INTO "keyword" (keyword)
                                          VALUES ($1)
                                          RETURNING id`,
                                    [keywords[i]],
                                    (err, results) => {
                                        if (err) {
                                            console.log(err);
                                            keywords_added = false;
                                        } else if (results.rows.length > 0) {
                                            pool.query(
                                                `INSERT INTO "keyword_question" (KeywordID, QuestionID)
                                                    VALUES ($1, $2)`,
                                                [results.rows[0]['id'], question_id],
                                                (err, result) => {
                                                    if (err) {
                                                        console.log(err);
                                                        keywords_added = false;
                                                        res.status(400);
                                                        return res.json({error: "Something went wrong..."});
                                                    }
                                                }
                                            );
                                        } else {
                                            res.status(400);
                                            return res.json({error: "Something went wrong..."});
                                        }
                                    }
                                );
                            }
                        }
                    )
                }
                if (keywords_added) return res.json({ success: "Successfully added question and keywords" });
                else {
                    res.status(400);
                    return res.json({error: "Something went wrong..."});
                }
            }
        }
    );
    });

module.exports = router;
