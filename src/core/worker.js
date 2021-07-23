import { BoxedEnumType, Either, IO, Maybe, Result } from "jazzi";
import { makeId } from "./utils";

const WorkerError = BoxedEnumType("WorkerError",["InvalidToken","SecurityError","ParseError"])

const deepStringifyArray = (arr) => {
    return `[${[arr].flat(1).map(x => Array.isArray(x) ? deepStringifyArray(x) : x ).join(",")}]`
}

const addRuntime = (snake,world,persistantData) => (code) => {
    const pId =`Persistance${makeId(8)}`;
return `const Snake = {
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

const fallbackFns = [
    "dir", "dirXml", "table", 
    "trace", "group", "groupCollapsed", 
    "groupEnd", "clear", "count", "countReset", 
    "assert", "profile", "profileEnd", 
    "timeLog", "time", "timeEnd", "timeStamp",
    "debug", "error", "info", "warn"
]
const supportedFns = ["log"]
const handler = {
    get: function(target, fn) {
        if( supportedFns.includes(fn) ){
            return (...args) => self.postMessage({
                type: "Console",
                args,
                fn
            })
        }
        if( fallbackFns.includes(fn) ){
            return (...args) => {
                self.postMessage({
                    type: "Console",
                    args: [\`Unsupported console function: \${fn}. Falling back to console.log\`],
                    fn: "log"
                })
                self.postMessage({
                    type: "Console",
                    args,
                    fn: "log"
                })
            }
        }
        return undefined
    }
};
const ${pId} = ${JSON.stringify(persistantData)};
const useState = (id, initialValue) => {
    let value = initialValue;
    if(id in ${pId}){
        value = ${pId}[id];
    } else {
        ${pId}[id] = initialValue
    }
    const setValue = (newVal) => {
        if( typeof newVal === "function" ){
            ${pId}[id] = newVal(${pId}[id])
        } else {
            ${pId}[id] = newVal
        }
    }
    return [ value, setValue ]; 
}

const console = new Proxy({}, handler);
self.onmessage = function(e){
    if(e?.data?.type === "Start"){
        try {
            main(Snake,World);
        } catch (e) {
            self.postMessage({
                type: "RuntimeError",
                error: e
            })
        } finally {
            self.postMessage({
                type: "Persistance",
                value: ${pId}
            })
        }
    }
}

function main(snake,world) {
    ${code}
}`
}

export const terminateWorker = (worker) => {
    return Maybe
        .fromNullish(worker)
        .effect(worker => worker?.terminate?.())
}

const tryBlob = (code) => Result.attempt(() => new Blob([ code ],{ type: "text/javascript" }))

const bundleCode = (code) => {
    return Either
        .fromResult(tryBlob(code))
        .mapLeft(WorkerError.ParseError)
}

const shouldNotContain = (base) => (str) => {
    return Either
        .fromPredicate(() => !base.includes(str), str)
        .mapLeft(WorkerError.InvalidToken)
}

const isEmpty = x => x.length === 0

const sanitizeCode = (code) => {
    const [bracketCount, bracketBalance] = Array.from(code)
        .filter(x => x === "}" || x === "{")
        .reduce(([acc,valid],char) => {
            const n = char === "}" ? acc-1 : acc+1
            return [n, valid && n >= 0]
        }, [0,true])
    const invalidTokens = ["importScripts","debugger"].map(shouldNotContain(code))

    return Either
        .collectLefts(invalidTokens)
        .swapIf(isEmpty)
        .chain(() => {
            return Either
                .fromPredicate(() => bracketBalance && bracketCount === 0, code)
                .mapLeft(WorkerError.SecurityError)
        })
}

export const spawnWorker = (code,snake,world,persistance) => {
    return IO.from(() => {
        return sanitizeCode(code)
            .fmap(addRuntime(snake,world,persistance))
            .chain(bundleCode)
            .fmap(blob => {
                const url = URL.createObjectURL(blob)
                const worker = new Worker(url)
                URL.revokeObjectURL(url)
                return worker
            })
    })
}