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

module.exports = router;
