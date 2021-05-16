import React, { useState } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import { useHistory } from "react-router-dom";

export default function AskQuestionBox() {
    const [question, setQuestion] = useState({})
    let history = useHistory();

    const handleSubmit = (e) => {
        e.preventDefault();
        let details = {
            method: 'post',
            url: 'http://localhost:3000/create-question/',
            headers: { Authorization: `Bearer ` + JSON.parse(localStorage.getItem('token')) },
            data: question,
        }
        console.log(details)
        axios(details)
            .then( (response) => {
                console.log(response);
                if(response.data.error) alert("There's already a question with this title!")
                else if(response.data.success){
                    alert(response.data.success);
                    history.push("/");
                }
                else alert("Oops... Looks like something went wrong...");
            })
            .catch( (error) => {
                console.log(error);
                alert("Oops... Looks like something went wrong...")
            })
    }

    const handleChange = (e) => {
        const { value, name } = e.target
        setQuestion({...question, [name]: value})
    }

    const handleChangeKeywords = (e) => {
        const { value, name } = e.target
        let keywordArray = value.split(', '); //need a better way to input keywords...
        setQuestion({...question, [name]: keywordArray})
        console.log(keywordArray)
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
                        <textarea className='text' name='QuestionText' onChange={handleChange} required />
                    </div>
                    <div className='input-div'>
                        <label htmlFor="keywords">Keywords</label>
                        <input type='text' name='keywords' onChange={handleChangeKeywords} placeholder='Keyword 1, Keyword 2, Keyword 3 ...' />
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