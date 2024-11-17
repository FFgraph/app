import {
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
    type Viewport,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { events, type JsonValue, commands } from "@gen/tauri";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useState } from "react";
import * as styles from "./styles.css";

async function invokeAddFileNameToTitle(
    file: string | null,
    isFileSaved: boolean,
) {
    const addFileResult = await commands.addFileNameToTitle(file, isFileSaved);
    if (addFileResult.status === "error") {
        await events.errorMessage.emit(addFileResult.error);
    }
}

async function saveInstanceToFile(
    flowJsonObject: ReactFlowJsonObject,
    file: string,
) {
    const jsonValue: JsonValue = JSON.parse(JSON.stringify(flowJsonObject));
    const saveGraphResult = await commands.saveGraph(file, jsonValue);
    if (saveGraphResult.status === "error") {
        await events.errorMessage.emit(saveGraphResult.error);
    }
    await invokeAddFileNameToTitle(file, true);
}

const fileFilters = [{ name: "FFgraph", extensions: ["ffgraph"] }];

function Flow() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [isInitialViewport, setIsInitialViewport] = useState(false);
    const { setViewport, toObject: identifierJsonObject } = useReactFlow();

    // function which is called when nodes changes
    const onNodesChange = useCallback(
        async (changes: NodeChange[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds));
            await invokeAddFileNameToTitle(currentFile, false);
        },
        [currentFile],
    );

    // function which is called when edges changes
    const onEdgesChange = useCallback(
        async (changes: EdgeChange[]) => {
            setEdges((eds) => applyEdgeChanges(changes, eds));
            await invokeAddFileNameToTitle(currentFile, false);
        },
        [currentFile],
    );

    // function which is called when two nodes get connected
    const onConnect = useCallback(
        async (params: Connection) => {
            setEdges((eds) => addEdge(params, eds));
            await invokeAddFileNameToTitle(currentFile, false);
        },
        [currentFile],
    );

    // function which is called when viewport changes
    const onViewportChange = useCallback(
        async (_viewPort: Viewport) => {
            // set value same as is initial viewport and set viewport value
            // as false since future viewport changes is not new unless new graph
            // and open graph changes this value
            await invokeAddFileNameToTitle(currentFile, isInitialViewport);
            setIsInitialViewport(false);
        },
        [currentFile, isInitialViewport],
    );

    useEffect(() => {
        // register a new graph listener
        const unListenOpenFile = events.newGraph.listen(async () => {
            setNodes([]);
            setEdges([]);
            setViewport({ x: 0, y: 0, zoom: 1 });
            setIsInitialViewport(true);
            await invokeAddFileNameToTitle(null, true);
        });
        return () => {
            unListenOpenFile.then((f) => f());
        };
    }, [setViewport]);

    useEffect(() => {
        // register a open graph listener
        const unListenOpenFile = events.openGraph.listen(async () => {
            const file = await open({
                multiple: false,
                filters: fileFilters,
            });
            // if file present update current value
            if (file) {
                const readGraphResult = await commands.readGraph(file);
                let flow: ReactFlowJsonObject | null = null;
                if (readGraphResult.status === "ok") {
                    flow = JSON.parse(JSON.stringify(readGraphResult.data));
                } else {
                    await events.errorMessage.emit(readGraphResult.error);
                }
                if (flow) {
                    setNodes(flow.nodes);
                    setEdges(flow.edges);
                    setViewport(flow.viewport);
                    setCurrentFile(file);
                    setIsInitialViewport(true);
                    await invokeAddFileNameToTitle(file, true);
                }
            }
        });

        return () => {
            unListenOpenFile.then((f) => f());
        };
    }, [setViewport]);

    useEffect(() => {
        // save current file to a content
        const unListenSaveGraph = events.saveGraph.listen(async () => {
            let file: string | null;
            if (currentFile) {
                file = currentFile;
            } else {
                file = await save({
                    filters: fileFilters,
                });
            }
            if (file) {
                await saveInstanceToFile(identifierJsonObject(), file);
            }
        });

        return () => {
            unListenSaveGraph.then((f) => f());
        };
    }, [identifierJsonObject, currentFile]);

    // effect to handle save as graph
    useEffect(() => {
        const unListenSaveGraph = events.saveAsGraph.listen(async (_event) => {
            let file: string | null;
            file = await save({
                filters: fileFilters,
            });
            if (file) {
                await saveInstanceToFile(identifierJsonObject(), file);
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
