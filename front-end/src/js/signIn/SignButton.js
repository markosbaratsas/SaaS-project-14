import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from '../context/auth'

export default function SignButton() {
    const { setAuthTokens } = useAuth();
    let history = useHistory();
    const [ buttonString, setButtonString ] = useState(localStorage.getItem("token") === null ? "Sign in" : "Sign out")

    const direction = () => {
        if(buttonString === 'Sign in') {
            history.push("/login");
        } else {
            localStorage.clear();
            setAuthTokens(null);
            setButtonString('Sign in');
            alert("You are signed out");
        }
    }

    return (
        <button onClick={direction} className='main-button sign-button'>
            {buttonString}
        </button>
    )
}