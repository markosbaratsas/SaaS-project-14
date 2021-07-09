var express = require('express');
var router = express.Router();

const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const { pool } = require("../config/database");

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
            `SELECT question_text, answer_text, date_answered 
                    FROM UserAnswers 
                    WHERE user_email = $1`,
            [user_email],
            (err, results) => {
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
                    return res.json({ questions_per_keyword: answer });
                }
            }
        )
    });

module.exports = router;
