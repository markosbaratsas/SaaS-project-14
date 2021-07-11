const express = require('express');
const router = express.Router();

const axios = require('axios');

require("dotenv").config();

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

router.post('/answer-question/',
    passport.authenticate('token', { session: false }),
    async function(req, res, next) {
        let question_id = req.body['questionID'];
        let answer_text = req.body['AnswerText'];
        let date_answered = Date.now();
        if (!question_id || !answer_text) {
            res.status(400);
            return res.json({error: "Please provide all fields"});
        }
        else {
            let user_email = req.user.email
            pool.query(
                `INSERT INTO Answer (answertext, dateanswered, questionid, user_email)
                                VALUES ($1, to_timestamp($2/ 1000.0), $3, $4)
                                RETURNING id`,
                [answer_text, date_answered, question_id, user_email],
                async (err, results) => {
                    if (err) {
                        console.log(err);
                        res.status(400);
                        res.json({error: "Something went wrong..."});
                    } else {
                        let details = {
                            method: 'post',
                            url: process.env.CHOREOGRAPHER_URL,
                            data: {
                                'event': {
                                    'id': results.rows[0]['id'],
                                    'answer_text': answer_text,
                                    'date_answered': date_answered,
                                    'question_id': question_id,
                                    'user_email': user_email
                                },
                                'channel': 'answer-question'
                            }
                        }

                        await axios(details)
                            .then(() => {
                                return res.json( { id: results.rows[0]['id'] } );
                            })
                            .catch((er) => {
                                console.log(er);
                                res.status(400);
                            })
                    }
                }
            )
        }
    })

module.exports = router;
