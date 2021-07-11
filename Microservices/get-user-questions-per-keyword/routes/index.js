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

router.get('/get-user-questions-per-keyword/',
    passport.authenticate('token', { session: false }),
    function(req, res, next) {
        let user_email = req.user.email
        pool.query(
            `SELECT keyword, count FROM user_question_keyword
             WHERE user_email = $1`,
            [user_email],
            (err, results) => {
                if (err) {
                    res.status(400);
                    return res.json({error: err});
                }
                else {
                    let answer = results.rows.map((row) => {
                        return { keyword: row['keyword'], count: row['count'] }
                    })
                    return res.json({ questions_per_keyword: answer });
                }
            }
        )
    });


router.post('/bus', (req, res) => {
    let event = req.body.event;
    let keywords = event['keywords'] ? event['keywords'] : [];
    let user_email = event['user_email'];

    for (let i = 0; i < keywords.length; i++) {
        pool.query(
            `SELECT * FROM user_question_keyword WHERE keyword = $1`,
            [keywords[i]],
            (err, results) => {
                if (err) {
                    console.log(err);
                    res.status(500);
                    res.json({ error: "Something went wrong..." });
                }
                else if(results.rows.length > 0) {
                    pool.query(
                        `UPDATE user_question_keyword
                        SET count = $1
                        WHERE keyword = $2 AND user_email = $3`,
                        [parseInt(results.rows[0]['count']) + 1, keywords[i], user_email],
                        (err, results) => {
                            if (err) {
                                console.log(err);
                                res.status(500);
                                res.json({error: "Something went wrong..."});
                            } else if (i === (keywords.length - 1)) res.json({success: "Successfully increased count of date"});
                        }
                    )
                } else {
                    pool.query(`INSERT INTO user_question_keyword (keyword, count, user_email)
                                VALUES ($1, 1, $2)`,
                        [keywords[i], user_email],
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
});


module.exports = router;
