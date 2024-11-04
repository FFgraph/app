use tauri::menu::{
    Menu, MenuBuilder, MenuEvent, MenuItem, PredefinedMenuItem, Submenu, SubmenuBuilder,
};
use tauri::{AppHandle, Emitter, Wry};

use crate::error::Error;

/// Create app sub menu
///
/// # Errors
/// If app submenu is not created properly
fn create_app_sub_menu(handle: &AppHandle) -> Result<Submenu<Wry>, Error> {
    let about_item = PredefinedMenuItem::about(handle, Some("About FFgraph"), None)?;
    let mut app_sub_menu_builder = SubmenuBuilder::new(handle, "FFgraph").item(&about_item);

    // do not add hide and hide others to linux
    #[cfg(not(target_os = "linux"))]
    {
        let hide_item = PredefinedMenuItem::hide(handle, Some("Hide FFgraph"))?;
        let hide_others_item = PredefinedMenuItem::hide_others(handle, Some("Hide Others"))?;
        app_sub_menu_builder = app_sub_menu_builder
            .separator()
            .item(&hide_item)
            .item(&hide_others_item);
    }

    // only add show others for macos
    #[cfg(target_os = "macos")]
    {
        let show_all_item = PredefinedMenuItem::show_all(handle, None)?;
        app_sub_menu_builder = app_sub_menu_builder.item(&show_all_item);
    }

    // do not add quit to linux since quit is not supported in linux
    #[cfg(not(target_os = "linux"))]
    {
        let quit_item = PredefinedMenuItem::quit(handle, Some("Quit FFgraph"))?;
        app_sub_menu_builder = app_sub_menu_builder.separator().item(&quit_item);
    }

    Ok(app_sub_menu_builder.build()?)
}

/// Create file sub menu
///
/// # Errors
/// If file submenu is not created properly
fn create_file_sub_menu(handle: &AppHandle) -> Result<Submenu<Wry>, Error> {
    let open_file_menu_item = MenuItem::with_id(
        handle,
        "open-file",
        "Open file...",
        true,
        Some("CmdOrCtrl+O"),
    )?;
    let save_graph_menu_item =
        MenuItem::with_id(handle, "save-graph", "Save", true, Some("CmdOrCtrl+S"))?;
    let save_as_graph_menu_item = MenuItem::with_id(
        handle,
        "save-as-graph",
        "Save As...",
        true,
        Some("Shift+CmdOrCtrl+S"),
    )?;
    let file_sub_menu_builder = SubmenuBuilder::new(handle, "File")
        .item(&open_file_menu_item)
        .item(&save_graph_menu_item)
        .item(&save_as_graph_menu_item);

    Ok(file_sub_menu_builder.build()?)
}

/// Create menu with provided app handle
///
/// # Errors
/// If menu creation fails
pub fn create_menu(handle: &AppHandle) -> Result<Menu<Wry>, Error> {
    let app_sub_menu = create_app_sub_menu(handle)?;
    let file_sub_menu = create_file_sub_menu(handle)?;
    let menu = MenuBuilder::new(handle)
        .item(&app_sub_menu)
        .item(&file_sub_menu)
        .build()?;
    Ok(menu)
}

/// Handle menu event
///
/// # Errors
/// If menu event are not handled properly
pub fn handle_menu_event(app: &AppHandle, event: &MenuEvent) -> Result<(), Error> {
    match event.id.as_ref() {
        "open-file" => app.emit("open-file", ())?,
        "save-graph" => app.emit("save-graph", ())?,
        "save-as-graph" => app.emit("save-as-graph", ())?,
        _ => {}
    };
    Ok(())
}
