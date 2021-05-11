import React, { useState } from 'react';
import { Link } from "react-router-dom";

export default function LogInBox() {
    const [user, setUser] = useState({})

    const handleSubmit = (e) => {
        e.preventDefault()
    }

    const handleChange = (e) => {
        const { value, name } = e.target
        setUser({...user, [name]: value})
    }

    return (
        <div className='sign-page-body'>
            <div className='sign-box'>
                <form onSubmit={handleSubmit}>
                    <div className='input-div'>
                        <label htmlFor="email">email*</label>
                        <input type='email' name='email' onChange={handleChange} required />
                    </div>
                    <div className='input-div'>
                        <label htmlFor="email">password*</label>
                        <input type='password' name='password' onChange={handleChange} required />
                    </div>
                    <button type='submit' className='sign-button-form'>Log in</button>
                </form>
                <h2>Don't have an account yet?<Link to='/signup' className='link'>Sign up!</Link></h2>
            </div>
        </div>
    )
}