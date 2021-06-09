import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from "axios";

export default function UserQuestionsPeriod() {
    const [countQuestions, setCountQuestions] = useState([])
    const [countAnswers, setCountAnswers] = useState([])

    const [dates, setDates] = useState([])


    const colors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(255, 205, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(153, 102, 255, 0.7)'
    ]

    let data = {
        labels: dates,
        datasets: [{
            label: 'Questions per day',
            data: countQuestions,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
        },
            {
                label: 'Answers per day',
                data: countAnswers,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
    };

    useEffect(() => {
        let dateTo = new Date()
        let dateFrom = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate() - 7)
        let details_question = {
            method: 'post',
            url: 'http://localhost:3000/get-user-questions-per-period/',
            headers: { Authorization: `Bearer ` + JSON.parse(localStorage.getItem('token')) },
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
            url: 'http://localhost:3000/get-user-answers-per-period/',
            headers: { Authorization: `Bearer ` + JSON.parse(localStorage.getItem('token')) },
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
        <div className='account-box-item'>
            <h1>Your questions per day for the last week</h1>
            <Bar data={data}  type={'bar'}/>
        </div>
    )
}