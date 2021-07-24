import StorageObject from "../../middleware/localStorage"
import Compiler from "./compiler"

const engine = Compiler()

const refreshWindow = () => {
    window.location.reload();
}

const saveCode = (code) => {
    StorageObject.save(code)
}

export const handleEvent = (topicRef,upperEventHandler) => ({ event, data }) => {
    engine.setTopic(topicRef)
    const relayEvent = () => upperEventHandler({ event, data })
    event.match({
        Play: () => engine.start(data),
        Stop: () => engine.stop(),
        Refresh: refreshWindow,
        SaveCode: () => saveCode(data),
        SnakeAction: () => {},
        _: relayEvent,
    })
}