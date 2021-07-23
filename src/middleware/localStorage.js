import { Maybe } from "jazzi";
import helpMessage from "../components/Editor/helpMessage";

const key = "__SNAKER_STORED_CODE__"

const StorageObject = {
    save(code){
        localStorage.setItem(key,window.btoa(code));
    },
    load(){
        return Promise.resolve().then(() => {
            return Maybe
                .from(localStorage.getItem(key))
                .fmap(window.atob)
                .onNone(() => helpMessage)
        })
    }
}

export default StorageObject