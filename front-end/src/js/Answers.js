import Answer from './Answer'
import React from "react";

export default function Answers(props) {
    let answers = props.answers
    return (
        <div className='answers-box'>
            {answers.map( (answers) =>
            <Answer text={answers['answer_text']} user={answers['user']} date={answers['date_answered']} key={answers['date_answered']}/>
            )}
        </div>
    )
}