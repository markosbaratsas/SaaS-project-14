import Footer from "./Footer";
import Title from "./Title";
import SignButton from "./signIn/SignButton";
import ChoicesBox from "./ChoicesBox";

export default function MainPage(){

    return (
        <div className="total-wrapper">
            <div className='main-page-body'>
                <div className='title-box'>
                    <div className='title-box-vertical'>
                        <Title text='This is the main page.'/>
                        <h2 className='welcome-text'>Welcome to AskMeAnything</h2>
                    </div>
                    <SignButton />
                </div>
                <ChoicesBox/>
            </div>
            <Footer/>
        </div>
    )
}