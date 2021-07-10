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

redis_pool.hget('subscribers', 'answer-question', async(err, data) => {
    let currentSubscribers = JSON.parse(data);
    let alreadySubscribed = false;

    let myAddress = process.env.MY_ADDRESS;
    for(let i = 0; i < currentSubscribers.length; i++) {
        if (currentSubscribers[i] === myAddress)
            alreadySubscribed = true;
    }
    if(alreadySubscribed === false){
        currentSubscribers.push(myAddress);
        redis_pool.hset('subscribers', 'answer-question', JSON.stringify(currentSubscribers), () => {})
        console.log("Subscribed");
    }
    else
        console.log("Already subscribed")
});

router.get('/get-question-and-answers/:id',
    function(req, res, next) {
        let question_id = req.params.id;
        pool.query(
            `SELECT * FROM "question" WHERE id = $1`,
            [question_id],
            (err, results) => {
                if(err) {
                    res.status(400);
                    return res.json( { error: 'Something went wrong...1' } );
                }
                else if (results.rows.length > 0 ) {
                    let title = results.rows[0]['title'];
                    let question_text = results.rows[0]['questiontext'];
                    let date_asked = results.rows[0]['dateasked'].toISOString().replace(/T/, ' ').replace(/\..+/, '');
                    let user_email = results.rows[0]['useremail'];
                    pool.query(
                        `SELECT keyword FROM "keyword" as k, "question_keyword" as kq WHERE k.ID = kq.KeywordID AND kq.QuestionID = $1`,
                        [question_id],
                        (err, results) => {
                            if (err) {
                                res.status(400);
                                return res.json({error: err});
                            } else {
                                let keywords = [];
                                for( let i = 0; i < results.rows.length; i++){
                                    keywords.push(results.rows[i]['keyword']);
                                }
                                pool.query(
                                    `SELECT * From "answer" as a WHERE a.questionid = $1`,
                                    [question_id],
                                    (err, results) => {
                                        if(err) {
                                            res.status(400);
                                            return res.json({error: 'Something went wrong...3'});
                                        }
                                        else {
                                            let answers = [];
                                            for( let i = 0; i < results.rows.length; i++){
                                                answers.push({
                                                    answer_text: results.rows[i]['answertext'],
                                                    date_answered: results.rows[i]['dateanswered'].toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                                                    user: results.rows[i]['useremail']
                                                });
                                            }
                                            return res.json( {
                                                id: question_id,
                                                title: title,
                                                QuestionText: question_text,
                                                DateAsked: date_asked,
                                                UserID: {
                                                    email: user_email
                                                },
                                                Keywords: keywords,
                                                Answers: answers
                                            });
                                        }
                                    }
                                )
                            }
                        }
                    )
                }
                else {
                    res.status(400);
                    return res.json( { error: 'No question with such id' } );
                }
            }
        )
    }
);



router.post('/bus', (req, res) => {
    let event = req.body.event;
    let channel = req.body.channel;
    if (channel == "create-question") {
        let keywords = event['keywords'] ? event['keywords'] : [];
        console.log(keywords);
        pool.query(
            `INSERT INTO question (id, title, questiontext, dateasked, useremail)
             VALUES ($1, $2, $3, to_timestamp($4/ 1000.0), $5)
             RETURNING title, id`,
            [event['id'], event['title'], event['QuestionText'], event['DateAsked'], event['user_email']],
            async (err, results) => {
                if (err) {
                    console.log(err);
                    res.status(500);
                    res.json({ error: "Something went wrong..." });
                }
                else {
                    let question_id = results.rows[0]['id'];
                    let keywords_added = true;
                    for (let i = 0; i < keywords.length; i++) {
                        pool.query(
                            `SELECT id
                            FROM "keyword"
                            WHERE keyword = $1`,
                            [keywords[i]],
                            (err, result) => {
                                if (err) {
                                    console.log(err);
                                    keywords_added = false;
                                } else if (result.rows.length > 0) {
                                    pool.query(
                                        `INSERT INTO "question_keyword" (KeywordID, QuestionID)
                                         VALUES ($1, $2)`,
                                        [result.rows[0]['id'], question_id],
                                        (err, result) => {
                                            if (err) {
                                                keywords_added = false;
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
                                                    `INSERT INTO "question_keyword" (KeywordID, QuestionID)
                                                     VALUES ($1, $2)`,
                                                    [results.rows[0]['id'], question_id],
                                                    (err, result) => {
                                                        if (err) {
                                                            console.log(err);
                                                            keywords_added = false;
                                                        }
                                                    }
                                                );
                                            } else {
                                                res.json({ error: "Something went wrong..." });
                                            }
                                        }
                                    );
                                }
                            }
                        )
                    }
                    if (keywords_added) res.json({ results: "Successfully added question with title: " + String(results.rows[0]['title']) });
                    else {
                        res.status(400);
                        return res.json({ error: "Something went wrong..." });
                    }
                }
            }
        );
    }
    else if (channel == "answer-question") {
        let answer_id = event['id'];
        let answer_text = event['answer_text'];
        let date_answered = event['date_answered'];
        let question_id = event['question_id'];
        let user_email = event['user_email'];

        pool.query(
            `SELECT * FROM "question" WHERE id = $1`,
            [question_id],
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.status(400);
                    return res.json({error: "Something went wrong..."});
                }
                else if (results.rows.length > 0) {
                    pool.query(
                        `INSERT INTO "answer" (id, answertext, dateanswered, useremail, questionid)
                                VALUES ($1, $2, to_timestamp($3/ 1000.0), $4, $5)
                                RETURNING id`,
                        [answer_id, answer_text, date_answered, user_email, question_id],
                        (err, results) => {
                            if (err) {
                                console.log(err);
                                res.status(400);
                                res.json({error: "Something went wrong..."});
                            } else {
                                return res.json( { id: results.rows[0]['id'] } )
                            }
                        }
                    )
                }
                else {
                    res.status(400);
                    return res.json({error: "No question with id = " + String(question_id)});
                }
            }
        )


    }
});

module.exports = router;
