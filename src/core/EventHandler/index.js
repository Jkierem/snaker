import StorageObject from "../../middleware/localStorage"
import Compiler from "./compiler"

const engine = Compiler()

const refreshWindow = () => {
    window.location.reload();
}

const triggerHelpModal = () => {

}

const saveCode = (code) => {
    StorageObject.save(code)
}

export const handleEvent = (topicRef) => ({ event, data }) => {
    engine.setTopic(topicRef)
    event.match({
        Play: () => engine.start(data),
        Stop: () => engine.stop(),
        Refresh: () => refreshWindow(),
        Help: () => triggerHelpModal(),
        Save: () => saveCode(data),
        RuntimeError: () => {},
        Console: () => { console.log(...data.args)},
        SnakeAction: () => {},
        Persistance: () =>{ engine.setPersistance(data.value) },
        Unknown: () => { console.log(event,data) },
    })
}