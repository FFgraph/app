use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::options::global::GlobalOptions;

/// Application state
#[derive(Serialize, Deserialize)]
pub struct ApplicationState {
    global_options_vec: Vec<GlobalOptions>,
    global_options_name_hash_map: HashMap<String, GlobalOptions>,
}

impl Default for ApplicationState {
    fn default() -> Self {
        let global_options_vec = GlobalOptions::all();
        let global_options_name_hash_map = GlobalOptions::all()
            .into_iter()
            .map(|option| (option.name().to_string(), option))
            .collect();
        Self {
            global_options_vec,
            global_options_name_hash_map,
        }
    }
}

impl ApplicationState {
    /// Get vec of global options
    #[must_use]
    pub(crate) fn global_options_vec(&self) -> &Vec<GlobalOptions> {
        &self.global_options_vec
    }
}
