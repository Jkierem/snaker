import { Maybe, Async } from "jazzi"
import { useState } from "react"
import { createShareString, importShareString } from "../../middleware/share"
import { compose } from "../../resources/utils"
import Modal from "../Modal"
import "./ShareModal.scss"

const clipboard = Maybe.fromNullish(navigator.clipboard)

const ShareModal = ({ code, onImport, ...modalProps}) => {
    const [importCode, setImportCode] = useState("")
    const resetCode = () => setImportCode("")
    const [err, setError] = useState()
    const maybeShare = createShareString(code)

    const handleImport = () => {
        importShareString(importCode)
        .fold(
            () => setError("Couldn't decode string. Please verify import string"),
            compose(resetCode, onImport)
        )
    }

    const handleChange = (e) => setImportCode(e.target.value)

    const handleCopy = () => {
        clipboard.map(clip => clip.writeText(maybeShare.onNone("")))
    }

    const handlePaste = () => {
        clipboard
        .map(clip => clip.readText())
        .map(Async.fromPromise)
        .toAsync()
        .join()
        .map(setImportCode)
        .run()
    }

    return <Modal {...modalProps}>
        {
            () => <div className="container">
                <div>
                    <input disabled value={maybeShare.onNone("")} readOnly />
                    <button onClick={handleCopy}>Copy</button>
                </div>
                <div>
                    <input value={importCode} onChange={handleChange}/>
                    <button onClick={handlePaste}>Paste</button>
                    <button onClick={handleImport}>Import</button>
                    {err && <div>{err}</div>}
                </div>
            </div>
        }
    </Modal>
}

export default ShareModal