import classNames from "classnames";
import * as styles from "./styles.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button(buttonProps: ButtonProps) {
    const { children, className, ...props } = buttonProps;
    return (
        <button
            className={classNames(styles.buttonDefaultClass, className)}
            type="button"
            {...props}
        >
            {children}
        </button>
    );
}
