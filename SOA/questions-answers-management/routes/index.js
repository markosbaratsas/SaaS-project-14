var express = require('express');
var router = express.Router();
const axios = require('axios');

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

router.post('/create-question/',
    async function(req, res, next) {
        axios({
            method: "post",
            url: 'http://localhost:3005/authenticate/',
            data: {
                token: req.headers.authorization
            }
        })
            .then(async (response) => {
                if(response.data.email) {
                    let title = req.body['title'];
                    let QuestionText = req.body['QuestionText'];
                    let keywords = req.body['keywords'] ? req.body['keywords'] : [];
                    let DateAsked = Date.now();
                    if (!title || !QuestionText){
                        // res.status(400);
                        return res.json({ error: "Please provide all fields" });
                    }
                    else {
                        let user_id = response.data.id
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
                }
                else return res.json({ error: "Unauthorized" });
            })
            .catch((err) => {
                console.log(err)
                return res.json({ error: "Unauthorized" });
            })
    });

router.post('/answer-question/',
    async function(req, res, next) {
        axios({
            method: "post",
            url: 'http://localhost:3005/authenticate/',
            data: {
                token: req.headers.authorization
            }
        })
            .then(async (response) => {
                if (response.data.email) {
                    let question_id = req.body['questionID'];
                    let answer_text = req.body['AnswerText'];
                    let date_answered = Date.now();
                    if (!question_id || !answer_text) {
                        res.status(400);
                        return res.json({error: "Please provide all fields"});
                    } else {
                        let user_id = response.data.id
                        let results = await apiCall('post', 'http://localhost:3001/answer-question', {
                            question_id: question_id,
                            answer_text: answer_text,
                            date_answered: date_answered,
                            user_id: user_id
                        })
                        if (typeof results === 'number') return res.json({id: results})
                        else return res.json({error: "Something went wrong..."});
                    }
                }
                else return res.json({ error: "Unauthorized" });
            })
            .catch((err) => {
                console.log(err)
                return res.json({ error: "Unauthorized" });
            })
    })

module.exports = router;
