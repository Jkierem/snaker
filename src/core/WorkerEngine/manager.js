import { Maybe } from "jazzi";
import { Event } from "../types";
import { mkEngine } from "../GameEngine"
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
        return mkContext()
            .setTopic(this.topic)
            .setEngine(mkEngine())
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
    let context = mkContext().setEngine(mkEngine());
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
                // console.log(desiredAction.get())
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
                    }
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
        handleRuntimeError(error){
            this.stop()
            context.topic.emit(Event.Error, parseRuntimeError(error, context.compilationData))
        }
    }
}

export default WorkerManager