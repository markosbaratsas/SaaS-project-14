import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from "axios";
import {Link} from "react-router-dom";

export default function PeriodBox() {

    let dateTo = new Date()
    let dateFrom = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate() - 7)
    const [count, setCount] = useState([])

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
            data: count,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
        }]
    };

    useEffect(() => {
        let details = {
            method: 'post',
            url: 'http://localhost:3000/get-questions-per-period/',
            data: { 'date-from': dateFrom, 'date-to': dateTo },
        }
        console.log(details)
        axios(details)
            .then( (response) => {
                setDates(response.data.questions_per_period.map((item) => {
                    return item.date;
                }))
                setCount(response.data.questions_per_period.map((item) => {
                    return item.count;
                }))
            })
            .catch( () => {
                alert("Ops... Looks like something went wrong...")
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