import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SignBox() {
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
                        <label htmlFor="email">email (username)*</label>
                        <input type='email' name='email' onChange={handleChange} required />
                    </div>
                    <div className='input-div'>
                        <label htmlFor="email">password*</label>
                        <input type='password' name='password' onChange={handleChange} required />
                    </div>
                    <div className='input-div'>
                        <label htmlFor="email">re-enter password*</label>
                        <input type='password' name='password2' onChange={handleChange} required />
                    </div>
                    <button type='submit' className='sign-button-form'>Sign up</button>
                </form>
                <h2>Already have an account yet?<Link to='/login' className='link'>Log in!</Link></h2>
            </div>
        </div>
    )
}