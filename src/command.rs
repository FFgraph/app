use crate::error::Error;

/// Save content to provided path
///
/// # Errors
/// If file cannot be saved at provided path
#[tauri::command]
pub fn save_file_content(file_path: String, file_content: String) -> Result<(), Error> {
    std::fs::write(file_path, file_content)?;
    Ok(())
}
