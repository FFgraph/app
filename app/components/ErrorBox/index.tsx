import Button from "@/components/Button";
import { useState } from "react";
import type { Error as TauriError } from "@/gen/tauri";
import * as styles from "./styles.css";

interface ErrorBoxProps {
    error: TauriError;
}

export default function ErrorBox(props: ErrorBoxProps) {
    const [hideErrors, setHideErrors] = useState(true);

    const changeHideErrors = () => {
        setHideErrors(!hideErrors);
    };

    return (
        <div className={styles.topDiv}>
            <div>{props.error.message}</div>
            {props.error.errors.length !== 0 && (
                <>
                    <Button
                        className={styles.errorsButton}
                        onClick={changeHideErrors}
                    >
                        Errors {"\u{25BC}"}
                    </Button>
                    <ul hidden={hideErrors}>
                        {props.error.errors.map((err) => (
                            <li key={err}>{err}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
