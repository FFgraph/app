use std::ffi::OsStr;

use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression;
use git2::Repository;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use specta::Type;
use tauri::ipc::Channel;
use tauri::{AppHandle, Manager, Window};
use tauri_specta::Event;
use tempfile::TempDir;
use walkdir::WalkDir;

use crate::channel::LoadOptionsEvent;
use crate::error::{Error, Message};
use crate::event::ErrorMessage;

/// Load options with provided version if provided version is not present load
/// with latest version and provide a identifier which should be used for future
/// request
///
/// # Errors
/// If options cannot be loaded for provided tag
#[expect(
    clippy::needless_pass_by_value,
    reason = "tauri doesn't support app handle or channel as passed by reference"
)]
#[tauri::command]
#[specta::specta]
pub fn load_options(
    app_handle: AppHandle,
    channel: Channel<LoadOptionsEvent>,
    revision_name: String,
) -> Result<(), Error> {
    // send started data through channel
    channel
        .send(LoadOptionsEvent::Started)
        .message("failed to send started data through channel")?;

    let mut database_folder = app_handle
        .path()
        .app_cache_dir()
        .message("failed to get app cache dir")?;
    database_folder.push("database");
    if !database_folder.exists() {
        std::fs::create_dir_all(&database_folder).message("failed to create database folder")?;
    }

    // if revision name file does exists do not clone since it will be based on
    // commit so file is already present
    if database_folder
        .join(format!("{revision_name}.sqlite3"))
        .exists()
    {
        // send a revision name through a channel
        channel
            .send(LoadOptionsEvent::Completed {
                identifier: revision_name,
            })
            .message("failed to send completed data through channel")?;
    } else {
        // create temp dir
        let tempdir = TempDir::new().message("failed to create temp dir")?;

        // clone a temp dir and checkout to required tag or branch to get object id of
        // revision name
        channel
            .send(LoadOptionsEvent::Cloning)
            .message("failed to send cloning data through channel")?;
        let repo = Repository::clone("https://github.com/ffgraph/data", &tempdir)
            .message("failed to clone data to temp directory")?;
        let obj = repo
            .revparse_single(&revision_name)
            .message("failed to get single object from revision string")?;
        let obj_id = obj.id();

        let database_file = database_folder.join(format!("{obj_id}.sqlite3"));

        // if data doesn't exists than load data else provide object id directly
        if !database_file.exists() {
            repo.set_head_detached(obj_id)
                .message(format!("failed to get head to {obj_id}"))?;
            repo.checkout_tree(&obj, None)
                .message(format!("failed to get head to {obj_id}"))?;

            // start loading data to a database
            channel
                .send(LoadOptionsEvent::Loading)
                .message("failed to send loading data through channel")?;

            let connection =
                Connection::open(database_file).message("failed to open connection to database")?;
            for entry in WalkDir::new(&tempdir).sort_by_file_name() {
                let entry = entry.message("failed to get dir entry")?;
                let entry_path = entry.path();
                if entry_path.extension().and_then(OsStr::to_str) == Some("sql") {
                    let sql =
                        std::fs::read_to_string(entry_path).message("failed to read sql file")?;
                    connection
                        .execute_batch(&sql)
                        .message("failed to execute sql")?;
                }
            }
        }

        // send a loaded data identifier through a channel
        channel
            .send(LoadOptionsEvent::Completed {
                identifier: obj.id().to_string(),
            })
            .message("failed to send completed data through channel")?;
    }
    Ok(())
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

/// Struct representing a data
#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Graph {
    identifier: String,
    graph: serde_json::Value,
}

/// Read graph from file and return serde json value
///
/// # Errors
/// If file cannot be read
#[tauri::command]
#[specta::specta]
pub fn read_graph(file_path: &str) -> Result<Graph, Error> {
    let file = std::fs::read(file_path).message(format!("failed to open path {file_path}"))?;
    let decoder = GzDecoder::new(file.as_slice());
    serde_json::from_reader(decoder).message("failed to create graph from file")
}

/// Save graph to provided path
///
/// # Errors
/// If file cannot be saved at provided path
#[expect(
    clippy::needless_pass_by_value,
    reason = "serde_json::Value reference doesn't implement serialize"
)]
#[tauri::command]
#[specta::specta]
pub fn save_graph(file_path: &str, graph: Graph) -> Result<(), Error> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
    serde_json::to_writer(&mut encoder, &graph).message("failed to write graph to encoder")?;
    let content = encoder.finish().message("failed to encode graph")?;
    std::fs::write(file_path, content)
        .message(format!("failed to save graph to file {file_path}"))?;
    Ok(())
}

/// Set title for window to provided file name
///
/// # Errors
/// if file name cannot be added to title
#[expect(
    clippy::needless_pass_by_value,
    reason = "tauri doesn't support app handle and window as passed by reference"
)]
#[tauri::command]
#[specta::specta]
pub fn add_file_name_to_title(
    app_handle: AppHandle,
    window: Window,
    file_name: Option<String>,
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
