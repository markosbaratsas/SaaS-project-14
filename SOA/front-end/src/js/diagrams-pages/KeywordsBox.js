import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from "axios";
import {Link} from "react-router-dom";

export default function KeywordsBox() {
    const [keywords, setKeywords] = useState([])
    const [count, setCount] = useState([])
    const [width, setWidth] = useState(0)

    let colors = ['rgba(24,230,210,0.7)']

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
            url: process.env.REACT_APP_DISPLAY_URL + 'get-questions-per-keyword',
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
        <div className='sign-page-body'>
            <div className='sign-box question-box questions-keyword'>
                <Bar data={data}  type={'bar'}/>
                <Link to='./' className='main-button questions-keyword-button link-to'>Back to main page</Link>
            </div>
        </div>
    )
}