import { Maybe } from "jazzi";
import { helpMessage } from "../resources/messages";
import { range } from "../resources/utils";

const codeKey = "__SNAKER_STORED_CODE__"
const timestampKey = "__STAMPS__"
const slotKey = x => `__SLOT__${x}`

const StorageObject = {
    save(code){
        this.setKey(codeKey,code)
    },
    async saveSlot(slot,code){
        const timestamp = Date.now()
        const stamps = await this.getStamps();
        stamps[slot] = timestamp;
        this.setKey(timestampKey, JSON.stringify(stamps))
        this.setKey(slotKey(slot),code);
        return stamps;
    },
    getStamps(){
        return this.getKey(timestampKey, () => range(0,10).map(() => "-- empty --"))
    },
    loadSlot(slot){
        return this.getKey(slotKey(slot),"")
    },
    load(){
        return this.getKey(codeKey,helpMessage)
    },
    setKey(key,value){
        localStorage.setItem(key,window.btoa(value));
    },
    getKey(key,defaultData){
        return Promise.resolve().then(() => {
            return Maybe
                .from(localStorage.getItem(key))
                .fmap(window.atob)
                .onNone(defaultData)
        })
    },
}

export default StorageObject