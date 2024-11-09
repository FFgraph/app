import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useRef, useState } from "react";
import Dialog, { type DialogRef } from "@components/Dialog";
import NodeGraph from "@components/NodeGraph";

import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import {
    type Connection,
    type Edge,
    type EdgeChange,
    type Node,
    type NodeChange,
    type ReactFlowInstance,
    type ReactFlowJsonObject,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
} from "@xyflow/react";
import Button from "@components/Button";
import ErrorBox from "@components/ErrorBox";
import classNames from "classnames";
import * as styles from "./app.css";

function flowInstanceToJSON(flowInstance: ReactFlowInstance): string {
    return JSON.stringify(flowInstance.toObject(), undefined, 4);
}

interface IdentifierInfo {
    displayName: string;
    filePath?: string;
    savedFileContent?: string;
    lastKnownObject?: ReactFlowJsonObject;
}

function App() {
    const dialogRef = useRef<DialogRef>(null);
    const [identifiers, setIdentifiers] = useState<IdentifierInfo[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [activeIdentifier, setActiveIdentifier] = useState<number | null>(
        null,
    );
    const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(
        null,
    );

    const changeToIndex = useCallback(
        (index: number) => {
            const updatedIdentifiers = identifiers.map((item, itemIndex) =>
                itemIndex === activeIdentifier
                    ? { ...item, lastKnownObject: flowInstance?.toObject() }
                    : item,
            );
            setIdentifiers(updatedIdentifiers);
            const identifierInfo = identifiers[index];
            const lastKnownObject = identifierInfo.lastKnownObject;
            if (lastKnownObject && flowInstance) {
                setNodes(lastKnownObject.nodes);
                setEdges(lastKnownObject.edges);
                flowInstance.setViewport(lastKnownObject.viewport);
            } else {
                setNodes([]);
                setEdges([]);
            }
            setActiveIdentifier(index);
        },
        [activeIdentifier, flowInstance, identifiers],
    );

    // function which is called when nodes changes
    const onNodesChange = useCallback(
        (changes: NodeChange[]) =>
            setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );

    // function which is called when edges changes
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) =>
            setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );

    // function which is called when two nodes get connected
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    // common function to create new graph
    const createNewGraph = useCallback(() => {
        setNodes([]);
        setEdges([]);
        setActiveIdentifier(identifiers.length);
        setIdentifiers([
            ...identifiers,
            { displayName: `unknown${identifiers.length}` },
        ]);
    }, [identifiers]);

    useEffect(() => {
        // register a new graph listener
        const unListenOpenFile = listen("new-graph", async () => {
            createNewGraph();
        });
        return () => {
            unListenOpenFile.then((f) => f());
        };
    }, [createNewGraph]);

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
                setActiveIdentifier(identifiers.length);
                setIdentifiers([
                    ...identifiers,
                    {
                        displayName: file,
                        filePath: file,
                        savedFileContent: fileContent,
                        lastKnownObject: flow,
                    },
                ]);
                setNodes(flow.nodes);
                setEdges(flow.edges);
            }
        });

        return () => {
            unListenOpenFile.then((f) => f());
        };
    }, [identifiers]);

    useEffect(() => {
        // save current file to a content
        const unListenSaveGraph = listen("save-graph", async () => {
            if (flowInstance && activeIdentifier !== null) {
                let file: string | null;
                const identifierFilePath =
                    identifiers[activeIdentifier].filePath;
                if (identifierFilePath) {
                    file = identifierFilePath;
                } else {
                    file = await save({
                        filters: [{ name: "JSON", extensions: ["json"] }],
                    });
                }
                if (file) {
                    const fileContent = flowInstanceToJSON(flowInstance);
                    invoke("save_file_content", {
                        filePath: file,
                        fileContent: fileContent,
                    });
                    const updatedIdentifiers = identifiers.map((item, index) =>
                        index === activeIdentifier
                            ? {
                                  displayName: file,
                                  filePath: file,
                                  savedFileContent: fileContent,
                              }
                            : item,
                    );
                    setIdentifiers(updatedIdentifiers);
                }
            }
        });

        return () => {
            unListenSaveGraph.then((f) => f());
        };
    }, [flowInstance, activeIdentifier, identifiers]);

    // effect to handle save as graph
    useEffect(() => {
        const unListenSaveGraph = listen("save-as-graph", async (_event) => {
            if (flowInstance && activeIdentifier !== null) {
                let file: string | null;
                file = await save({
                    filters: [{ name: "JSON", extensions: ["json"] }],
                });
                if (file) {
                    const fileContent = flowInstanceToJSON(flowInstance);
                    const updatedIdentifiers = identifiers.map((item, index) =>
                        index === activeIdentifier
                            ? {
                                  displayName: file,
                                  filePath: file,
                                  savedFileContent: fileContent,
                                  lastKnownObject: item.lastKnownObject,
                              }
                            : item,
                    );
                    setIdentifiers(updatedIdentifiers);
                    invoke("save_file_content", {
                        filePath: file,
                        fileContent: fileContent,
                    });
                }
            }
        });

        return () => {
            unListenSaveGraph.then((f) => f());
        };
    }, [flowInstance, activeIdentifier, identifiers]);

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
        <div>
            <Dialog ref={dialogRef}>
                <ErrorBox message={errorMessage} errors={errors} />
            </Dialog>
            <div
                className={classNames(styles.mainDiv, {
                    [styles.centered]: identifiers.length === 0,
                })}
            >
                {identifiers.length === 0 ? (
                    <Button onClick={createNewGraph}>
                        Create new graph...
                    </Button>
                ) : (
                    <>
                        <div className={styles.titleDiv}>
                            {identifiers.map((identifier, index) => (
                                <div
                                    key={identifier.displayName}
                                    className={classNames(styles.titleItem, {
                                        [styles.titleItemSelected]:
                                            index === activeIdentifier,
                                    })}
                                    onClick={() => changeToIndex(index)}
                                    onKeyDown={() => changeToIndex(index)}
                                >
                                    <p>{identifier.displayName}</p>
                                </div>
                            ))}
                        </div>
                        <div className={styles.nodeGraph}>
                            <NodeGraph
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onInit={setFlowInstance}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
