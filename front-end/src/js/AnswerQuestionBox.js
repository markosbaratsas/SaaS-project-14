import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Answers from './Answers';

export default function AnswerQuestionBox() {
    const [question, setQuestion] = useState({})

    const handleSubmit = (e) => {
        e.preventDefault()
    }

    const handleChange = (e) => {
        const { value, name } = e.target
        setQuestion({...question, [name]: value})
    }

    return (
        <div className='sign-page-body'>
            <div className='sign-box question-box'>
                <form onSubmit={handleSubmit}>
                    <div className='input-div'>
                        <label htmlFor="question">Question title</label>
                        <select name="question" onChange={handleChange}>
                            <option>Question no. 1</option>
                            <option>Question no. 2</option>
                            <option>Question no. 3</option>
                            <option>Question no. 4</option>
                        </select>
                    </div>
                    <div className='input-div'>
                        <label htmlFor="text">Question keywords</label>
                        <input className='read-only' type='text' value="keyword 1, keyword 2" readonly />
                    </div>
                    <div className='input-div'>
                        <Answers/>
                    </div>
                    <div className='input-div'>
                        <label htmlFor="text">Your answer</label>
                        <textarea className='text' type='text' name='text' onChange={handleChange} required />
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