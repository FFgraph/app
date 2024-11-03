import type React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button(props: ButtonProps) {
    return (
        <button
            type="button"
            className={props.className}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}
