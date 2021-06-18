import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from "axios";

export default function UserQuestionsKeyword() {
    const [keywords, setKeywords] = useState([])
    const [count, setCount] = useState([])
    const [width, setWidth] = useState(0)

    let colors = ['rgba(63,183,202,0.7)']
    const data = {
        labels: keywords,
        datasets: [{
            label: 'Questions per keyword (top ' + width + ' keywords)',
            data: count,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
        }]
    };

    useEffect(() => {
        let details = {
            method: 'get',
            url: 'http://localhost:3004/get-user-questions-per-keyword/',
            headers: { Authorization: JSON.parse(localStorage.getItem('token')) },
            data: {},
        }
        axios(details)
            .then( (response) => {
                console.log(response)
                let i = 0;
                let j = 0;
                setKeywords(response.data.questions_per_keyword.filter((item) => {
                    if(i < 15) {
                        i++;
                        return true;
                    }
                    else return false;
                }).map((item) => {
                    return item.keyword;
                }))
                setCount(response.data.questions_per_keyword.filter((item) => {
                    return j++ <= i;
                }).map((item) => {
                    return item.count;
                }))
                setWidth(i)
            })
            .catch( () => {
                alert("Oops... Looks like something went wrong...")
            })
    }, [])


    return (
        <div className='account-box-item'>
            <h1>Your questions per keyword</h1>
            <Bar data={data}  type={'bar'}/>
        </div>
    )
}