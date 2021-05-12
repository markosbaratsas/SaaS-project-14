const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");

const { pool } = require("../config/database");

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const jwt = require('jsonwebtoken');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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

router.post('/create-question/',
    passport.authenticate('token', { session: false }),
    function(req, res, next) {
        let title = req.body['title'];
        let QuestionText = req.body['QuestionText'];
        let keywords = req.body['keywords'] === undefined ? [] : req.body['keywords'];
        let DateAsked = Date.now();
        if (!title || !QuestionText) res.json({error: "Please provide all fields"});
        else {
            const email = String(req.user.email);
            pool.query(
                `SELECT id FROM "User" WHERE email = $1`,
                [email],
                (err, results) => {
                    if (err) {
                        console.log(err);
                        res.json({error: "Something went wrong..."});
                    } else {
                        let UserID = results.rows[0]['id'];
                        pool.query(
                            `SELECT * FROM "question" WHERE title = $1`,
                            [title],
                            (err, results) => {
                                if (err) {
                                    console.log(err);
                                } else if (results.rows.length > 0) {
                                    return res.json({message: "Question already asked"});
                                } else {
                                    pool.query(
                                        `INSERT INTO "question" (title, QuestionText, DateAsked, UserID)
                                        VALUES ($1, $2, to_timestamp($3/ 1000.0), $4)
                                        RETURNING title, id`,
                                        [title, QuestionText, DateAsked, UserID],
                                        (err, results) => {
                                            if (err) {
                                                console.log(err);
                                                res.json({error: "Something went wrong..."});
                                            } else {
                                                let question_id = results.rows[0]['id'];
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
                                                                            res.json({error: "Something went wrong..."});
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
                                                                                        res.json({error: "Something went wrong..."});
                                                                                    }
                                                                                }
                                                                            );
                                                                        } else {
                                                                            res.json({error: "Something went wrong..."});
                                                                        }
                                                                    }
                                                                );
                                                            }
                                                        }
                                                    )
                                                }
                                                if (keywords_added) res.json({success: "Successfully added question " + String(results.rows[0]['title'])});
                                                else res.json({error: "Something went wrong..."});
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    }
                }
            );
        }
});




module.exports = router;
