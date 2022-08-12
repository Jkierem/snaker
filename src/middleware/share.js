import { Either, Maybe } from "jazzi"
import { Env } from "./localStorage"

export const encode = (data) => Env.encode(data)
export const decode = (data) => Env.decode(data)

export const createShareString = (code) => {
    return Maybe
        .fromEmpty(code)
        .map(str => str.trim())
        .filter(str => str.length)
        .map(encode)
}

export const importShareString = (encoded) => {
    return Either.attempt(() => decode(encoded))
}