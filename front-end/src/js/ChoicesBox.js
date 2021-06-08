import Choice from "./Choice";
import icon from "./keyword.png"

export default function ChoicesBox() {
    return (
        <div className='choices-container'>
            <Choice icon={icon} title="Questions per keyword" url='./keyword'/>
            <Choice title="Questions per day/period" url='./period'/>
            <Choice title="Ask a new question" url='./askquestion'/>
            <Choice title="Browse answers" url='./answerquestion'/>
        </div>
    )
}