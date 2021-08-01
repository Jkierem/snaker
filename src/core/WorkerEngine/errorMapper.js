import { decode } from "vlq"
import { addRuntime } from "./worker"

const runtime = addRuntime([],[],{},"persist","noOp")("")
const runtimeDisplacement = runtime.split("\n").length - 2;

export const parseMinifyError = ({ col: column, line, message: text }) => {
    return {
        column,
        row: line - runtimeDisplacement - 1,
        text,
    }
} 

const findColumn = (str) => {
    const track = str.split("\n")[1]
    const index = track.lastIndexOf(":");
    return Number(track.slice(index).replace(/[^\d]/gi,""));
}
export const parseRuntimeError = (err, { map: sourceMap }) => {
    const text = err.error.message;
    const compiledCol = findColumn(err.error.stack)
    const mappings = sourceMap.mappings
            .split(",")
            .map(m => decode(m))
            .map(([compiled,_,row,col]) => ({ compiled, row, col }))
    const { row, col: column } = mappings.reduce((acc,next,index) => {
        const { compiled, row, col } = next
        const { accum, found, ...rest } = acc
        if( found ){
            return acc;
        } else {
            if ((accum + compiled) > compiledCol) {
                return { accum, found: true, ...rest }
            } else {
                return {
                    found, 
                    accum: accum + compiled, 
                    row: rest.row + row, 
                    col: rest.col + col,
                }
            }
        }
    },{ row: 0, col: 0, accum: 0, found: false })
    return {
        text,
        row: row - runtimeDisplacement,
        column,
    }
}