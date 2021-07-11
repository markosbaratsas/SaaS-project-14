import Title from "../Title";
import SignBox from "./SignBox";

export default function SignUpPage(){
    return (
        <div className="total-wrapper">

            <section>
                <div className='wave wave1'/>
                <div className='wave wave2'/>


                <div className='main-page-body'>
                    <div className='title-box'>
                        <div>
                            <Title text='This is the sign up page.'/>
                            <h2 className='welcome-text'>Sign up to ask and answer questions, and have unlimited access to all questions.</h2>
                        </div>
                    </div>
                    <SignBox/>
                </div>


            </section>
        </div>
    )
}