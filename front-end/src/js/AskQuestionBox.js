import React, { useState } from 'react';
import { Link } from "react-router-dom";

export default function AskQuestionBox() {
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
                        <label htmlFor="text">Question title</label>
                        <input type='text' name='title' onChange={handleChange} required />
                    </div>
                    <div className='input-div'>
                        <label htmlFor="text">Question text</label>
                        <textarea className='text' type='text' name='text' onChange={handleChange} required />
                    </div>
                    <div className='input-div'>
                        <label htmlFor="keywords">Keywords</label>
                        <input type='text' name='keywords' onChange={handleChange} required />
                    </div>
                    <div className='form-buttons'>
                        <button type='submit' className='sign-button-form'>Submit</button>
                        <Link to='./' className='cancel-button'>Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}