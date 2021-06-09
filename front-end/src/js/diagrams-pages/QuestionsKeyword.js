import Title from "../Title";
import KeywordsBox from "./KeywordsBox";
import React from "react";

export default function QuestionsKeyword(){
    return (
        <div className="total-wrapper">
            <section>
                <div className='wave wave1'/>
                <div className='wave wave2'/>

                <div className='main-page-body'>
                    <div className='title-box'>
                        <div className='title-box-vertical'>
                            <Title text='This is the questions per keyword page.'/>
                            <h2 className='welcome-text'>Now displaying question per keyword for the top keywords</h2>
                        </div>
                    </div>
                    <KeywordsBox />
                </div>
            </section>
        </div>
    )
}