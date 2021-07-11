var express = require('express');
var router = express.Router();
const axios = require('axios')
require("dotenv").config();

async function apiCall(method, url, data) {
    return await axios({
        method: method,
        url: url,
        data: data
    })
        .then((results) => {
            if(results.data.error) return results.data.error
            else return results.data
        })
        .catch((err) => {
            console.log(err)
        })
}

function getYYYYMMDD(d0) {
    const d = new Date(d0)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000).toISOString().split('T')[0]
}

let getDates = function(startDate, endDate) {
    let dates = [],
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

router.get('/get-question-and-answers/:id',
    async function(req, res, next) {
        let question_id = req.params.id;
        let results = await apiCall('get', process.env.DATA_URL + 'get-question-and-answers/' + question_id, {})
        if(results.id) return res.json(results)
        else return res.json( { error: 'Something went wrong...' } );
    }
)

router.post('/get-questions/',
    async function(req, res, next) {
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
        let results = await apiCall('post', process.env.DATA_URL + 'get-questions/', {
            keywords: keywords,
            date_from: date_from,
            date_to: date_to
        })
        if(results.questions) return res.json(results)
        else return res.json({ error: "Something went wrong..." });
    })

router.get('/get-questions-per-keyword/',
    async function(req, res, next) {
        let results = await apiCall('post', process.env.DATA_URL + 'get-questions-per-keyword/', {})
        if(results.questions_per_keyword) return res.json(results)
        else return res.json({ error: "Something went wrong..." });
    })

router.post('/get-questions-per-period/',
    async function(req, res, next) {
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
        let results = await apiCall('post', process.env.DATA_URL + 'get-questions-per-period/', {
            date_from: date_from.getTime(),
            date_to: date_to.getTime(),
            period: period
        })
        if(results.questions_per_period) return res.json(results)
        else return res.json({ error: "Something went wrong..." });
    })

router.post('/get-answers-per-period/',
    async function(req, res, next) {
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
        let results = await apiCall('post', process.env.DATA_URL + 'get-answers-per-period/', {
            date_from: date_from.getTime(),
            date_to: date_to.getTime(),
            period: period
        })
        if(results.answers_per_period) return res.json(results)
        else return res.json({ error: "Something went wrong..." });
    })

router.get('/get-user-questions-per-keyword/',
    async function(req, res, next) {
    axios({
        method: "post",
        url: process.env.ESB_URL + 'authenticate/',
        data: {
            token: req.headers.authorization
        }
    })
        .then(async (response) => {
            if (response.data.email) {
                let user_id = response.data.id
                let results = await apiCall('post', process.env.DATA_URL + 'get-questions-per-keyword/', {
                    user_id: user_id
                })
                if (results.questions_per_keyword) return res.json(results)
                else return res.json({error: "Something went wrong..."});
            }
            else return res.json({ error: "Unauthorized" });
        })
        .catch((err) => {
            console.log(err)
            return res.json({ error: "Unauthorized" });
        })
    })

router.post('/get-user-questions-per-period/',
    async function(req, res, next) {
    axios({
        method: "post",
        url: process.env.ESB_URL + 'authenticate/',
        data: {
            token: req.headers.authorization
        }
    })
        .then(async (response) => {
            if (response.data.email) {
                let user_id = response.data.id
                let today = new Date()
                let date_from = req.body['date_from'] ? (new Date(String(req.body['date_from']))) : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7); //abstract one week to get last week's questions
                let date_to = req.body['date_to'] ? (new Date(String(req.body['date_to']))) : today;
                if (!(date_from >= 0)) {
                    res.status(400);
                    return res.json({error: "Please provide a valid date_from format..."});
                }
                if (!(date_to > 0)) {
                    res.status(400);
                    return res.json({error: "Please provide a valid date_to format..."});
                }
                let period = getDates(date_from, date_to)
                let results = await apiCall('post', process.env.DATA_URL + 'get-questions-per-period/', {
                    date_from: date_from.getTime(),
                    date_to: date_to.getTime(),
                    period: period,
                    user_id: user_id
                })
                if (results.questions_per_period) return res.json(results)
                else return res.json({error: "Something went wrong..."});
            }
            else return res.json({ error: "Unauthorized" });
        })
        .catch((err) => {
            console.log(err)
            return res.json({ error: "Unauthorized" });
        })
    })

router.post('/get-user-answers-per-period/',
    async function(req, res, next) {
    axios({
        method: "post",
        url: process.env.ESB_URL + 'authenticate/',
        data: {
            token: req.headers.authorization
        }
    })
        .then(async (response) => {
            if (response.data.email) {
                let user_id = response.data.id
                let today = new Date()
                let date_from = req.body['date_from'] ? (new Date(String(req.body['date_from']))) : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7); //abstract one week to get last week's questions
                let date_to = req.body['date_to'] ? (new Date(String(req.body['date_to']))) : today;
                if (!(date_from >= 0)) {
                    res.status(400);
                    return res.json({error: "Please provide a valid date_from format..."});
                }
                if (!(date_to > 0)) {
                    res.status(400);
                    return res.json({error: "Please provide a valid date_to format..."});
                }
                let period = getDates(date_from, date_to)
                let results = await apiCall('post', process.env.DATA_URL + 'get-answers-per-period/', {
                    date_from: date_from.getTime(),
                    date_to: date_to.getTime(),
                    period: period,
                    user_id: user_id
                })
                if (results.answers_per_period) return res.json(results)
                else return res.json({error: "Something went wrong..."});
            }
            else return res.json({ error: "Unauthorized" });
        })
        .catch((err) => {
            console.log(err)
            return res.json({ error: "Unauthorized" });
        })
    })

router.get('/get-user-questions/',
    async function(req, res, next) {
    axios({
        method: "post",
        url: process.env.ESB_URL + 'authenticate/',
        data: {
            token: req.headers.authorization
        }
    })
        .then(async (response) => {
            if (response.data.email) {
                let user_id = response.data.id
                let results = await apiCall('post', process.env.DATA_URL + 'get-questions/', {
                    keywords: [],
                    date_from: 0o000000000000,
                    date_to: 9999999999999,
                    from_user: user_id
                })
                if (results.questions) return res.json(results)
                else return res.json({error: "Something went wrong..."});
            }
            else return res.json({ error: "Unauthorized" });
        })
        .catch((err) => {
            console.log(err)
            return res.json({ error: "Unauthorized" });
        })
    })

router.get('/get-user-answers/',
    async function(req, res, next) {
    axios({
        method: "post",
        url: process.env.ESB_URL + 'authenticate/',
        data: {
            token: req.headers.authorization
        }
    })
        .then(async (response) => {
            if (response.data.email) {
                let user_id = response.data.id
                let results = await apiCall('post', process.env.DATA_URL + 'get-user-answers/', {
                    user_id: user_id
                })
                if (results.answers) return res.json(results)
                else return res.json({error: "Something went wrong..."});
            }
            else return res.json({ error: "Unauthorized" });
        })
        .catch((err) => {
            console.log(err)
            return res.json({ error: "Unauthorized" });
        })
    })

module.exports = router;
