import Button from "@/components/Button";
import classNames from "classnames";
import type React from "react";
import {
    type ForwardedRef,
    type MouseEvent,
    forwardRef,
    useImperativeHandle,
    useRef,
} from "react";
import * as styles from "./style.css";

interface DialogProps
    extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "onMouseDown"> {
    title: string;
}

export interface DialogRef {
    open: () => void;
}

// expose dom node to parent component with a ref.
const Dialog = (dialogProps: DialogProps, ref: ForwardedRef<DialogRef>) => {
    const {
        children,
        title,
        className: passedClassName,
        ...props
    } = dialogProps;

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

    const closeDialog = () => {
        if (dialogRef.current) {
            dialogRef.current.close();
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
            };
        },
        [],
    );

    return (
        <dialog
            ref={dialogRef}
            className={classNames(styles.dialogMainStyle, passedClassName)}
            {...props}
            onMouseDown={onDialogMouseDown}
        >
            <div className={styles.dialogDiv}>
                <div className={styles.titleDiv}>
                    <p className={styles.title}>{title}</p>
                    <Button
                        className={styles.buttonClass}
                        onClick={closeDialog}
                    >
                        {"\u{2169}"}
                    </Button>
                </div>
                <div>{children}</div>
            </div>
        </dialog>
    );
};

export default forwardRef(Dialog);
