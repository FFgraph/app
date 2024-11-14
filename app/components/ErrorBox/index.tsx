import Button from "@components/Button";
import { useState } from "react";
import * as styles from "./styles.css";

export interface ErrorFormat {
    message: string;
    errors: string[];
}

interface ErrorBoxProps {
    error: ErrorFormat;
}

export default function ErrorBox(props: ErrorBoxProps) {
    const [hideErrors, setHideErrors] = useState(true);

    const changeHideErrors = () => {
        setHideErrors(!hideErrors);
    };

    return (
        <div className={styles.topDiv}>
            <div>{props.error.message}</div>
            <Button className={styles.errorsButton} onClick={changeHideErrors}>
                Errors {"\u{25BC}"}
            </Button>
            <p hidden={hideErrors}>{props.error.errors.join("\n")}</p>
        </div>
    );
}
