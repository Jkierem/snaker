import { BoxedEnumType, Either, Maybe, Result } from "jazzi";
import { Event } from "../types";
import { makeId } from "../utils";
import { minify } from "terser"

const WorkerError = BoxedEnumType("WorkerError",["MinifyError","BundleError"])

const deepStringifyArray = (arr) => {
    return `[${[arr].flat(1).map(x => Array.isArray(x) ? deepStringifyArray(x) : x ).join(",")}]`
}

export const addRuntime = (snake,world,persistantData,pId,noOpId) => (code) => {
return `const Snake = {
    isSnake: true,
    turnLeft: () => self.postMessage({ 
        type: "SnakeAction",
        value: "left"
    }),
    turnRight: () => self.postMessage({ 
        type: "SnakeAction",
        value: "right"
    }),
    body: ${deepStringifyArray(snake.slice(1))},
    head: ${deepStringifyArray(snake[0])},
    length: ${snake.length}
};
const World = ${deepStringifyArray(world)};
const ${noOpId} = () => {};
const ${pId} = ${JSON.stringify(persistantData)};
const useState = (id, initialValue) => {
    let value = initialValue;
    if(id in ${pId}){
        value =  ${pId}[id]
    } else {
        ${pId}[id] = initialValue
    }
    const setValue = (newVal) => {
        ${pId}[id] = typeof newVal === "function" ? newVal(${pId}[id]) : ${pId}[id] = newVal
    }
    return [ value, setValue ]; 
}
const console = {
    log: (...rawArgs) => {
        const args = rawArgs.map(item => {
            if( typeof item === "object"){
                return JSON.parse(JSON.stringify(item))
            } else 
            if( typeof item === "function" ) {
                return \`[Function \${item.name}]\`
            }
            return item
        })
        self.postMessage({
            type: "Console",
            args
        })
    }
};
self.onmessage = async function(e){
    if(e?.data?.type === "Start"){
        try {
            await main(Snake,World);
        } catch (e) {
            self.postMessage({
                type: "RuntimeError",
                error: e
            })
        } finally {
            setTimeout(() => {
                self.postMessage({
                    type: "Persistance",
                    value: ${pId}
                })
            },500)
        }
    }
};
async function main(snake,world) {
${code}
};`
}

export const terminateWorker = (worker) => {
    return Maybe
        .fromNullish(worker)
        .effect(worker => worker?.terminate?.())
}

const uglifyCode = async (noOpId,code) => {
    try {
        return await minify(code,{
            sourceMap: {
                asObject : true
            },
            mangle: false,
            compress: {
                defaults: false,
                global_defs: {
                    "@importScripts": noOpId,
                    "@debugger": noOpId
                }
            }
        })
    } catch (e) {
        return { 
            error: e
        }
    }

}

const tryBlob = (code) => Result.attempt(() => new Blob([ code ],{ type: "text/javascript" }))

const bundleCode = (code) => {
    return Either
        .fromResult(tryBlob(code))
        .mapLeft(WorkerError.BundleError)
}

const addPersistanceEvent = (worker,context,continuation) => {
    let action = Maybe.None();
    worker.addEventListener("message", ({ data }) => {
        const { type, ...extra } = data;
        if(type === "Persistance"){
            worker.terminate();
            continuation([data,action]);
        } else if(type === "SnakeAction"){
            const { value } = extra;
            action = Maybe.Just(value)
        } else {
            context.topic.emit(Event.fromString(type),extra)
        }
    })
}

const startWorker = (worker, context, minified) => {
    context.onWorkerReady(worker)
    context.setCompilationData(minified)
    worker.postMessage({ type: "Start" })
}

export const spawnWorker = async (context) => {
    const {
        code,
        persistance,
        engine: {
            snake,
            world,
        },
    } = context;
    const pId =`Persistance_${makeId(8)}`;
    const noOpId = `noOp_${makeId(8)}`;
    const codeWithRuntime = addRuntime(snake,world,persistance,pId,noOpId)(code)
    const minified = await uglifyCode(noOpId,codeWithRuntime);
    const uglified = Either
        .fromPredicate(() => !minified.error, minified.code)
        .mapLeft(() => WorkerError.MinifyError(minified.error))
    return new Promise((res,rej) => {
        uglified
            .chain(bundleCode)
            .fmap(blob => {
                const url = URL.createObjectURL(blob)
                const worker = new Worker(url)
                URL.revokeObjectURL(url)
                return worker
            })
            .fmap(worker => {
                addPersistanceEvent(worker, context, res);
                startWorker(worker, context, minified)
                return worker;
            })
            .onLeft(rej);
    })
}