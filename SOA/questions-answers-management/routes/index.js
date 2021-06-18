var express = require('express');
var router = express.Router();
const axios = require('axios');
require("dotenv").config();

const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

async function apiCall(method, url, data) {
    return await axios({
        method: method,
        url: url,
        data: data
    })
        .then((results) => {
            if(results.data.results) return results.data.results
            else return results.data.error
        })
        .catch((err) => {
            console.log(err)
        })
}

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
    async function(req, res, next) {
        let title = req.body['title'];
        let QuestionText = req.body['QuestionText'];
        let keywords = req.body['keywords'] ? req.body['keywords'] : [];
        let DateAsked = Date.now();
        if (!title || !QuestionText){
        // res.status(400);
        return res.json({ error: "Please provide all fields" });
        }
        else {
            let user_id = req.user.id
            let results = await apiCall('post', 'http://localhost:3001/create-question', {
                title: title,
                QuestionText: QuestionText,
                keywords: keywords,
                DateAsked: DateAsked,
                user_id: user_id
            })
            if(results.substring(0, 12) === "Successfully")  return res.json({ success: results });
            else return res.json({ error: results });
        }
    });

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
            let user_id = req.user.id
            let results = await apiCall('post', 'http://localhost:3001/answer-question', {
                question_id: question_id,
                answer_text: answer_text,
                date_answered: date_answered,
                user_id: user_id
            })
            if(typeof results === 'number') return res.json( { id: results } )
            else return res.json({error: "Something went wrong..."});
        }
    })

module.exports = router;
