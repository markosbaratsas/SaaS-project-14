
export default function Choice(props) {
    return (
        <div className='choice-box'>
            <img src={props.icon} className='choice-icon'/>
            <h2>{props.title}</h2>
        </div>
    )
}