import Title from "./Title";
import AnswerQuestionBox from "./AnswerQuestionBox";

export default function AnswerQuestion(){
    const text = JSON.parse(localStorage.getItem("token")) === null ? "Browse questions. You can see up to 10 questions." : "Answer a question"

    return (
        <div className="total-wrapper">
            <section>
                <div className='wave wave1'/>
                <div className='wave wave2'/>
                <div className='main-page-body'>
                    <div className='title-box'>
                        <div className='title-box-vertical'>
                            <Title text='This is the Answer a question page.'/>
                            <h2 className='welcome-text'>{text}</h2>
                        </div>
                    </div>
                    <AnswerQuestionBox />
                </div>
            </section>
        </div>
    )
}