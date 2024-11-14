import Dialog, { type DialogRef } from "@components/Dialog";
import NodeGraph from "@components/NodeGraph";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";

import ErrorBox from "@components/ErrorBox";
import type { ErrorFormat } from "@components/ErrorBox";
import * as styles from "./styles.css";

function App() {
    const dialogRef = useRef<DialogRef>(null);
    const [error, setError] = useState<ErrorFormat | null>();

    // listen to error message and display error message
    useEffect(() => {
        const unListenErrorMessage = listen<ErrorFormat>(
            "error-message",
            (event) => {
                setError(event.payload);
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
        <div>
            <Dialog ref={dialogRef}>
                {error && <ErrorBox error={error} />}
            </Dialog>
            <div className={styles.mainDiv}>
                <NodeGraph />
            </div>
        </div>
    );
}

export default App;
