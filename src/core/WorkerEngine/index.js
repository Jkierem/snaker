import StorageObject from "../../middleware/localStorage"
import Manager from "./manager"

const workerManager = Manager()

const refreshWindow = () => {
    window.location.reload();
}

const saveCode = (code) => {
    StorageObject.save(code)
}

export const handleEvent = (topicRef,gameEngine,upperEventHandler) => ({ event, data }) => {
    workerManager.setTopic(topicRef)
    workerManager.setEngine(gameEngine)
    const relayEvent = () => upperEventHandler({ event, data })
    event.match({
        Play: () => workerManager.start(data),
        Stop: () => workerManager.stop(),
        RuntimeError: () => workerManager.handleRuntimeError(data),
        Refresh: refreshWindow,
        SaveCode: () => saveCode(data),
        SnakeAction: () => {},
        _: relayEvent,
    })
}