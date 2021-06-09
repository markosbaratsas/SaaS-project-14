import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Answers from './Answers';
import axios from "axios";
import { useHistory } from "react-router-dom";

export default function AnswerQuestionBox() {
    let history = useHistory();

    const [answer, setAnswer] = useState({})
    const [questionText, setQuestionText] = useState([])
    const [questions, setQuestions] = useState([])
    const [keywords, setKeywords] = useState([])
    const [answers, setAnswers] = useState([])
    const [filterKeywords, setFilterKeywords] = useState([])
    const [dateFrom, setDateFrom] = useState()
    const [dateTo, setDateTo] = useState()
    const style = JSON.parse(localStorage.getItem("token")) === null ? {display: 'none'} : {display: 'block'}

    useEffect(() => {
        let details = {
            method: 'post',
            url: 'http://localhost:3000/get-questions/',
            data: {},
        }
        console.log(details)
        axios(details)
            .then( (response) => {
                setQuestions(JSON.parse(localStorage.getItem("token")) === null ? response.data['questions'].slice(0, 10) : response.data['questions'])
            })
            .catch( () => {
                alert("Oops... Looks like something went wrong...")
            })
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        let details = {
            method: 'post',
            url: 'http://localhost:3000/answer-question/',
            headers: { Authorization: `Bearer ` + JSON.parse(localStorage.getItem('token')) },
            data: answer,
        }
        console.log(details)
        axios(details)
            .then( (response) => {
                if(response.data.id) {
                    alert("Answer submitted successfully!")
                    history.push("/");
                }
                else alert("Oops... Looks like something went wrong...");
            })
            .catch( () => {
                alert("Oops... Looks like something went wrong...")
            })
    }

    const handleChange = (e) => {
        let { value, name } = e.target
        if(name === 'questionID') {
            let details = {
                method: 'get',
                url: 'http://localhost:3000/get-question-and-answers/'+value
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

    const handleChangeFilterKeywords = (e) => {
        // eslint-disable-next-line no-unused-vars
        const { value, name } = e.target
        let keywordArray = value.split(', ');
        setFilterKeywords(keywordArray)
    }

    const handleChangePeriod = (e) => {
        const { value, name } = e.target
        if(name === 'date_from') setDateFrom(value)
        else setDateTo(value)
    }

    const filter = (e) => {
        e.preventDefault()
        setAnswers([])
        let details = {
            method: 'post',
            url: 'http://localhost:3000/get-questions/',
            data: { keywords: filterKeywords,
                date_from: dateFrom,
                date_to: dateTo
            }
        }
        axios(details)
            .then( (response) => {
                setQuestions(JSON.parse(localStorage.getItem("token")) === null ? response.data['questions'].slice(0, 10) : response.data['questions'])
            })
            .catch( () => {
                alert("Oops... Looks like something went wrong...")
            })
    }

    const clear = (e) => {
        e.preventDefault()
        let details = {
            method: 'post',
            url: 'http://localhost:3000/get-questions/',
            data: {}
        }
        axios(details)
            .then( (response) => {
                setQuestions(JSON.parse(localStorage.getItem("token")) === null ? response.data['questions'].slice(0, 10) : response.data['questions'])
            })
            .catch( () => {
                alert("Oops... Looks like something went wrong...")
            })
    }

    return (
        <div className='sign-page-body'>
            <div className='sign-box question-box'>
                <form onSubmit={handleSubmit}>
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
                        <label htmlFor="text">Filter by period</label>
                        <div className='filters-period'>
                            <h3>From:</h3>
                            <input type='date' name='date_from' onChange={handleChangePeriod} />
                            <h3>To:</h3>
                            <input type='date' name='date_to' onChange={handleChangePeriod} />
                        </div>
                    </div>
                    <div className='input-div'>
                        <label htmlFor="text">Filter by keywords</label>
                        <div className='filters-keywords'>
                            <input type='text' name='keywords' onChange={handleChangeFilterKeywords} placeholder='Keyword 1, Keyword 2, Keyword 3 ...' />
                            <div className='filter-buttons'>
                                <button onClick={filter} className='filter-button filter'>Filter</button>
                                <button onClick={clear} className='filter-button clear'>Clear filters</button>
                            </div>
                        </div>
                    </div>
                    <div className='input-div'>
                        <Answers answers={answers}/>
                    </div>
                    <div className='input-div' style={style}>
                        <label htmlFor="text">Your answer</label>
                        <textarea className='text' name='AnswerText' onChange={handleChange} required />
                    </div>
                    <div className='form-buttons'>
                        <button type='submit' className='main-button sign-button-form' style={style}>Submit answer</button>
                        <Link to='./' className='cancel-button'>Never mind</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}