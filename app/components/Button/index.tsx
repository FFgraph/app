import classNames from "classnames";
import * as styles from "./styles.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    overrideClass?: boolean;
}

export default function Button(buttonProps: ButtonProps) {
    const {
        overrideClass,
        children,
        className: passedClassName,
        ...props
    } = buttonProps;
    const className = overrideClass
        ? passedClassName
        : classNames(styles.buttonDefaultClass, passedClassName);
    return (
        <button className={className} {...props}>
            {children}
        </button>
    );
}
