import gcn from "getclassname"
import { useState } from "react";
import { Delay } from "../../core/types";
import Modal from "../Modal";
import "./OptionsModal.scss"

const diverge = (...fns) => (...args) => fns.map(fn => fn(...args))

const initState = engine => ({
    speed: Delay.fromEnum(engine.delay),
    deterministic: engine.deterministic,
    seed: `${engine.seed}`
})

const OptionsModal = ({ open, onClose, engine }) => {

    const [ data, setData ] = useState(initState(engine))

    const optionsCl = gcn({ 
        base: "options",
        "&--hidden": !open 
    });
    const optionsFieldCl = optionsCl.element("field");
    const optionsButtonCl = optionsCl.element("button")
    const optionsTooltipCl = optionsCl.element("tooltip");
    const optionsButtonAltCl = optionsCl.element("button").recompute({ "&--danger": true });

    const handleSpeedChange = (e) => setData(d => ({ ...d, speed: e.target.value }))
    const handleRandomChange = (e) => setData(d => ({ ...d, deterministic: !e.target.checked }))
    const handleSeedChange = (e) => setData(d => ({ ...d, seed: e.target.value }))
    const handleCancel = () => setData(initState(engine))

    return <Modal open={open} onClose={onClose}>
        {({ handleClose }) => {
            return <>
                <div className={optionsFieldCl}>
                    <label>Speed</label>
                    <select value={data.speed} onChange={handleSpeedChange}>
                        <option value={0}>Slow</option>
                        <option value={1}>Normal</option>
                        <option value={2}>Fast</option>
                    </select>
                </div>
                <div className={optionsFieldCl}>
                    <label>Random Seed</label>
                    <input type="checkbox" checked={!data.deterministic} onChange={handleRandomChange} />
                    <input type="text" max={9999999} pattern="\d*" maxLength={8} value={data.seed} disabled={!data.deterministic} onChange={handleSeedChange} />
                </div>
                <div className={optionsFieldCl}>
                    <label>
                        <span className={optionsTooltipCl} title="By enabling this, you are allowing the use of cookies to store your code">?</span>
                        Auto save (cookies)
                    </label>
                    <input type="checkbox" checked={true} onChange={() => {}} tooltip/>
                </div>
                <div className={optionsFieldCl}>
                    <button className={optionsButtonCl} onClick={handleClose("save",data)}>Save</button>
                    <button className={optionsButtonAltCl} onClick={diverge(handleClose("cancel"), handleCancel)}>Cancel</button>
                </div>
            </>
        }}
    </Modal>
}

export default OptionsModal