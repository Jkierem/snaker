import { Maybe } from "jazzi";
import { Event } from "../types";
import { spawnWorker, terminateWorker } from "../worker"

const mkContext = () => ({
    worker: undefined,
    code: undefined, 
    topic: undefined,
    stopped: false,
    snake: [], 
    world: [], 
    persistance: {},
    setWorker(worker){
        this.worker = worker
    },
    onWorkerReady(worker){
        this.setWorker(worker) 
    },
    setTopic(topic){
        this.topic = topic
        return this;
    }
})

const Compiler = () => {
    let context = mkContext();
    return {
        reset(){
            context = mkContext().setTopic(context.topic);
            context.topic.emit(Event.Persistance, context.persistance);
            context.topic.emit(Event.Running, !context.stopped)
        },
        start(code){
            this.terminate();
            this.reset();
            context.code = code;
            this.run();
        },
        run(){
            this.terminate()
            return spawnWorker(context)
            .then((persistanceData) => {
                context.persistance = persistanceData.value;
                context.topic.emit(Event.Persistance, context.persistance);
                Maybe
                .fromFalsy(context.stopped)
                .effect(() => this.terminate())
                .ifNone(() => this.run())
            })
        },
        stop(){
            context.stopped = true;
            context.topic.emit(Event.Running, !context.stopped)
            this.terminate()
        },
        terminate(){
            terminateWorker(context.worker)
            .effect(() => context.setWorker(undefined))
        },
        setTopic: (t) => context.setTopic(t)
    }
}

export default Compiler