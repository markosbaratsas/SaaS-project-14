import React, { useEffect, useState } from 'react';
import Answers from '../answer-question-page/Answers';
import axios from "axios";

export default function UserQuestions() {
    const [answer, setAnswer] = useState({})
    const [questionText, setQuestionText] = useState([])
    const [questions, setQuestions] = useState([])
    const [keywords, setKeywords] = useState([])
    const [answers, setAnswers] = useState([])

    useEffect(() => {
        let details = {
            method: 'get',
            url: process.env.REACT_APP_URL + 'get-user-questions/',
            headers: { Authorization: `Bearer ` + JSON.parse(localStorage.getItem('token')) },
            data: {},
        }
        console.log(details)
        axios(details)
            .then( (response) => {
                setQuestions(response.data['questions'])
            })
            .catch( () => {
                alert("Oops... Looks like something went wrong...")
            })
    }, [])

    const handleChange = (e) => {
        let { value, name } = e.target
        if(name === 'questionID') {
            let details = {
                method: 'get',
                url: process.env.REACT_APP_URL + 'get-question-and-answers/'+value
            }
            axios(details)
                .then( (response) => {
                    setKeywords(response.data['Keywords'])
                    setAnswers(response.data['Answers'])
                    setQuestionText(response.data['QuestionText'])
                })
                .catch( () => {
                    alert("Oops... Looks like something went wrong...")
                })
        }
        setAnswer({...answer, [name]: value})
    }

    return (
        <div className='account-box-item'>
            <h1>Your questions</h1>
            <div className='input-div'>
                <label htmlFor="question">Question title</label>
                <select name="questionID" onChange={handleChange} defaultValue={'Choose a question'}>
                    <option disabled>Choose a question</option>
                    {questions.map( (questions) =>
                        <option value={questions['id']} key={questions['id']}>{questions['title']}</option>)}
                </select>
            </div>
            <div className='input-div'>
                <label htmlFor="text">Question Text</label>
                <input className='read-only' type='text' value={questionText} readOnly/>
            </div>
            <div className='input-div'>
                <label htmlFor="text">Question keywords</label>
                <input className='read-only' type='text' value={keywords.toString().replace(/,/g, ", ")} readOnly/>
            </div>
            <div className='input-div'>
                <Answers answers={answers}/>
            </div>
        </div>
    )
}