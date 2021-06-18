var express = require('express');
var router = express.Router();

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
        return done(null, { email: token.email, id: token.id });
    }
));

router.post('/create-question/',
    passport.authenticate('token', { session: false }),
    function(req, res, next) {
      let title = req.body['title'];
      let QuestionText = req.body['QuestionText'];
      let keywords = req.body['keywords'] ? req.body['keywords'] : [];
      let DateAsked = Date.now();
      if (!title || !QuestionText){
        // res.status(400);
        return res.json({error: "Please provide all fields"});
      }
      else {
        let user_id = req.user.id
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
                    `INSERT INTO "question" (title, QuestionText, DateAsked, UserID)
                            VALUES ($1, $2, to_timestamp($3/ 1000.0), $4)
                            RETURNING title, id`,
                    [title, QuestionText, DateAsked, user_id],
                    (err, results) => {
                      if (err) {
                        console.log(err);
                        res.status(400);
                        return res.json({error: "Something went wrong..."});
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
                        if (keywords_added) res.json({success: "Successfully added question " + String(results.rows[0]['title'])});
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

router.post('/answer-question/',
    passport.authenticate('token', { session: false }),
    function(req, res, next) {
      let question_id = req.body['questionID'];
      let answer_text = req.body['AnswerText'];
      let date_answered = Date.now();
      if (!question_id || !answer_text) {
        res.status(400);
        return res.json({error: "Please provide all fields"});
      }
      else {
        pool.query(
            `SELECT * FROM "question" WHERE id = $1`,
            [question_id],
            (err, results) => {
              if (err) {
                console.log(err);
                res.status(400);
                return res.json({error: "Something went wrong..."});
              }
              else if (results.rows.length > 0) {
                let user_id = req.user.id
                pool.query(
                    `INSERT INTO "answer" (answertext, dateanswered, userid, questionid)
                                VALUES ($1, to_timestamp($2/ 1000.0), $3, $4)
                                RETURNING id`,
                    [answer_text, date_answered, user_id, question_id],
                    (err, results) => {
                      if (err) {
                        console.log(err);
                        res.status(400);
                        res.json({error: "Something went wrong..."});
                      } else {
                        return res.json( { id: results.rows[0]['id'] } )
                      }
                    }
                )
              }
              else {
                res.status(400);
                return res.json({error: "No question with id = " + String(question_id)});
              }
            }
        )
      }
    })

module.exports = router;
