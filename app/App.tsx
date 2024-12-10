import Dialog, { type DialogRef } from "@/components/Dialog";
import NodeGraph from "@/components/NodeGraph";
import { useEffect, useRef, useState } from "react";

import Button from "@/components/Button";
import { events, type Error as TauriError } from "@/gen/tauri";
import * as styles from "./styles.css";

function App() {
    const dialogRef = useRef<DialogRef>(null);
    const [error, setError] = useState<TauriError | null>(null);
    const [hideErrors, setHideErrors] = useState(true);

    const changeHideErrors = () => {
        setHideErrors(!hideErrors);
    };

    // listen to error message and display error message
    useEffect(() => {
        const unListenErrorMessage = events.errorMessage.listen((event) => {
            setError(event.payload);
            if (dialogRef.current) {
                dialogRef.current.open();
            }
        });
        return () => {
            unListenErrorMessage.then((f) => f());
        };
    });

    return (
        <div>
            <Dialog ref={dialogRef} title="Error Message">
                {error && (
                    <div className={styles.errorDiv}>
                        <div>{error.message}</div>
                        <Button
                            className={styles.errorsButton}
                            onClick={changeHideErrors}
                        >
                            Errors {"\u{25BC}"}
                        </Button>
                        <ul hidden={hideErrors}>
                            {error.errors.map((err) => (
                                <li key={err}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </Dialog>
            <div className={styles.mainDiv}>
                <NodeGraph />
            </div>
        </div>
    );
}

export default App;
