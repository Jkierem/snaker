import { Maybe } from "jazzi";
import { Event } from "../types";
import { parseMinifyError, parseRuntimeError } from "./errorMapper";
import { spawnWorker, terminateWorker } from "./worker"

const mkContext = () => ({
    worker: undefined,
    code: undefined, 
    topic: undefined,
    stopped: false,
    engine: undefined,
    persistance: {},
    compilationData: {},
    setWorker(worker){
        this.worker = worker
    },
    onWorkerReady(worker){
        this.setWorker(worker) 
    },
    setTopic(topic){
        this.topic = topic
        return this;
    },
    partialCopy(){
        this.engine.reset()
        return mkContext()
            .setTopic(this.topic)
            .setEngine(this.engine)
    },
    setCompilationData(minifiedResult){
        this.compilationData = minifiedResult;
    },
    setEngine(engine){
        this.engine = engine
        return this;
    }
})

const WorkerManager = () => {
    let context = mkContext();
    return {
        reset(){
            context = context.partialCopy();
            context.topic.emit(Event.Persistance, context.persistance);
            context.topic.emit(Event.Running, !context.stopped)
            context.topic.emit(Event.Death, context.engine.isDead)
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
            .then(([persistanceData, desiredAction]) => {
                desiredAction
                .effect((action) => {
                    if( action === "right" ){
                        context.engine.turnRight();
                    } else {
                        context.engine.turnLeft();
                    }
                })
                context.persistance = persistanceData.value;
                context.topic.emit(Event.Persistance, context.persistance);
                context.engine.runStep();
                Maybe
                    .fromFalsy(context.stopped || context.engine.isDead)
                    .effect(() => context.engine.isDead && context.topic.emit(Event.Death, true))
                    .effect(() => this.stop())
                    .ifNone(() => this.run())
            }).catch(err => {
                this.stop();
                err?.match?.({
                    MinifyError: (data) => {
                        context.topic.emit(Event.Error, parseMinifyError(data))
                    },
                    _: () => console.error(err)
                })
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
        setTopic: (t) => context.setTopic(t),
        setEngine: (t) => context.setEngine(t),
        handleRuntimeError(error){
            this.stop()
            context.topic.emit(Event.Error, parseRuntimeError(error, context.compilationData))
        }
    }
}

export default WorkerManager