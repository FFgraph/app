import type React from "react";
import {
    type ForwardedRef,
    forwardRef,
    useImperativeHandle,
    useRef,
} from "react";

interface DialogProps extends React.DialogHTMLAttributes<HTMLDialogElement> {}

export interface DialogRef {
    open: () => void;
    close: () => void;
}

// expose dom node to parent component with a ref.
const Dialog = (dialogProps: DialogProps, ref: ForwardedRef<DialogRef>) => {
    const { children, ...props } = dialogProps;

    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(
        ref,
        () => {
            return {
                open() {
                    if (dialogRef.current) {
                        dialogRef.current.showModal();
                    }
                },
                close() {
                    if (dialogRef.current) {
                        dialogRef.current.close();
                    }
                },
            };
        },
        [],
    );

    return (
        <dialog ref={dialogRef} {...props}>
            {children}
        </dialog>
    );
};

export default forwardRef(Dialog);