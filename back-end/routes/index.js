const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");

const { pool } = require("../config/database");

const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

function getYYYYMMDD(d0) {
    const d = new Date(d0)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000).toISOString().split('T')[0]
}

var getDates = function(startDate, endDate) {
    var dates = [],
        currentDate = startDate,
        addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        };
    while (currentDate <= endDate) {
        dates.push(getYYYYMMDD(currentDate));
        currentDate = addDays.call(currentDate, 1);
    }
    return dates;
};

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
        let keywords = req.body['keywords'] ? req.body['keywords'] : [];
        let DateAsked = Date.now();
        if (!title || !QuestionText){
            // res.status(400);
            return res.json({error: "Please provide all fields"});
        }
        else {
            const email = String(req.user.email);
            pool.query(
                `SELECT id FROM "User" WHERE email = $1`,
                [email],
                (err, results) => {
                    if (err) {
                        console.log(err);
                        res.status(400);
                        return res.json({error: "Something went wrong..."});
                    } else {
                        let UserID = results.rows[0]['id'];
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
                                        [title, QuestionText, DateAsked, UserID],
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
                }
            );
        }
});

router.get('/get-question-and-answers/:id',
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
                    let date_asked = results.rows[0]['dateasked'].toISOString().replace(/T/, ' ').replace(/\..+/, '');
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
                                    `SELECT keyword FROM "keyword" as k, "keyword_question" as kq WHERE k.ID = kq.KeywordID AND kq.QuestionID = $1`,
                                    [question_id],
                                    (err, results) => {
                                        if (err) {
                                            res.status(400);
                                            return res.json({error: 'Something went wrong...'});
                                        } else {
                                            let keywords = [];
                                            for( let i = 0; i < results.rows.length; i++){
                                                keywords.push(results.rows[i]['keyword']);
                                            }
                                            pool.query(
                                                `SELECT a.*, u.Email FROM "answer" as a, "User" as u WHERE a.questionID = $1 AND a.userid = u.ID`,
                                                [question_id],
                                                (err, results) => {
                                                    if(err) {
                                                        res.status(400);
                                                        return res.json({error: 'Something went wrong...'});
                                                    }
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
                else {
                    res.status(400);
                    return res.json( { error: 'No question with such id' } );
                }
            }
        )
    }
)

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
                        const email = String(req.user.email);
                        pool.query(
                            `SELECT id FROM "User" WHERE email = $1`,
                            [email],
                            (err, results) => {
                                if (err) {
                                    console.log(err);
                                    res.status(400);
                                    return res.json({error: "Something went wrong..."});
                                } else {
                                    let user_id = results.rows[0]['id'];
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
                            }
                        );
                    }
                    else {
                        res.status(400);
                        return res.json({error: "No question with id = " + String(question_id)});
                    }
                }
            )
        }
    })

router.post('/get-questions/',
    function(req, res, next) {
        let keywords = req.body['keywords'] ? req.body['keywords'] : [];
        let date_from = req.body['date_from'] ? (new Date(String(req.body['date_from']))).getTime() : 0o000000000000;
        let date_to = req.body['date_to'] ? (new Date(String(req.body['date_to']))).getTime() : 9999999999999;
        if (!(date_from >= 0)) {
            res.status(400);
            return res.json({error: "Please provide a valid date_from format..." });
        }
        if (!(date_to > 0)) {
            res.status(400);
            return res.json({error: "Please provide a valid date_to format..." });
        }
        let user_id = req.body['from_user'];
        if(user_id) {
            pool.query(
                `SELECT * FROM "User" WHERE id = $1`,
                [user_id],
                (err, results) => {
                    if (err) {
                        res.status(400);
                        return res.json({error: "Something went wrong..."});
                    } else if (!(results.rows.length > 0)) {
                        res.status(400);
                        return res.json({error: "No user with id = " + String(user_id)});
                    }
                }
            )
        }
        let user_string = user_id ? ` AND UserID = ${user_id} ` : ``;
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
        // console.log(query_string)
        pool.query(
            query_string,
            [],
            async (err, results) => {
                if(err) {
                    res.status(400);
                    return res.json({error: "Something went wrong..." });
                }
                else {
                    //
                    let questions = [];
                    let questions_added = 0;
                    let total_questions = results.rows.length;
                    for( let i = 0; i < results.rows.length; i++) {
                         await pool.query(
                            `SELECT * FROM "question" WHERE id = $1`,
                            [results.rows[i]['questionid']],
                            async (err, results) => {
                                if(err) {
                                    res.status(400);
                                    res.json({error: "Something went wrong..." });
                                }
                                else {
                                    // console.log({ id: results.rows[0]['id'], title: results.rows[0]['title']})
                                    await questions.push({ id: results.rows[0]['id'], title: results.rows[0]['title']});
                                    if(++questions_added === total_questions) return res.json( {questions: questions});
                                }
                            }
                        )
                    }
                    if(results.rows.length === 0) return res.json( {questions: questions});
                //
                }
            }
        )
    })

router.get('/get-questions-per-keyword/',
    function(req, res, next) {
        pool.query(
            `SELECT  count(*), k.Keyword FROM Keyword_question as kq, keyword as k
                                         WHERE k.id = kq.KeywordID
                                         GROUP BY k.Keyword
                                         ORDER BY count(*) DESC`,
            [],
            (err, results) => {
                if (err) {
                    res.status(400);
                    return res.json({error: "Something went wrong..."});
                }
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
        let today = new Date()
        let date_from = req.body['date_from'] ? (new Date(String(req.body['date_from']))) : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7); //abstract one week to get last week's questions
        let date_to = req.body['date_to'] ? (new Date(String(req.body['date_to']))) : today;
        if (!(date_from >= 0)) {
            res.status(400);
            return res.json({error: "Please provide a valid date_from format..." });
        }
        if (!(date_to > 0)) {
            res.status(400);
            return res.json({error: "Please provide a valid date_to format..." });
        }
        let period = getDates(date_from, date_to)
        pool.query(
            `SELECT  count(*), to_char(DateAsked,'YYYY-MM-DD') as date 
                FROM question
                WHERE DateAsked >= to_timestamp($1/ 1000.0) AND DateAsked <= to_timestamp($2/ 1000.0)
                GROUP BY date
                ORDER BY count(*) DESC`,
            [date_from.getTime(), date_to.getTime()],
            (err, results) => {
                if (err) {
                    res.status(400);
                    return res.json({error: "Something went wrong..."});
                } else {
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
        let today = new Date()
        let date_from = req.body['date_from'] ? (new Date(String(req.body['date_from']))) : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7); //abstract one week to get last week's questions
        let date_to = req.body['date_to'] ? (new Date(String(req.body['date_to']))) : today;
        if (!(date_from >= 0)) {
            res.status(400);
            return res.json({error: "Please provide a valid date_from format..." });
        }
        if (!(date_to > 0)) {
            res.status(400);
            return res.json({error: "Please provide a valid date_to format..." });
        }
        let period = getDates(date_from, date_to)
        pool.query(
            `SELECT  count(*), to_char(DateAnswered,'YYYY-MM-DD') as date 
                FROM answer
                WHERE DateAnswered >= to_timestamp($1/ 1000.0) AND DateAnswered <= to_timestamp($2/ 1000.0)
                GROUP BY date
                ORDER BY count(*) DESC`,
            [date_from.getTime(), date_to.getTime()],
            (err, results) => {
                if (err) {
                    res.status(400);
                    return res.json({error: "Something went wrong..."});
                } else {
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


module.exports = router;
