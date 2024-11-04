import type React from "react";
import { forwardRef } from "react";

interface DialogProps extends React.DialogHTMLAttributes<HTMLDialogElement> {}

// expose dom node to parent component with a ref.
export default forwardRef<HTMLDialogElement, DialogProps>(
    function Dialog(props, ref) {
        return (
            <dialog ref={ref} className={props.className}>
                {props.children}
            </dialog>
        );
    },
);
