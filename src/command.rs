use tauri::{AppHandle, Window};

use crate::error::{Error, Message};

/// Save content to provided path
///
/// # Errors
/// If file cannot be saved at provided path
#[tauri::command]
pub fn save_file_content(file_path: &str, file_content: &str) -> Result<(), Error> {
    std::fs::write(file_path, file_content).message("failed to write save content to file")?;
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
