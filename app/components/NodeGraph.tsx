import { Background, Controls, Panel, ReactFlow } from "@xyflow/react";
import type { ReactFlowInstance } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Button from "./Button";
import { useRef, useState } from "react";
import Dialog from "./Dialog";

export default function NodeGraph() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [dialogText, setDialogText] = useState("");
    const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(
        null,
    );

    const onClickExportButton = () => {
        if (flowInstance) {
            setDialogText(JSON.stringify(flowInstance.toObject()));
            if (dialogRef.current) {
                dialogRef.current.showModal();
            }
        }
    };

    return (
        <div className="uno-h-100% uno-w-100%">
            <Dialog ref={dialogRef}>{dialogText}</Dialog>
            <ReactFlow
                fitView
                onInit={setFlowInstance}
                proOptions={{ hideAttribution: true }}
            >
                <Background />
                <Controls />
                <Panel position="top-right">
                    <Button onClick={onClickExportButton}>Export</Button>
                </Panel>
            </ReactFlow>
        </div>
    );
}
