import Title from "../Title";
import AnswerQuestionBox from "./AnswerQuestionBox";

export default function AnswerQuestion(){
    const text = JSON.parse(localStorage.getItem("token")) === null ? "You can see up to 10 questions. Sign up to see more!" : "Answer a question, or simply browse questions based on filters!"

    return (
        <div className="total-wrapper">
            <section>
                <div className='wave wave1'/>
                <div className='wave wave2'/>
                <div className='main-page-body'>
                    <div className='title-box'>
                        <div>
                            <Title text='Here, you can browse questions and answers.'/>
                            <h2 className='welcome-text'>{text}</h2>
                        </div>
                    </div>
                    <AnswerQuestionBox />
                </div>
            </section>
        </div>
    )
}