const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");

const { pool } = require("../config/database");

const passport = require('passport');
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
                                    res.status(400);
                                    return res.json({ error: 'Question title should be unique' });
                                } else {
                                    pool.query(
                                        `INSERT INTO "question" (title, QuestionText, DateAsked, UserID)
                                        VALUES ($1, $2, to_timestamp($3/ 1000.0), $4)
                                        RETURNING title, id`,
                                        [title, QuestionText, DateAsked, UserID],
                                        (err, results) => {
                                            if (err) {
                                                console.log(err);
                                                res.status(400);
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
                                                                            res.status(400);
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
                                                                                        res.status(400);
                                                                                        res.json({error: "Something went wrong..."});
                                                                                    }
                                                                                }
                                                                            );
                                                                        } else {
                                                                            res.status(400);
                                                                            res.json({error: "Something went wrong..."});
                                                                        }
                                                                    }
                                                                );
                                                            }
                                                        }
                                                    )
                                                }
                                                if (keywords_added) res.json({success: "Successfully added question " + String(results.rows[0]['title'])});
                                                else {
                                                    res.status(400);
                                                    res.json({error: "Something went wrong..."});
                                                }
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

router.get('/get-question-and-answers/:id',
    passport.authenticate('token', { session: false }),
    function(req, res, next) {
        let question_id = req.params.id;
        pool.query(
            `SELECT * FROM "question" WHERE id = $1`,
            [question_id],
            (err, results) => {
                if(err) {
                    res.status(400);
                    return res.json( { error: 'Something went wrong...' } );
                }
                else if (results.rows.length > 0 ) {
                    let title = results.rows[0]['title'];
                    let question_text = results.rows[0]['questiontext'];
                    let date_asked = results.rows[0]['dateasked'];
                    let user_id = results.rows[0]['userid'];
                    pool.query(
                        `SELECT email FROM "User" WHERE id = $1`,
                        [user_id],
                        (err, results) => {
                            if(err) {
                                res.status(400);
                                return res.json({error: 'Something went wrong...'});
                            }
                            else {
                                let user_email = results.rows[0]['email'];
                                pool.query(
                                    `SELECT * FROM "answer" WHERE questionid = $1`,
                                    [question_id],
                                    (err, results) => {
                                        if(err) {
                                            res.status(400);
                                            return res.json({error: 'Something went wrong...'});
                                        }
                                        else {
                                            let answers = [];
                                            for( let i = 0; i < results.rows.length; i++){
                                                answers.push({ answer_text: results.rows[i]['answertext'], date_answered: results.rows[i]['dateasked'], user: results.rows[i]['userid']})
                                            }
                                            return res.json( { id: question_id, title: title, QuestionText: question_text, DateAsked: date_asked, UserID: { email: user_email}, Answers: answers } )
                                        }
                                    }
                                )
                            }
                        }
                    )
                }
                else {
                    res.status(400);
                    return res.json( { error: 'No question with such id' } );
                }
            }
        )
    }
)


module.exports = router;
