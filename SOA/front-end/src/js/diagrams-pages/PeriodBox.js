import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from "axios";
import {Link} from "react-router-dom";

export default function PeriodBox() {
    const [countQuestions, setCountQuestions] = useState([])
    const [countAnswers, setCountAnswers] = useState([])

    const [dates, setDates] = useState([])

    let data = {
        labels: dates,
        datasets: [{
            label: 'Questions per day',
            data: countQuestions,
            backgroundColor: ['rgba(213,62,131,0.7)'],
            borderColor: ['rgba(213,62,131,0.7)'],
            borderWidth: 1
        },
        {
            label: 'Answers per day',
            data: countAnswers,
            backgroundColor: ['rgba(63,183,202,0.7)'],
            borderColor: ['rgba(63,183,202,0.7)'],
            borderWidth: 1
        }]
    };

    useEffect(() => {
        let dateTo = new Date()
        let dateFrom = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate() - 7)
        let details_question = {
            method: 'post',
            url: process.env.REACT_APP_DISPLAY_URL + 'get-questions-per-period/',
            data: { 'date-from': dateFrom, 'date-to': dateTo },
        }
        console.log(details_question)
        axios(details_question)
            .then( (response) => {
                setDates(response.data.questions_per_period.map((item) => {
                    return item.date;
                }))
                setCountQuestions(response.data.questions_per_period.map((item) => {
                    return item.count;
                }))
            })
            .catch( () => {
                alert("Oops... Looks like something went wrong...")
            })

        let details_answer = {
            method: 'post',
            url: process.env.REACT_APP_DISPLAY_URL + 'get-answers-per-period/',
            data: { 'date-from': dateFrom, 'date-to': dateTo },
        }
        console.log(details_answer)
        axios(details_answer)
            .then( (response) => {
                setCountAnswers(response.data.answers_per_period.map((item) => {
                    return item.count;
                }))
            })
            .catch( () => {
                alert("Oops... Looks like something went wrong...")
            })
    }, [])


    return (
        <div className='sign-page-body'>
            <div className='sign-box question-box questions-keyword'>
                <Bar data={data}  type={'bar'}/>
                <Link to='./' className='main-button questions-keyword-button link-to'>Back to main page</Link>
            </div>
        </div>
    )
}