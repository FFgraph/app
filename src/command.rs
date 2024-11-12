use tauri::Window;

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
#[tauri::command]
pub fn add_file_name_to_title(window: Window, file_name: Option<String>) -> Result<(), Error> {
    // use window so clippy do not show needless passed by value warning
    let window = window;
    let new_title = if let Some(file) = file_name {
        format!("FFgraph - {file}")
    } else {
        "FFgraph".to_string()
    };
    window
        .set_title(&new_title)
        .message("failed to write save content to file")?;
    Ok(())
}
