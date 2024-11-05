import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import Dialog, { type DialogRef } from "./components/Dialog";
import NodeGraph from "./components/NodeGraph";

import styles from "./app.module.css";

function App() {
    const dialogRef = useRef<DialogRef>(null);
    const [errorMessage, setErrorMessage] = useState("");

    // listen to error message and display error message
    useEffect(() => {
        const unListenErrorMessage = listen<string>(
            "error-message",
            (event) => {
                const message = event.payload;
                setErrorMessage(message);
                if (dialogRef.current) {
                    dialogRef.current.open();
                }
            },
        );
        return () => {
            unListenErrorMessage.then((f) => f());
        };
    });

    return (
        <div className={styles.mainDiv}>
            <Dialog ref={dialogRef}>{errorMessage}</Dialog>
            <NodeGraph />
        </div>
    );
}

export default App;
