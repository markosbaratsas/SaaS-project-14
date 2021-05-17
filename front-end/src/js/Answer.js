import React from "react";

export default function Answer(props) {
    return (
        <div className='answer-box'>
            <div className='answer-details'>On <h3 className='no-right-padding'>{props.date}</h3>, <h3>{props.user}</h3> answered:</div>
            <div className='answer-text'><div className='top-quote'>"</div>{props.text}<div className='bottom-quote'>"</div></div>
        </div>
    )
}