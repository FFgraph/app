//! Main `FFgraph` application
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ffgraph::menu::{create_menu, handle_menu_event};
use tauri::Emitter;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let handle = app.handle();
            // set a menu for application
            let menu = create_menu(handle)?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, menu_event| {
            // when custom menu item is clicked handle error if event raise error
            if let Err(err) = handle_menu_event(app, &menu_event) {
                app.emit("error-message", err).ok();
            }
        })
        .invoke_handler(tauri::generate_handler![
            ffgraph::command::read_graph,
            ffgraph::command::save_graph,
            ffgraph::command::add_file_name_to_title,
        ])
        .run(tauri::generate_context!())?;
    Ok(())
}
