use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression;
use tauri::{AppHandle, Window};

use crate::error::{Error, Message};

/// Read graph from file and return serde json value
///
/// # Errors
/// If file cannot be read
#[tauri::command]
pub fn read_graph(file_path: &str) -> Result<serde_json::Value, Error> {
    let file = std::fs::read(file_path).message("failed to open path")?;
    let decoder = GzDecoder::new(file.as_slice());
    serde_json::from_reader(decoder).message("failed to create graph from file")
}

/// Save graph to provided path
///
/// # Errors
/// If file cannot be saved at provided path
#[allow(
    clippy::needless_pass_by_value,
    reason = "serde_json::Value reference doesn't implement serialize"
)]
#[tauri::command]
pub fn save_graph(file_path: &str, graph: serde_json::Value) -> Result<(), Error> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
    serde_json::to_writer(&mut encoder, &graph).message("failed to write graph to encoder")?;
    let content = encoder.finish().message("failed to encode graph")?;
    std::fs::write(file_path, content).message("failed to save graph to file")?;
    Ok(())
}

/// Set title for window to provided file name
///
/// # Errors
/// if file name cannot be added to title
#[allow(
    clippy::needless_pass_by_value,
    reason = "tauri doesn't support app handle and window as passed by reference"
)]
#[tauri::command]
pub fn add_file_name_to_title(
    app_handle: AppHandle,
    window: Window,
    file_name: Option<String>,
    is_file_saved: bool,
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
        if is_file_saved {
            title = format!("{title} - {file}");
        } else {
            title = format!("{title} - {file} \u{2B24}");
        }
    }
    if Some(title.clone()) != window.title().ok() {
        window.set_title(&title).message("failed to set title")?;
    }
    Ok(())
}
