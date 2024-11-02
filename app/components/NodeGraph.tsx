import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function NodeGraph() {
    return (
        <ReactFlow>
            <Background />
            <Controls />
            <MiniMap />
        </ReactFlow>
    );
}
