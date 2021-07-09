var express = require('express');
var router = express.Router();

const { pool } = require("../config/database");

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
            `SELECT  count, to_char(DateAnswered,'YYYY-MM-DD') as date 
                FROM answer_period
                WHERE DateAnswered >= to_timestamp($1/ 1000.0) AND DateAnswered <= to_timestamp($2/ 1000.0)
                ORDER BY count DESC`,
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
