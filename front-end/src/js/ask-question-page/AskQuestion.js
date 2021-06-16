import Title from "../Title";
import AskQuestionBox from "./AskQuestionBox";

export default function AskQuestion(){
    return (
        <div className="total-wrapper">
            <section>
                <div className='wave wave1'/>
                <div className='wave wave2'/>

                <div className='main-page-body'>
                    <div className='title-box'>
                        <div>
                            <Title text='This is the ask a question page.'/>
                            <h2 className='welcome-text'>Ask a question</h2>
                        </div>
                    </div>
                    <AskQuestionBox />

                </div>
            </section>
        </div>
    )
}