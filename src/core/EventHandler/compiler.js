import { Event } from "../types";
import { spawnWorker, terminateWorker } from "../worker"

const Compiler = () => {
    let worker = undefined;
    let topic = undefined;
    let snake = []
    let world = []
    let persistance = {};
    let code;
    let started = false;
    let received = false;
    let stopped = false;
    return {
        reset(){
            persistance = {};
            code = undefined;
            started = false;
            received = false;
            stopped = false;
        },
        start(_code){
            this.reset();
            code = _code;
            this.run();
        },
        run(){
            this.terminate()
            return spawnWorker(code, snake, world, persistance)
            .fmap(e => {
                e.fmap(workerRef => {
                    worker = workerRef
                    worker.addEventListener("message", ({ data }) => {
                        const { type, ...extra } = data;
                        topic.emit(Event.fromString(type),extra)
                    })
                    if(!started){
                        worker.postMessage({
                            type: "Start"
                        })
                        started = true;
                    } else {
                        let id;
                        const check = () => {
                            if( received === true && !stopped){
                                received = false;
                                clearInterval(id)
                                worker.postMessage({
                                    type: "Start"
                                })
                            }
                        }
                        id = setInterval(check,100)
                    }
                })
            }).run()
        },
        stop(){
            stopped = true;
            this.terminate()
        },
        terminate(){
            terminateWorker(worker)
            .effect(() => worker = undefined)
        },
        setTopic(t){ topic = t },
        setPersistance(data){
            persistance = data;
            received = true;
            if(!stopped){
                this.run(code);
            }
        }
    }
}

export default Compiler