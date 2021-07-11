import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "../context/auth";

export default function SignBox(props) {
    const [user, setUser] = useState({})
    const [isLoggedIn, setLoggedIn] = useState(false)
    const { setAuthTokens } = useAuth()

    const handleSubmit = (e) => {
        e.preventDefault();
        let details = {
            method: 'post',
            url: 'http://localhost:3000/sign-up',
            data: user,
        }
        axios(details)
            .then( (response) => {
                console.log(response)
                if(response.data.errors) alert(response.data.errors[0].message);
                else if(response.data.message) alert(response.data.message);
                else if(response.data.success){
                    console.log(response);
                    alert(response.data.success);
                    setLoggedIn(true);
                }
                else alert("Something went wrong!")
            })
            .catch( (error) => {
                console.log(error);
            })
    }

    const handleChange = (e) => {
        const { value, name } = e.target;
        setUser({...user, [name]: value});
    }

    if (isLoggedIn) {
        return <Redirect to="/login"/>;
    }

    return (
        <div className='sign-page-body'>
            <div className='sign-box'>
                <form onSubmit={handleSubmit}>
                    <div className='input-div'>
                        <label htmlFor="email">email (username) *</label>
                        <input type='email' name='email' onChange={handleChange} required />
                    </div>
                    <div className='input-div'>
                        <label htmlFor="email">password *</label>
                        <input type='password' name='password' onChange={handleChange} required />
                    </div>
                    <div className='input-div'>
                        <label htmlFor="email">re-enter password *</label>
                        <input type='password' name='password2' onChange={handleChange} required />
                    </div>
                    <button type='submit' className='main-button sign-button-form'>Sign up</button>
                </form>
                <h2>Already have an account yet?<Link to='/login' className='link'>Log in!</Link></h2>
                <Link to='/' className='redirection'>Back to main page</Link>
            </div>
        </div>
    )
}