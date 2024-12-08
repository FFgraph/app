use crate::options::global::GlobalOptions;

/// Application state
pub struct ApplicationState {
    global_options: Vec<GlobalOptions>,
}

impl Default for ApplicationState {
    fn default() -> Self {
        Self {
            global_options: GlobalOptions::all(),
        }
    }
}

impl ApplicationState {
    /// Get global options state
    pub(crate) fn global_options(&self) -> &[GlobalOptions] {
        &self.global_options
    }
}
