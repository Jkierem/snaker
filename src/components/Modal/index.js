import gcn from "getclassname"
import "./Modal.scss"

const Modal = ({ children, onClose, open }) => {

    const baseCl = gcn({ 
        base: "modal",
        "&--hidden": !open 
    });
    const contentCl = baseCl.element("content").recompute({ "&--hidden": !open });

    const handleClose = (reason,data) => (e) => {
        e?.stopPropagation?.()
        onClose?.(reason,data)
    }

    const handleClickInside = e => {
        e?.stopPropagation?.()
    }

    return <div className={baseCl} onClick={handleClose("outside")} >
        <div className={contentCl} onClick={handleClickInside}>
            {children({ handleClose })}
        </div>
    </div>
}

export default Modal;