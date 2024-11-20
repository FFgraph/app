import type React from "react";
import {
    type ForwardedRef,
    forwardRef,
    useImperativeHandle,
    useRef,
    type MouseEvent,
} from "react";
import * as styles from "./style.css";
import classNames from "classnames";

interface DialogProps
    extends Omit<
        React.DialogHTMLAttributes<HTMLDialogElement>,
        "onMouseDown"
    > {}

export interface DialogRef {
    open: () => void;
    close: () => void;
}

// expose dom node to parent component with a ref.
const Dialog = (dialogProps: DialogProps, ref: ForwardedRef<DialogRef>) => {
    const { children, className, ...props } = dialogProps;

    const dialogRef = useRef<HTMLDialogElement>(null);

    const onDialogMouseDown = (event: MouseEvent<HTMLDialogElement>) => {
        if (dialogRef.current) {
            const rect = dialogRef.current.getBoundingClientRect();
            const isInDialog =
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width;
            if (!isInDialog) {
                dialogRef.current.close();
            }
        }
    };

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
        <dialog
            ref={dialogRef}
            className={classNames(styles.dialogMainStyle, className)}
            {...props}
            onMouseDown={onDialogMouseDown}
        >
            {children}
        </dialog>
    );
};

export default forwardRef(Dialog);
