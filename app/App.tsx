import { listen } from "@tauri-apps/api/event";
import NodeGraph from "./components/NodeGraph";
import "virtual:uno.css";
import { useRef, useState } from "react";
import Dialog from "./components/Dialog";

function App() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [errorMessage, setErrorMessage] = useState("");
    // listen to error message and display error message
    listen<string>("error-message", (event) => {
        const message = event.payload;
        setErrorMessage(message);
        if (dialogRef.current) {
            dialogRef.current.showModal();
        }
    });
    return (
        <div className="uno-h-screen uno-w-screen">
            <Dialog ref={dialogRef}>{errorMessage}</Dialog>
            <NodeGraph />
        </div>
    );
}

export default App;
