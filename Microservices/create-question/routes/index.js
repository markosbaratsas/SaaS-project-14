var express = require('express');
var router = express.Router();
const axios = require('axios');

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

router.post('/create-question/',
    passport.authenticate('token', { session: false }),
    async function(req, res, next) {
        let title = req.body['title'];
        let QuestionText = req.body['QuestionText'];
        let keywords = req.body['keywords'] ? req.body['keywords'] : [];
        let DateAsked = Date.now();
        let question_id;
        if (!title || !QuestionText){
            // res.status(400);
            return res.json({error: "Please provide all fields"});
        }
        else {
            let user_email = req.user.email
            pool.query(
                `SELECT * FROM "question" WHERE title = $1`,
                [title],
                (err, results) => {
                    if (err) {
                        console.log(err);
                    } else if (results.rows.length > 0) {
                        // res.status(400);
                        return res.json({ error: 'Question title should be unique' });
                    } else {
                        pool.query(
                            `INSERT INTO "question" (title, QuestionText, DateAsked, user_email)
                            VALUES ($1, $2, to_timestamp($3/ 1000.0), $4)
                            RETURNING title, id`,
                            [title, QuestionText, DateAsked, user_email],
                            async (err, results) => {
                                if (err) {
                                    console.log(err);
                                    res.status(400);
                                    return res.json({error: "Something went wrong..."});
                                } else {
                                    question_id = results.rows[0]['id'];
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
                                    if (keywords_added){
                                        //SEND REQUEST TO CHOREOGRAPHER
                                        let details = {
                                            method: 'post',
                                            url: process.env.CHOREOGRAPHER_URL,
                                            data: {
                                                'event': {
                                                    'id': question_id,
                                                    'title': title,
                                                    'QuestionText': QuestionText,
                                                    'DateAsked': DateAsked,
                                                    'keywords': keywords,
                                                    'user_email': user_email
                                                },
                                                'channel': 'create-question'
                                            }
                                        }
                                        await axios(details)
                                            .then(() => {
                                                res.json({ success: "Successfully added question " + title });
                                            })
                                            .catch((er) => {
                                                console.log(er);
                                                res.status(400);
                                            })
                                    }
                                    else {
                                        res.status(400);
                                        return res.json({error: "Something went wrong..."});
                                    }
                                }
                            }
                        );
                    }
                }
            );
        }
    });

module.exports = router;
