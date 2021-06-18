var express = require('express');
var router = express.Router();


const { pool } = require("../config/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/create-question/',
    function(req, res, next) {
        let title = req.body['title'];
        let QuestionText = req.body['QuestionText'];
        let keywords = req.body['keywords'];
        let DateAsked = req.body['DateAsked'];
        let user_id = req.body['user_id'];
        pool.query(
            `SELECT * FROM "question" WHERE title = $1`,
            [title],
            (err, results) => {
                if (err) {
                  console.log(err);
                } else if (results.rows.length > 0) {
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
                              return res.json({ error: "Something went wrong..." });
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
                                                          return res.json({ error: "Something went wrong..." });
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
                                                                      return res.json({error: "Something went wrong..." });
                                                                    }
                                                                }
                                                            );
                                                        } else {
                                                            res.status(400);
                                                            return res.json({ error: "Something went wrong..." });
                                                        }
                                                    }
                                                );
                                            }
                                        }
                                    )
                                }
                                if (keywords_added) res.json({ results: "Successfully added question " + String(results.rows[0]['title']) });
                                else {
                                    res.status(400);
                                    return res.json({ error: "Something went wrong..." });
                                }
                            }
                        }
                    );
              }
            }
        );
    })

router.post('/answer-question/',
    function(req, res, next) {
        let question_id = req.body['question_id'];
        let answer_text = req.body['answer_text'];
        let date_answered = req.body['date_answered'];
        let user_id = req.body['user_id'];
        pool.query(
            `SELECT * FROM "question" WHERE id = $1`,
            [question_id],
            (err, results) => {
                if (err) return res.json({ error: "Something went wrong..." });
                else if (results.rows.length > 0) {
                    pool.query(
                        `INSERT INTO "answer" (answertext, dateanswered, userid, questionid)
                                VALUES ($1, to_timestamp($2/ 1000.0), $3, $4)
                                RETURNING id`,
                        [answer_text, date_answered, user_id, question_id],
                        (err, results) => {
                            if (err) {
                                console.log(err);
                                res.json({ error: "Something went wrong..." });
                            } else {
                                return res.json( { results: results.rows[0]['id'] } )
                            }
                        }
                    )
                }
                else return res.json({ error: "No question with id = " + String(question_id) });
            }
        )
    })

router.get('/get-question-and-answers/:id',
    function(req, res, next) {
        let question_id = req.params.id;
        pool.query(
            `SELECT * FROM "question" WHERE id = $1`,
            [question_id],
            (err, results) => {
                if(err) return res.json( { error: 'Something went wrong...' } );
                else if (results.rows.length > 0 ) {
                    let title = results.rows[0]['title'];
                    let question_text = results.rows[0]['questiontext'];
                    let date_asked = results.rows[0]['dateasked'].toISOString().replace(/T/, ' ').replace(/\..+/, '');
                    let user_id = results.rows[0]['userid'];
                    pool.query(
                        `SELECT email FROM "User" WHERE id = $1`,
                        [user_id],
                        (err, results) => {
                            if(err) return res.json({ error: 'Something went wrong...' });
                            else {
                                let user_email = results.rows[0]['email'];
                                pool.query(
                                    `SELECT keyword FROM "keyword" as k, "keyword_question" as kq WHERE k.ID = kq.KeywordID AND kq.QuestionID = $1`,
                                    [question_id],
                                    (err, results) => {
                                        if (err) return res.json({ error: 'Something went wrong...' });
                                        else {
                                            let keywords = [];
                                            for( let i = 0; i < results.rows.length; i++){
                                                keywords.push(results.rows[i]['keyword']);
                                            }
                                            pool.query(
                                                `SELECT a.*, u.Email FROM "answer" as a, "User" as u WHERE a.questionID = $1 AND a.userid = u.ID`,
                                                [question_id],
                                                (err, results) => {
                                                    if(err) return res.json({ error: 'Something went wrong...' });
                                                    else {
                                                        let answers = [];
                                                        for( let i = 0; i < results.rows.length; i++){
                                                            answers.push({ answer_text: results.rows[i]['answertext'], date_answered: results.rows[i]['dateanswered'].toISOString().replace(/T/, ' ').replace(/\..+/, ''), user: results.rows[i]['email']})
                                                        }
                                                        return res.json( { id: question_id, title: title, QuestionText: question_text, DateAsked: date_asked, UserID: { email: user_email}, Keywords: keywords, Answers: answers } )
                                                    }
                                                }
                                            )
                                        }
                                    }
                                )
                            }
                        }
                    )
                }
                else return res.json( { error: 'No question with such id' } );
            }
        )
    }
)

router.post('/get-questions/',
    function(req, res, next) {
        let keywords = req.body['keywords'];
        let date_from = req.body['date_from'];
        let date_to = req.body['date_to'];
        let user_string = req.body['from_user'] ? ` AND UserID = ${req.body['from_user']} ` : ``;
        let query_string = ``;
        if (keywords.length !== 0) {
            query_string += `(SELECT * FROM (`;
            let first = true;
            for( let i = 0; i < keywords.length; i++) {
                if(first) {
                    first = false;
                    query_string += `SELECT questionid FROM "keyword_question" WHERE keywordid IN (SELECT id AS Keyword_id FROM "keyword" WHERE keyword='${keywords[i]}')`;
                }
                else query_string += ` UNION ALL SELECT questionid FROM "keyword_question" WHERE keywordid IN (SELECT id AS Keyword_id FROM "keyword" WHERE keyword='${keywords[i]}')`;
            }
            query_string += `
                    INTERSECT ALL
                        SELECT id as questionid FROM "question" WHERE dateasked > to_timestamp(${date_from}/ 1000.0) 
                        AND dateasked < to_timestamp(${date_to}/ 1000.0)`+ user_string +`)ss
                        GROUP BY questionid
                        ORDER BY COUNT(*) DESC)
                        `
        }
        else {
            query_string = `SELECT id as questionid FROM "question" WHERE dateasked > to_timestamp(${date_from}/ 1000.0) 
                        AND dateasked < to_timestamp(${date_to}/ 1000.0)`+ user_string;
        }
        pool.query(
            query_string,
            [],
            async (err, results) => {
                if(err) return res.json({ error: "Something went wrong..." });
                else {
                    let questions = [];
                    let questions_added = 0;
                    let total_questions = results.rows.length;
                    for( let i = 0; i < results.rows.length; i++) {
                        await pool.query(
                            `SELECT * FROM "question" WHERE id = $1`,
                            [results.rows[i]['questionid']],
                            async (err, results) => {
                                if(err) res.json({ error: "Something went wrong..." });
                                else {
                                    await questions.push({ id: results.rows[0]['id'], title: results.rows[0]['title']});
                                    if(++questions_added === total_questions) return res.json( { questions: questions });
                                }
                            }
                        )
                    }
                    if(results.rows.length === 0) return res.json( { questions: questions });
                }
            }
        )
    })

router.post('/get-questions-per-keyword/',
    function(req, res, next) {
        let user_string = req.body['user_id'] ? ` AND kq.questionID = q.ID AND q.UserID = $1` : ``
        let array = req.body['user_id'] ? [req.body['user_id']] : []
        pool.query(
            `SELECT  count(*), k.Keyword FROM Keyword_question as kq, keyword as k, question as q
                                         WHERE k.id = kq.KeywordID` + user_string + `
                                         GROUP BY k.Keyword
                                         ORDER BY count(*) DESC`,
            array,
            (err, results) => {
                if (err) return res.json({ error: "Something went wrong..." });
                else {
                    let answer = results.rows.map((row) => {
                        return { keyword: row['keyword'], count: row['count'] }
                    })
                    return res.json( { questions_per_keyword: answer });
                }
            }
        )
    })

router.post('/get-questions-per-period/',
    function(req, res, next) {
        let date_from = req.body['date_from']
        let date_to = req.body['date_to']
        let period = req.body['period']
        let user_string = req.body['user_id'] ? ` AND UserID = $3` : ``
        let array = req.body['user_id'] ? [date_from, date_to, req.body['user_id']] : [date_from, date_to]
        pool.query(
            `SELECT  count(*), to_char(DateAsked,'YYYY-MM-DD') as date 
                FROM question
                WHERE DateAsked >= to_timestamp($1/ 1000.0) AND DateAsked <= to_timestamp($2/ 1000.0)` + user_string + `
                GROUP BY date
                ORDER BY date`,
            array,
            (err, results) => {
                if (err) return res.json({ error: "Something went wrong..." });
                else {
                    let returnedDates = results.rows.map((row) => {
                        return row['date']
                    })
                    let answer = []
                    let j = 0
                    for(let i = 0; i < period.length; i++) {
                        if(returnedDates.includes(period[i])) answer.push({ date: period[i], count: results.rows[j++]['count'] })
                        else answer.push({ date: period[i], count: 0 })
                        if(i === period.length - 1) return res.json( { questions_per_period: answer });
                    }
                }
            }
        )
    })

router.post('/get-answers-per-period/',
    function(req, res, next) {
        let date_from = req.body['date_from']
        let date_to = req.body['date_to']
        let period = req.body['period']
        let user_string = req.body['user_id'] ? ` AND UserID = $3` : ``
        let array = req.body['user_id'] ? [date_from, date_to, req.body['user_id']] : [date_from, date_to]
        pool.query(
            `SELECT  count(*), to_char(DateAnswered,'YYYY-MM-DD') as date 
                FROM answer
                WHERE DateAnswered >= to_timestamp($1/ 1000.0) AND DateAnswered <= to_timestamp($2/ 1000.0)` + user_string + `
                GROUP BY date
                ORDER BY date`,
            array,
            (err, results) => {
                if (err) return res.json({error: "Something went wrong..."});
                else {
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

router.post('/get-user-answers/',
    async function(req, res, next) {
        let user_id = req.body["user_id"]
        pool.query(
            `SELECT q.QuestionText, a.AnswerText, a.DateAnswered 
                    FROM answer as a, question as q 
                    WHERE a.UserID = $1 AND q.ID = a.questionID`,
            [user_id],
            (err, results) => {
                if (err) return res.json({error: "Something went wrong..."});
                else {
                    let total_answers = results.rows.length
                    let answers_added = 0
                    let answers = []
                    for(let i = 0; i < total_answers; i++) {
                        answers.push({ question: results.rows[i]['questiontext'], text: results.rows[i]['answertext'], date: results.rows[i]['dateanswered'].toISOString().replace(/T/, ' ').replace(/\..+/, '')});
                        if(++answers_added === total_answers) return res.json( {answers: answers});
                    }
                }
            }
        )
    })

module.exports = router;
