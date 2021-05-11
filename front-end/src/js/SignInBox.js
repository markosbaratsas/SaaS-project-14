import FloatingLabel from "react-bootstrap-floating-label";
import React, { useState } from 'react';

export default function SignInBox() {
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
            </div>
        </div>
    )
}