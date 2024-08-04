import './App.css'
import SMParser from "../script/utils/parser/SMParser.ts";

function App() {
    return (
        <>
            <h1>webitg</h1>
            <input onChange={event => new SMParser(event.target.files[0])} type="file"/>
        </>
    )
}

export default App
