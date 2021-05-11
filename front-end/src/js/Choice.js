import { Link } from "react-router-dom";
import React from "react";

export default function Choice(props) {
    return (
        <Link to={props.url}>
            <div className='choice-box'>
                <img src={props.icon} className='choice-icon'/>
                <h2>{props.title}</h2>
            </div>
        </Link>
    )
}