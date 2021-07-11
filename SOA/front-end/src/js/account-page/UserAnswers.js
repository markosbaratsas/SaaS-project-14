import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel'
import axios from "axios";

export default function UserAnswers() {
    const [answers, setAnswers] = useState([])

    useEffect(() => {
        let details = {
            method: 'get',
            url: process.env.REACT_APP_DISPLAY_URL + 'get-user-answers/',
            headers: { Authorization: JSON.parse(localStorage.getItem('token')) },
            data: {},
        }
        console.log(details)
        axios(details)
            .then( (response) => {
                setAnswers(response.data['answers'])
            })
            .catch( () => {
                alert("Oops... Looks like something went wrong...")
            })
    }, [])

    return (
        <div className='account-box-item'>
            <h1>Your answers</h1>
            <Carousel className='carousel'>
                {answers.map((answer) =>
                    <Carousel.Item className='carousel-item' key={answer.text}>
                        <h1>{answer.question}</h1>
                        <div className='answer-box'>
                            <div className='answer-details'>On <h3 className='no-right-padding'>{answer.date}</h3>, <h3>you</h3> answered:</div>
                            <div className='answer-text'><div className='top-quote'>"</div>{answer.text}<div className='bottom-quote'>"</div></div>
                        </div>
                    </Carousel.Item>
                )}
            </Carousel>
        </div>
    )
}