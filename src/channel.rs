use serde::{Deserialize, Serialize};
use specta::Type;

/// Event for loading options
#[derive(Serialize, Deserialize, Type, Clone)]
#[serde(rename_all = "camelCase", tag = "type")]
pub enum LoadOptionsEvent {
    /// Load options event have started
    Started,
    /// Repository is currently cloning and performing checkout as required
    Cloning,
    /// Loading data from repository to provided path
    Loading,
    /// Load options event is completed
    Completed {
        /// identifier od data which was loaded
        identifier: String,
    },
}
