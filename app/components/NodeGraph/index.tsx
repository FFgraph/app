import {
    Background,
    Controls,
    type Edge,
    type Node,
    Panel,
    ReactFlow,
    type ReactFlowInstance,
    type ReactFlowJsonObject,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useEffect, useRef, useState } from "react";
import Button from "../Button";
import Dialog, { type DialogRef } from "../Dialog";
import styles from "./styles.module.css";

function Flow() {
    const dialogRef = useRef<DialogRef>(null);
    const [dialogText, setDialogText] = useState("");
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(
        null,
    );
    const { setViewport } = useReactFlow();
    const [currentFile, setCurrentFile] = useState<string | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: open file should be mounted only once
    useEffect(() => {
        // register a open file listener for one time
        const unListenOpenFile = listen("open-file", async (_event) => {
            const file = await open({
                multiple: false,
                filters: [{ name: "JSON", extensions: ["json"] }],
            });
            // if file present update current value
            if (file) {
                const flow: ReactFlowJsonObject = JSON.parse(
                    await readTextFile(file),
                );

                if (flow) {
                    const { x = 0, y = 0, zoom = 1 } = flow.viewport;
                    setNodes(flow.nodes || []);
                    setEdges(flow.edges || []);
                    setViewport({ x, y, zoom });
                    setCurrentFile(file);
                }
            }
        });
        return () => {
            unListenOpenFile.then((f) => f());
        };
    }, []);

    useEffect(() => {
        const unListenSaveGraph = listen("save-graph", async (_event) => {
            if (flowInstance) {
                let file: string | null;
                if (currentFile) {
                    file = currentFile;
                } else {
                    file = await save({
                        filters: [{ name: "JSON", extensions: ["json"] }],
                    });
                    // update current file to file if file is not null
                    if (file) {
                        setCurrentFile(file);
                    }
                }
                if (file) {
                    invoke("save_file_content", {
                        filePath: file,
                        fileContent: JSON.stringify(flowInstance.toObject()),
                    });
                }
            }
        });

        return () => {
            unListenSaveGraph.then((f) => f());
        };
    }, [flowInstance, currentFile]);

    useEffect(() => {
        const unListenSaveGraph = listen("save-as-graph", async (_event) => {
            if (flowInstance) {
                let file: string | null;
                file = await save({
                    filters: [{ name: "JSON", extensions: ["json"] }],
                });
                if (file) {
                    setCurrentFile(file);
                    invoke("save_file_content", {
                        filePath: file,
                        fileContent: JSON.stringify(flowInstance.toObject()),
                    });
                }
            }
        });

        return () => {
            unListenSaveGraph.then((f) => f());
        };
    }, [flowInstance]);

    const onClickExportButton = () => {
        if (flowInstance) {
            setDialogText(JSON.stringify(flowInstance.toObject()));
            if (dialogRef.current) {
                dialogRef.current.open();
            }
        }
    };

    return (
        <div className={styles.topDiv}>
            <Dialog ref={dialogRef}>{dialogText}</Dialog>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onInit={setFlowInstance}
                fitView
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

export default function FlowWithGraph() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
}
