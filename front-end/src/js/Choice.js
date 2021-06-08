import { Link } from "react-router-dom";
import React from "react";

export default function Choice(props) {
    return (
        <Link to={props.url} className='link-to'>
            <div className='choice-box'>
                <img src={props.icon} className='choice-icon' alt={'icon'}/>
                <h2>{props.title}</h2>
            </div>
        </Link>
    )
}