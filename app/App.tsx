import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import Dialog, { type DialogRef } from "./components/Dialog";
import NodeGraph from "./components/NodeGraph";

import styles from "./app.module.css";

function App() {
    const dialogRef = useRef<DialogRef>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    // listen to error message and display error message
    useEffect(() => {
        const unListenErrorMessage = listen<{
            message: string;
            errors: string[];
        }>("error-message", (event) => {
            const payload = event.payload;
            setErrorMessage(payload.message);
            setErrors(payload.errors);
            if (dialogRef.current) {
                dialogRef.current.open();
            }
        });
        return () => {
            unListenErrorMessage.then((f) => f());
        };
    });

    return (
        <div className={styles.mainDiv}>
            <Dialog ref={dialogRef}>
                {errorMessage} {errors}
            </Dialog>
            <NodeGraph />
        </div>
    );
}

export default App;
