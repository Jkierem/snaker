import gcn from "getclassname"
import { useState } from "react";
import { Delay } from "../../core/types";
import "./OptionsModal.scss"

const OptionsModal = ({ open, onClose, engine }) => {

    const [ data, setData ] = useState({
        speed: Delay.fromEnum(engine.delay),
        deterministic: engine.deterministic,
        seed: `${engine.seed}`
    })

    const optionsCl = gcn({ 
        base: "options",
        "&--hidden": !open 
    });
    const optionsContentCl = optionsCl.element("content").recompute({ "&--hidden": !open });
    const optionsFieldCl = optionsCl.element("field");
    const optionsButtonCl = optionsCl.element("button")
    const optionsButtonAltCl = optionsCl.element("button").recompute({ "&--danger": true });

    const handleClose = (reason) => (e) => {
        e.stopPropagation()
        onClose?.(reason,data)
    }

    const handleClickInside = e => {
        e.stopPropagation()
    }

    const handleSpeedChange = (e) => {
        setData(d => ({ ...d, speed: e.target.value }))
    }
    const handleRandomChange = (e) => {
        setData(d => ({ ...d, deterministic: !e.target.checked }))
    }
    const handleSeedChange = (e) => {
        setData(d => ({ ...d, seed: e.target.value }))
    }

    return <div className={optionsCl} onClick={handleClose("outside")}>
        <div className={optionsContentCl} onClick={handleClickInside}>
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
                <button className={optionsButtonCl} onClick={handleClose("save")}>Save</button>
                <button className={optionsButtonAltCl} onClick={handleClose("cancel")}>Cancel</button>
            </div>
        </div>
    </div>
}

export default OptionsModal