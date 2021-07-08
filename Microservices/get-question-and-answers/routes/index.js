var express = require('express');
var router = express.Router();

const { pool } = require("../config/database");

router.get('/get-question-and-answers/:id',
    function(req, res, next) {
        let question_id = req.params.id;
        pool.query(
            `SELECT * FROM "question" WHERE id = $1`,
            [question_id],
            (err, results) => {
                if(err) {
                    res.status(400);
                    return res.json( { error: 'Something went wrong...1' } );
                }
                else if (results.rows.length > 0 ) {
                    let title = results.rows[0]['title'];
                    let question_text = results.rows[0]['questiontext'];
                    let date_asked = results.rows[0]['dateasked'].toISOString().replace(/T/, ' ').replace(/\..+/, '');
                    let user_email = results.rows[0]['useremail'];
                    pool.query(
                        `SELECT keyword FROM "keyword" as k, "question_keyword" as kq WHERE k.ID = kq.KeywordID AND kq.QuestionID = $1`,
                        [question_id],
                        (err, results) => {
                            if (err) {
                                res.status(400);
                                return res.json({error: err});
                            } else {
                                let keywords = [];
                                for( let i = 0; i < results.rows.length; i++){
                                    keywords.push(results.rows[i]['keyword']);
                                }
                                pool.query(
                                    `SELECT * From "answer" as a WHERE a.questionid = $1`,
                                    [question_id],
                                    (err, results) => {
                                        if(err) {
                                            res.status(400);
                                            return res.json({error: 'Something went wrong...3'});
                                        }
                                        else {
                                            let answers = [];
                                            for( let i = 0; i < results.rows.length; i++){
                                                answers.push({
                                                    answer_text: results.rows[i]['answertext'],
                                                    date_answered: results.rows[i]['dateanswered'].toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                                                    user: results.rows[i]['useremail']
                                                });
                                            }
                                            return res.json( {
                                                id: question_id,
                                                title: title,
                                                QuestionText: question_text,
                                                DateAsked: date_asked,
                                                UserID: {
                                                    email: user_email
                                                },
                                                Keywords: keywords,
                                                Answers: answers
                                            });
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
