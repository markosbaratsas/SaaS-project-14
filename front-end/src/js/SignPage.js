import Title from "./Title";
import SignInBox from "./SignInBox";

export default function SignPage(){
    return (
        <div className="total-wrapper">
            <div className='main-page-body'>
                <div className='title-box'>
                    <div className='title-box-vertical'>
                        <Title text='This is the sign in page.'/>
                        <h2 className='welcome-text'>Sign in</h2>
                    </div>
                </div>
                <SignInBox/>
            </div>
        </div>
    )
}