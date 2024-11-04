//! Main `FFgraph` application
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ffgraph::error::Error;
use ffgraph::menu::{create_menu, handle_menu_event};
use tauri::Emitter;

fn main() -> Result<(), Error> {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let handle = app.handle();
            // set a menu for application
            let menu = create_menu(handle)?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, menu_event| {
            // when custom menu item is clicked handle event if error raise error message
            if let Err(err) = handle_menu_event(app, &menu_event) {
                app.emit("error-message", err.to_string()).ok();
            }
        })
        .invoke_handler(tauri::generate_handler![
            ffgraph::command::save_file_content
        ])
        .run(tauri::generate_context!())?;
    Ok(())
}
