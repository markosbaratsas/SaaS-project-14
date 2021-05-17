import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Answers from './Answers';
import axios from "axios";

export default function AnswerQuestionBox() {
    const [answer, setAnswer] = useState({})
    const [questions, setQuestions] = useState([])
    const [keywords, setKeywords] = useState([])
    const [answers, setAnswers] = useState([])

    useEffect(() => {
        let details = {
            method: 'post',
            url: 'http://localhost:3000/get-questions/',
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

    const handleSubmit = (e) => {
        e.preventDefault()
    }

    const handleChange = (e) => {
        let { value, name } = e.target
        if(name === 'questionID') {
            let details = {
                method: 'get',
                url: 'http://localhost:3000/get-question-and-answers/'+value
            }
            console.log(details)
            axios(details)
                .then( (response) => {
                    setKeywords(response.data['Keywords'])
                    setAnswers(response.data['Answers'])
                })
                .catch( () => {
                    alert("Oops... Looks like something went wrong...")
                })
        }
        setAnswer({...answer, [name]: value})
    }

    return (
        <div className='sign-page-body'>
            <div className='sign-box question-box'>
                <form onSubmit={handleSubmit}>
                    <div className='input-div'>
                        <label htmlFor="question">Question title</label>
                        <select name="questionID" onChange={handleChange}>
                            <option disabled selected value>Choose a question</option>
                            {questions.map( (questions) =>
                                <option value={questions['id']} key={questions['id']}>{questions['title']}</option>)}
                        </select>
                    </div>
                    <div className='input-div'>
                        <label htmlFor="text">Question keywords</label>
                        <input className='read-only' type='text' value={keywords.toString().replace(/,/g, ", ")} readOnly/>
                    </div>
                    <div className='input-div'>
                        <Answers answers={answers}/>
                    </div>
                    <div className='input-div'>
                        <label htmlFor="text">Your answer</label>
                        <textarea className='text' name='AnswerText' onChange={handleChange} required />
                    </div>
                    <div className='form-buttons'>
                        <button type='submit' className='sign-button-form'>Submit answer</button>
                        <Link to='./' className='cancel-button'>Never mind</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}