import Title from "../Title";
import SignButton from "../sign-in/SignButton";
import AccountBox from "./AccountBox";

export default function Account(){
    let email = JSON.parse(localStorage.getItem('email'))
    let text = 'Hello ' + email + '!'

    return (
        <div className="total-wrapper">

            <section>
                <div className='wave wave1'/>
                <div className='wave wave2'/>


                <div className='main-page-body'>
                    <div className='title-box'>
                        <div className='title-box-vertical'>
                            <Title text={text}/>
                            <h2 className='welcome-text'>This is your account page</h2>
                        </div>
                        <SignButton />
                    </div>
                    <AccountBox />
                </div>


            </section>
        </div>
    )
}