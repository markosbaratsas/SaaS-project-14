import Title from "./Title";
import PeriodBox from "./PeriodBox";
import React from "react";

export default function QuestionsPeriod(){
    return (
        <div className="total-wrapper">
            <section>
                <div className='wave wave1'/>
                <div className='wave wave2'/>

                <div className='main-page-body'>
                    <div className='title-box'>
                        <div className='title-box-vertical'>
                            <Title text='This is the questions per period page.'/>
                            <h2 className='welcome-text'>Now displaying number of questions per day for the last week</h2>
                        </div>
                    </div>
                    <PeriodBox />
                </div>
            </section>
        </div>
    )
}