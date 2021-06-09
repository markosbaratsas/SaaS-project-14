import Footer from "./Footer";
import Title from "../Title";
import SignButton from "../sign-in/SignButton";
import ChoicesBox from "./ChoicesBox";
import { Link } from "react-router-dom";
import icon from "../../img/account-icon.png"
import React from "react";

export default function MainPage(){
    const style = JSON.parse(localStorage.getItem("token")) === null ? {display: 'none'} : {display: 'block'}

    return (
        <div className="total-wrapper">
            <div className='main-page-body'>
                <div className='title-box'>
                    <div className='account-div' style={style}>
                        <Link to='/account' className='link-to'>
                            <img src={icon} className='' alt={'account-icon'} />
                            <h1>
                                my account
                            </h1>
                        </Link>
                    </div>
                    <div className='title-box-vertical'>
                        <Title text='This is the main page.'/>
                        <h2 className='welcome-text'>Welcome to AskMeAnything</h2>
                    </div>
                    <SignButton />
                </div>
                <ChoicesBox/>
            </div>
            <Footer/>
        </div>
    )
}