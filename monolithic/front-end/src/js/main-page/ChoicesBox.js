import Choice from "./Choice";
import keyword from "../../img/keyword.png"
import browse from "../../img/browse.png"
import question from "../../img/question.png"
import period from "../../img/period.png"

export default function ChoicesBox() {
    return (
        <div className='choices-container'>
            <Choice icon={keyword} title="Questions per keyword" url='./keyword'/>
            <Choice icon={period} title="Questions per day/period" url='./period'/>
            <Choice icon={question} title="Ask a new question" url='./askquestion'/>
            <Choice icon={browse} title="Browse answers" url='./answerquestion'/>
        </div>
    )
}