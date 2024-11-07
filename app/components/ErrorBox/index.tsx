import { useState } from "react";
import Button from "../Button";
import styles from "./styles.module.css";

interface ErrorBoxProps {
    message: string;
    errors: string[];
}

export default function ErrorBox(props: ErrorBoxProps) {
    const [hideErrors, setHideErrors] = useState(true);

    const changeHideErrors = () => {
        setHideErrors(!hideErrors);
    };

    return (
        <div className={styles.topDiv}>
            <div>{props.message}</div>
            <Button onClick={changeHideErrors}>Errors:</Button>
            <p hidden={hideErrors}>{props.errors.join("\n")}</p>
        </div>
    );
}
