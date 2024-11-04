/// Error enum for application
#[derive(thiserror::Error, Debug)]
#[non_exhaustive]
pub enum Error {
    /// std io error
    #[error(transparent)]
    StdIo(#[from] std::io::Error),
    /// tauri error
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    /// `tauri-plugin-dialog` error
    #[error(transparent)]
    TauriPluginDialog(#[from] tauri_plugin_dialog::Error),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
