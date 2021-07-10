var express = require('express');
var router = express.Router();

const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

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

passport.use('token', new JWTStrategy(
    {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    function(token, done) {
        return done(null, { email: token.email });
    }
));


router.get('/get-user-questions/',
    passport.authenticate('token', { session: false }),
    function(req, res, next) {
        let user_email = req.user.email
        pool.query(
            `SELECT question_id, question_title 
             FROM UserQuestions 
             WHERE user_email = $1`,
            [user_email],
            (err, results) => {
                if (err) {
                    res.status(400);
                    return res.json({error: "Something went wrong..."});
                } else {
                    let answer = results.rows.map((row) => {
                        return { id: row['question_id'], title: row['question_title']}
                    })
                    return res.json({ questions: answer });
                }
            }
        )
    });

router.post('/bus', (req, res) => {
    let event = req.body.event;
    let question_id = event['id'];
    let question_title = event['title'];
    let user_email = event['user_email'];

    pool.query(
        `INSERT INTO userquestions (question_id, question_title, user_email)
         VALUES ($1, $2, $3)`,
        [question_id, question_title, user_email],
        (err, results) => {
            if (err) {
                console.log(err);
                res.status(500);
                res.json({ error: "Something went wrong..." });
            }
            else res.json({ success: "Successfully inserted user question" });
        }
    );
});

module.exports = router;
