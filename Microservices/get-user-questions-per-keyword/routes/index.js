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

module.exports = router;
