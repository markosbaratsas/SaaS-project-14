import Title from "../Title";
import LogInBox from "./LogInBox";

export default function LogInPage(){
    return (
        <div className="total-wrapper">

            <section>
                <div className='wave wave1'/>
                <div className='wave wave2'/>


            <div className='main-page-body'>
                <div className='title-box'>
                    <div>
                        <Title text='This is the log in page.'/>
                        <h2 className='welcome-text'>Log in</h2>
                    </div>
                </div>
                <LogInBox/>
            </div>


            </section>
        </div>
    )
}