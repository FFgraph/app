use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression;
use tauri::{AppHandle, State, Window};
use tauri_specta::Event;

use crate::error::{Error, Message};
use crate::event::ErrorMessage;
use crate::graph::Graph;
use crate::options::global::GlobalOptions;
use crate::state::ApplicationState;

/// Get all list of valid global options
#[expect(
    clippy::needless_pass_by_value,
    reason = "tauri doesn't support state as passed by reference"
)]
#[tauri::command]
#[specta::specta]
#[must_use]
pub fn list_global_options(state: State<ApplicationState>) -> &[GlobalOptions] {
    state.inner().global_options()
}

/// Emit error message back to frontend
#[expect(
    clippy::needless_pass_by_value,
    reason = "tauri doesn't support app handle as passed by reference"
)]
#[tauri::command]
#[specta::specta]
pub fn emit_error(app_handle: AppHandle, error: Error) {
    ErrorMessage(error).emit(&app_handle).ok();
}

/// Set title for window to provided file name
///
/// # Errors
/// if file name cannot be added to title
#[expect(
    clippy::needless_pass_by_value,
    reason = "tauri doesn't support app handle, window as passed by reference"
)]
#[tauri::command]
#[specta::specta]
pub fn clear_title(app_handle: AppHandle, window: Window) -> Result<(), Error> {
    set_file_name_to_title(&app_handle, &window, None)?;
    Ok(())
}

/// Read graph from file and return serde json value
///
/// # Errors
/// If file cannot be read
#[expect(
    clippy::needless_pass_by_value,
    reason = "tauri doesn't support app handle and window as passed by reference"
)]
#[tauri::command]
#[specta::specta]
pub fn read_graph(app_handle: AppHandle, window: Window, file_path: &str) -> Result<Graph, Error> {
    let file = std::fs::read(file_path).message(format!("failed to open path {file_path}"))?;
    let decoder = GzDecoder::new(file.as_slice());
    set_file_name_to_title(&app_handle, &window, Some(file_path))?;
    serde_json::from_reader(decoder).message("failed to create graph from file")
}

/// Save graph to provided path
///
/// # Errors
/// If file cannot be saved at provided path
#[expect(
    clippy::needless_pass_by_value,
    reason = "Graph reference doesn't implement Deserialize and tauri doesn't support app handle \
              and window as passed by reference"
)]
#[tauri::command]
#[specta::specta]
pub fn save_graph(
    app_handle: AppHandle,
    window: Window,
    file_path: &str,
    graph: Graph,
) -> Result<(), Error> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
    serde_json::to_writer(&mut encoder, &graph).message("failed to write graph to encoder")?;
    let content = encoder.finish().message("failed to encode graph")?;
    set_file_name_to_title(&app_handle, &window, Some(file_path))?;
    std::fs::write(file_path, content)
        .message(format!("failed to save graph to file {file_path}"))?;
    Ok(())
}

fn set_file_name_to_title(
    app_handle: &AppHandle,
    window: &Window,
    file_name: Option<&str>,
) -> Result<(), Error> {
    let mut title = app_handle
        .config()
        .app
        .windows
        .first()
        .message("failed to get first window config")?
        .title
        .clone();
    if let Some(file) = file_name {
        title = format!("{title} - {file}");
    }
    if Some(title.clone()) != window.title().ok() {
        window.set_title(&title).message("failed to set title")?;
    }
    Ok(())
}
