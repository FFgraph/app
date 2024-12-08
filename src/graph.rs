use serde::{Deserialize, Serialize};
use specta::Type;

/// Struct representing a graph
#[derive(Serialize, Deserialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct Graph {
    graph: serde_json::Value,
}
