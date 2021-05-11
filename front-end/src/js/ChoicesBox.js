import Choice from "./Choice";
import icon from "./keyword.png"

export default function ChoicesBox() {
    return (
        <div className='choices-container'>
            <Choice icon={icon} title="Questions per keyword" url='./'/>
            <Choice title="Questions per day/period" url='./'/>
            <Choice title="Ask a new question" url='./askquestion'/>
            <Choice title="Answer a question" url='./answerquestion'/>
        </div>
    )
}