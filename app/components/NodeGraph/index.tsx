import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    type Connection,
    Controls,
    type Edge,
    type EdgeChange,
    MiniMap,
    type Node,
    type NodeChange,
    ReactFlow,
    type ReactFlowJsonObject,
    ReactFlowProvider,
    useReactFlow,
    type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as styles from "./styles.css";
import { useCallback, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";

function invokeAddFileNameToTitle(file: string | null, isFileSaved: boolean) {
    invoke("add_file_name_to_title", {
        fileName: file,
        isFileSaved: isFileSaved,
    });
}

function saveInstanceToFile(flowJsonObject: ReactFlowJsonObject, file: string) {
    const fileContent = JSON.stringify(flowJsonObject, undefined, 4);
    invoke("save_file_content", {
        filePath: file,
        fileContent: fileContent,
    });
    invokeAddFileNameToTitle(file, true);
}

function Flow() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const { setViewport, toObject: identifierJsonObject } = useReactFlow();

    // function which is called when nodes changes
    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds));
            invokeAddFileNameToTitle(currentFile, false);
        },
        [currentFile],
    );

    // function which is called when edges changes
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setEdges((eds) => applyEdgeChanges(changes, eds));
            invokeAddFileNameToTitle(currentFile, false);
        },
        [currentFile],
    );

    // function which is called when two nodes get connected
    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge(params, eds));
            invokeAddFileNameToTitle(currentFile, false);
        },
        [currentFile],
    );

    // function which is called when viewport changes
    const onViewportChange = useCallback(
        (_viewPort: Viewport) => {
            invokeAddFileNameToTitle(currentFile, false);
        },
        [currentFile],
    );

    useEffect(() => {
        // register a new graph listener
        const unListenOpenFile = listen("new-graph", async () => {
            setNodes([]);
            setEdges([]);
            setViewport({ x: 0, y: 0, zoom: 1 });
            invokeAddFileNameToTitle(null, true);
        });
        return () => {
            unListenOpenFile.then((f) => f());
        };
    }, [setViewport]);

    useEffect(() => {
        // register a open graph listener
        const unListenOpenFile = listen("open-graph", async () => {
            const file = await open({
                multiple: false,
                filters: [{ name: "JSON", extensions: ["json"] }],
            });
            // if file present update current value
            if (file) {
                const fileContent = await readTextFile(file);
                const flow: ReactFlowJsonObject = JSON.parse(fileContent);
                setNodes(flow.nodes);
                setEdges(flow.edges);
                setViewport(flow.viewport);
                setCurrentFile(file);
                invokeAddFileNameToTitle(file, true);
            }
        });

        return () => {
            unListenOpenFile.then((f) => f());
        };
    }, [setViewport]);

    useEffect(() => {
        // save current file to a content
        const unListenSaveGraph = listen("save-graph", async () => {
            let file: string | null;
            if (currentFile) {
                file = currentFile;
            } else {
                file = await save({
                    filters: [{ name: "JSON", extensions: ["json"] }],
                });
            }
            if (file) {
                saveInstanceToFile(identifierJsonObject(), file);
            }
        });

        return () => {
            unListenSaveGraph.then((f) => f());
        };
    }, [identifierJsonObject, currentFile]);

    // effect to handle save as graph
    useEffect(() => {
        const unListenSaveGraph = listen("save-as-graph", async (_event) => {
            let file: string | null;
            file = await save({
                filters: [{ name: "JSON", extensions: ["json"] }],
            });
            if (file) {
                saveInstanceToFile(identifierJsonObject(), file);
                setCurrentFile(file);
            }
        });

        return () => {
            unListenSaveGraph.then((f) => f());
        };
    }, [identifierJsonObject]);

    return (
        <div className={styles.topDiv}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onViewportChange={onViewportChange}
                colorMode="dark"
                fitView
                proOptions={{ hideAttribution: true }}
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}

export default function NodeGraph() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
}
