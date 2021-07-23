import { useRef } from "react"
import { mkWorker } from "./worker"

export const useLoop = () => {
    const workerRef = useRef()
    const compileWorker = (code,snake,world) => {
        return mkWorker(code,snake,world,workerRef)
    }
    return [workerRef, compileWorker];
}
