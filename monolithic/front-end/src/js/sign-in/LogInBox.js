import React, { useState } from 'react';
import { Link, Redirect } from "react-router-dom";
import {useAuth} from "../context/auth";
import axios from 'axios';

export default function LogInBox() {
    const [user, setUser] = useState({})
    const [isLoggedIn, setLoggedIn] = useState(false)
    const { setAuthTokens } = useAuth()

    const handleSubmit = (e) => {
        e.preventDefault()
        let details = {
            method: 'post',
            url: process.env.REACT_APP_URL + 'sign-in',
            data: user,
        }
        axios(details)
            .then( (response) => {
                console.log(response)
                setAuthTokens(response.data["token"]);
                localStorage.setItem("email", JSON.stringify(response.data["email"]));
                setLoggedIn(true);
            })
            .catch( (error) => {
                console.log(error)
                alert("Invalid credentials")
            })
    }

    const handleChange = (e) => {
        const { value, name } = e.target
        setUser({...user, [name]: value})
    }

    if (isLoggedIn) {
        return <Redirect to="/"/>;
    }

    return (
        <div className='sign-page-body'>
            <div className='sign-box'>
                <form onSubmit={handleSubmit}>
                    <div className='input-div'>
                        <label htmlFor="email">email*</label>
                        <input type='email' name='username' onChange={handleChange} required />
                    </div>
                    <div className='input-div'>
                        <label htmlFor="email">password*</label>
                        <input type='password' name='password' onChange={handleChange} required />
                    </div>
                    <button type='submit' className='main-button sign-button-form'>Log in</button>
                </form>
                <h2>Don't have an account yet?<Link to='/signup' className='link'>Sign up!</Link></h2>
                <Link to='/' className='redirection'>Back to main page</Link>
            </div>
        </div>
    )
}