import React from 'react';
import UserQuestionsKeyword from './UserQuestionsKeyword'
import UserQuestions from './UserQuestions'
import UserAnswers from './UserAnswers'
import UserQuestionsPeriod from './UserQuestionsPeriod'
import {Link} from "react-router-dom";

export default function AccountBox() {

    return (
        <div className='sign-page-body'>
            <div className='sign-box question-box account-info-box'>
                <div className='account-box'>
                    <UserQuestions />
                    <UserAnswers />
                    <UserQuestionsKeyword />
                    <UserQuestionsPeriod />
                    <Link to='./' className='main-button questions-keyword-button link-to'>Back to main page</Link>
                </div>
            </div>
        </div>
    )
}