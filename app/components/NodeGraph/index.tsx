import {
    Background,
    Controls,
    type Edge,
    type Node,
    type OnConnect,
    type OnEdgesChange,
    type OnInit,
    type OnNodesChange,
    ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as styles from "./styles.css";

interface NodeGraphProps<
    NodeType extends Node = Node,
    EdgeType extends Edge = Edge,
> {
    nodes: NodeType[];
    edges: EdgeType[];
    onNodesChange: OnNodesChange<NodeType>;
    onEdgesChange: OnEdgesChange<EdgeType>;
    onConnect: OnConnect;
    onInit: OnInit<NodeType, EdgeType>;
}

export default function NodeGraph(props: NodeGraphProps) {
    return (
        <div className={styles.topDiv}>
            <ReactFlow
                nodes={props.nodes}
                edges={props.edges}
                onNodesChange={props.onNodesChange}
                onEdgesChange={props.onEdgesChange}
                onConnect={props.onConnect}
                onInit={props.onInit}
                fitView
                proOptions={{ hideAttribution: true }}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}
