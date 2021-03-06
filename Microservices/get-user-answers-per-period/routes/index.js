var express = require('express');
var router = express.Router();
require("dotenv").config();

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

passport.use('token', new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    function(token, done) {
      return done(null, { email: token.email });
    }
));

function getYYYYMMDD(d0) {
  const d = new Date(d0)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000).toISOString().split('T')[0]
}

let getDates = function(startDate, endDate) {
  let dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
  while (currentDate <= endDate) {
    dates.push(getYYYYMMDD(currentDate));
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};

router.post('/get-user-answers-per-period/',
    passport.authenticate('token', { session: false }),
    function(req, res, next) {
        let user_email = req.user.email
        let today = new Date()
        let date_from = req.body['date_from'] ? (new Date(String(req.body['date_from']))) : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7); //abstract one week to get last week's questions
        let date_to = req.body['date_to'] ? (new Date(String(req.body['date_to']))) : today;
        if (!(date_from >= 0)) {
            res.status(400);
            return res.json({error: "Please provide a valid date_from format..." });
        }
        if (!(date_to > 0)) {
            res.status(400);
            return res.json({error: "Please provide a valid date_to format..." });
        }
        let period = getDates(date_from, date_to)
        pool.query(
            `SELECT  count, to_char(DateAnswered,'YYYY-MM-DD') as date 
                FROM user_answer_period
                WHERE DateAnswered >= to_timestamp($1/ 1000.0) AND DateAnswered <= to_timestamp($2/ 1000.0) AND user_email = $3
                ORDER BY count DESC`,
            [date_from.getTime(), date_to.getTime(), user_email],
            (err, results) => {
                if (err) {
                    res.status(400);
                    return res.json({error: "Something went wrong..."});
                } else {
                    let returnedDates = results.rows.map((row) => {
                        return row['date']
                    })
                    let answer = []
                    let j = 0
                    for(let i = 0; i < period.length; i++) {
                        if(returnedDates.includes(period[i])) answer.push({ date: period[i], count: results.rows[j++]['count'] })
                        else answer.push({ date: period[i], count: 0 })
                        if(i === period.length - 1) return res.json( { answers_per_period: answer });
                    }
                }
            }
        )
    })

router.post('/bus', (req, res) => {
    let event = req.body.event;
    let DateAnswered = event['date_answered'];
    let user_email = event['user_email'];
    pool.query(
        `SELECT * FROM user_answer_period WHERE DateAnswered = date(to_timestamp($1/ 1000.0)) AND user_email = $2`,
        [DateAnswered, user_email],
        (err, results) => {
            if (err) {
                console.log(err);
                res.status(500);
                res.json({ error: "Something went wrong..." });
            }
            else if(results.rows.length > 0) {
                pool.query(
                    `UPDATE user_answer_period
                        SET count = $1
                        WHERE DateAnswered = date(to_timestamp($2/ 1000.0)) AND user_email = $3`,
                    [parseInt(results.rows[0]['count']) + 1, DateAnswered, user_email],
                    (err, results) => {
                        if (err) {
                            console.log(err);
                            res.status(500);
                            res.json({error: "Something went wrong..."});
                        } else res.json({success: "Successfully increased count of date"});
                    }
                )
            } else {
                pool.query(`INSERT INTO user_answer_period(DateAnswered, count, user_email) VALUES (date(to_timestamp($1/ 1000.0)), 1, $2)`,
                    [DateAnswered, user_email],
                    (err, results) => {
                        if (err) {
                            console.log(err);
                            res.status(500);
                            res.json({ error: "Something went wrong..." });
                        }
                        else res.json({ success: "Successfully increased count of date" });
                    }
                )
            }
        }
    );
})

module.exports = router;
