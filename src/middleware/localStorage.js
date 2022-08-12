import { BoxedEnumType, Either, Maybe, Reader } from "jazzi";
import { getCurrentVersion } from "../resources/version";

const codeKey = "__SNAKER_STORED_CODE__"
const firstTimeKey = "__SNAKER_FLAG__"
// const timestampKey = "__STAMPS__"
const versionKey = "__SNAKER_VERSION__"
// const slotKey = x => `__SLOT__${x}`

const LoadResult = BoxedEnumType("LoadResult",["FirstTime","KnownUser"])

const Base = {
    get(key){
        return Reader.from(({ get, decode }) => {
            return Either
                .fromNullish(undefined, get(key))
                .map(decode)
        })
    },
    set(key, value){
        return Reader.from(({ set, encode }) => {
            set(key, encode(value))
        })
    },
}

export const Env = {
    set: (...args) => localStorage.setItem(...args),
    encode: (data) => window.btoa(JSON.stringify({ data })),
    get: (...args) => localStorage.getItem(...args),
    decode: (data) => JSON.parse(window.atob(data)).data
}

const StorageObject = {
    save(code){
        Base
            .set(codeKey, code)
            .run(Env)
    },
    load(){

        Base
            .get(versionKey)
            .run(Env)
            .onLeft(() => {
                Maybe
                .fromNullish(localStorage.getItem(codeKey))
                .fmap(encoded => window.atob(encoded))
                .tap(legacyCode => Base.set(codeKey, legacyCode).run(Env))

                Maybe
                .fromNullish(localStorage.getItem(firstTimeKey))
                .fmap(encoded => window.atob(encoded))
                .tap(legacyFirst => Base.set(firstTimeKey, legacyFirst).run(Env))

                Base.set(versionKey, getCurrentVersion()).run(Env)
            });


        return Base
            .get(firstTimeKey)
            .run(Env)
            .fold(
                () => LoadResult.FirstTime(""), 
                () => LoadResult.KnownUser(
                    Base
                        .get(codeKey)
                        .run(Env)
                        .mapLeft(() => "")
                        .unwrap()
                )
            )
        
    },
    markAsKnownUser(){
        return Base.set(firstTimeKey, true).run(Env)
    },
}

export default StorageObject