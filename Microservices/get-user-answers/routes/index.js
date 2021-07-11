var express = require('express');
var router = express.Router();

const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const { pool } = require("../config/database");

const redis_pool = require('redis-connection-pool')('myRedisPool', {
        url: process.env.REDIS_URL
    }
);

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

passport.use('token', new JWTStrategy(
    {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    function(token, done) {
        return done(null, { email: token.email });
    }
));

router.get('/get-user-answers/',
    passport.authenticate('token', { session: false }),
    function(req, res, next) {
        let user_email = req.user.email
        pool.query(
            `SELECT q.question_text, a.answer_text, a.date_answered 
             FROM UserAnswers as a, Question as q
             WHERE a.user_email = $1 AND a.question = q.question_id`,
            [user_email],
            (err, results) => {
                console.log(results.rows);
                if (err) {
                    res.status(400);
                    return res.json({error: "Something went wrong..."});
                } else {
                    let answer = results.rows.map((row) => {
                        return {
                            question: row['question_text'],
                            text: row['answer_text'],
                            date: row['date_answered'].toISOString().replace(/T/, ' ').replace(/\..+/, '')}
                    });
                    return res.json({ answers: answer });
                }
            }
        )
    });

router.post('/bus', (req, res) => {
    let event = req.body.event;
    let channel = req.body.channel;
    console.log("here")
    console.log("event")
    console.log(event)

    if(channel === "answer-question") {
        let answer_text = event['answer_text'];
        let date_answered = event['date_answered'];
        let question_id = event['question_id'];
        let user_email = event['user_email'];

        pool.query(
            `INSERT INTO useranswers (answer_text, date_answered, user_email, question)
             VALUES ($1, to_timestamp($2/ 1000.0), $3, $4)`,
            [answer_text, date_answered, user_email, question_id],
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.status(500);
                    res.json({ error: "Something went wrong..." });
                }
                else res.json({ success: "Successfully inserted user answer" });
            }
        );

    }
    else if(channel === "create-question") {
        let question_id = event['id'];
        let question_text = event['QuestionText'];

        pool.query(
            `INSERT INTO Question (question_id, question_text)
             VALUES ($1, $2)`,
            [question_id, question_text],
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.status(500);
                    res.json({ error: "Something went wrong..." });
                }
                else res.json({ success: "Successfully inserted user question" });
            }
        );
    }
});

module.exports = router;
