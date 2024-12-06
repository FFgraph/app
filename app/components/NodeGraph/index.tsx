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
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
    events,
    type JsonValue,
    type LoadOptionsEvent,
    commands,
} from "@/gen/tauri";
import { Channel } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useState } from "react";
import * as styles from "./styles.css";

async function invokeAddFileNameToTitle(file: string | null) {
    const result = await commands.addFileNameToTitle(file);
    if (result.status === "error") {
        await commands.emitError(result.error);
    }
}

async function saveInstanceToFile(
    flow: ReactFlowJsonObject,
    file: string,
    identifier: string,
) {
    const jsonValue: JsonValue = JSON.parse(JSON.stringify(flow));
    const result = await commands.saveGraph(file, {
        identifier: identifier,
        graph: jsonValue,
    });
    if (result.status === "error") {
        await commands.emitError(result.error);
    }
    await invokeAddFileNameToTitle(file);
}

async function loadOptions(
    channel: Channel<LoadOptionsEvent>,
    identifier: string,
) {
    const result = await commands.loadOptions(channel, identifier);
    if (result.status === "error") {
        await commands.emitError(result.error);
    }
}

const fileFilters = [{ name: "FFgraph", extensions: ["ffgraph"] }];

function Flow() {
    const [identifier, setIdentifier] = useState<string>("HEAD");
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const { setViewport, toObject: flowToObject } = useReactFlow();

    // channel which is called when loading a options
    const loadOptionsChannel = new Channel<LoadOptionsEvent>();
    loadOptionsChannel.onmessage = (loadOptionsEvent) => {
        const handleEvent = (loadEvent: LoadOptionsEvent): string => {
            let message: string;
            switch (loadEvent.type) {
                case "started": {
                    message = "starting loading options";
                    break;
                }
                case "cloning": {
                    message = "cloning repository";
                    break;
                }
                case "loading": {
                    message = "loading data from repository";
                    break;
                }
                case "completed": {
                    message = `download options with identifier ${loadEvent.identifier}`;
                    setIdentifier(loadEvent.identifier);
                    break;
                }
            }
            return message;
        };

        handleEvent(loadOptionsEvent);
    };

    // function which is called when nodes changes
    const onNodesChange = useCallback(async (changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    // function which is called when edges changes
    const onEdgesChange = useCallback(async (changes: EdgeChange[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    // function which is called when two nodes get connected
    const onConnect = useCallback(async (params: Connection) => {
        setEdges((eds) => addEdge(params, eds));
    }, []);

    useEffect(() => {
        // register a new graph listener
        const unListenOpenFile = events.newGraph.listen(async () => {
            await loadOptions(loadOptionsChannel, "HEAD");
            setNodes([]);
            setEdges([]);
            setViewport({ x: 0, y: 0, zoom: 1 });
            await invokeAddFileNameToTitle(null);
        });
        return () => {
            unListenOpenFile.then((f) => f());
        };
    }, [setViewport, loadOptionsChannel]);

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
                    flow = JSON.parse(
                        JSON.stringify(readGraphResult.data.graph),
                    );
                    await loadOptions(
                        loadOptionsChannel,
                        readGraphResult.data.identifier,
                    );
                } else {
                    await commands.emitError(readGraphResult.error);
                }
                if (flow) {
                    setNodes(flow.nodes);
                    setEdges(flow.edges);
                    setViewport(flow.viewport);
                    setCurrentFile(file);
                    await invokeAddFileNameToTitle(file);
                }
            }
        });

        return () => {
            unListenOpenFile.then((f) => f());
        };
    }, [setViewport, loadOptionsChannel]);

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
                await saveInstanceToFile(flowToObject(), file, identifier);
            }
        });

        return () => {
            unListenSaveGraph.then((f) => f());
        };
    }, [flowToObject, currentFile, identifier]);

    // effect to handle save as graph
    useEffect(() => {
        const unListenSaveGraph = events.saveAsGraph.listen(async (_event) => {
            let file: string | null;
            file = await save({
                filters: fileFilters,
            });
            if (file) {
                await saveInstanceToFile(flowToObject(), file, identifier);
                setCurrentFile(file);
            }
        });

        return () => {
            unListenSaveGraph.then((f) => f());
        };
    }, [flowToObject, identifier]);

    return (
        <div className={styles.topDiv}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
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
