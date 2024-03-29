import Modal from "../Modal"
import "./HelpModal.scss"

const snakeType = `type Snake = {
   turnLeft: () => void,
   turnRight: () => void,
   moveForward: () => void,
   body: [number,number][],
   head: [number,number],
   length: number
}`

const worldType = `type World = Array<Array<0 | 1 | 2>>`

const useStateType = `type useState = <T>(id: string, initialValue: T) => [T, (newValue: any) => void ];`

const P = ({ children }) => <p className="help__line">{children}</p>

const HelpModal = ({ open, onClose }) => {
    return <Modal onClose={onClose} open={open} >
        {({ handleClose }) => {
            return <>
                <h2>Welcome to Snaker!</h2>
                <P>The goal is to program the snake to reach as many fruits as possible</P>
                <P>The code you write will run every time before the snake moves</P>
                <P>There are three global objects/functions at your disposal: (in typescript notation)</P>
                <pre>{snakeType}</pre>
                <pre>{worldType}</pre>
                <pre>{useStateType}</pre>
                <P>If moveForward, turnLeft and turnRight are all called on a single run, the last call wins. Not calling any function has the same effect as calling moveForward</P>
                <P>The World is a two dimensional array where the top left corner is World[0][0]. The tile in column 1 and row 4 is World[0][3]. Each value is either a 0 for empty space, a 1 for fruit and 2 for an obstacle. The world does not include the snake's body</P>
                <P>The useState function is used to preserve a value over a run. It recieves an ID and initial value and returns an array with the current value and a setter function. This is the only way to preserve values between ticks</P>
                <P>Auto saved is enabled. This game uses localStorage to save your code. Below the editor is a small debugger</P>
                <div>
                    <button onClick={handleClose("normal")} className="help__button">Let's play!</button>
                    <button onClick={handleClose("example")} className="help__button help__button--alt">Show me an example!</button>
                </div>
            </>
        }}
    </Modal>
}

export default HelpModal