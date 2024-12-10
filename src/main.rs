//! Main `FFgraph` application
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::Path;
use std::process::Command;

use ffgraph::event::{CloseGraph, ErrorMessage, NewGraph, OpenGraph, SaveAsGraph, SaveGraph};
use ffgraph::menu::{create_menu, handle_menu_event};
use ffgraph::state::ApplicationState;
use tauri::Manager;
use tauri_specta::{collect_commands, collect_events, Event};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let specta_builder = tauri_specta::Builder::new()
        .commands(collect_commands![
            ffgraph::command::list_global_options,
            ffgraph::command::emit_error,
            ffgraph::command::reset_title,
            ffgraph::command::read_graph,
            ffgraph::command::save_graph,
        ])
        .events(collect_events![
            ErrorMessage,
            NewGraph,
            OpenGraph,
            SaveGraph,
            SaveAsGraph,
            CloseGraph
        ]);

    // Export typescript output from specta during debug build
    #[cfg(debug_assertions)]
    {
        let formatter = |file: &Path| -> std::io::Result<()> {
            Command::new("pnpm")
                .arg("fmt")
                .arg("--write")
                .arg(file)
                .output()
                .map(|_| ())
                .map_err(|error| std::io::Error::new(std::io::ErrorKind::Other, error))
        };
        specta_builder.export(
            specta_typescript::Typescript::default()
                .remove_default_header()
                .formatter(formatter),
            "./app/gen/tauri.ts",
        )?;
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(specta_builder.invoke_handler())
        .setup(move |app| {
            specta_builder.mount_events(app);
            let handle = app.handle();
            // set a menu for application
            let menu = create_menu(handle)?;
            app.set_menu(menu)?;

            // manage application state
            app.manage(ApplicationState::default());
            Ok(())
        })
        .on_menu_event(|app, menu_event| {
            // when custom menu item is clicked handle error if event raise error
            if let Err(err) = handle_menu_event(app, &menu_event) {
                ErrorMessage(err).emit(app).ok();
            }
        })
        .run(tauri::generate_context!())?;
    Ok(())
}
