import type React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button(buttonProps: ButtonProps) {
    const { children, ...props } = buttonProps;
    return (
        <button type="button" {...props}>
            {children}
        </button>
    );
}
