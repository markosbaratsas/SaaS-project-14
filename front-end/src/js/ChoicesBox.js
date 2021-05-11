import Choice from "./Choice";
import icon from "./keyword.png"

export default function ChoicesBox() {
    return (
        <div className='choices-container'>
            <Choice icon={icon} title="Questions per keyword"/>
            <Choice title="Questions per day/period"/>
            <Choice title="Ask a new question"/>
            <Choice title="Answer a question"/>
        </div>
    )
}