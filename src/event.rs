use serde::Serialize;
use specta::Type;
use tauri_specta::Event;

use crate::error::Error;

/// Event to sent a error message
#[derive(Serialize, Clone, Type, Event)]
pub struct ErrorMessage(pub Error);

/// Event for new graph
#[derive(Serialize, Clone, Type, Event)]
pub struct NewGraph;

/// Event for open graph
#[derive(Serialize, Clone, Type, Event)]
pub struct OpenGraph;

/// Event for save graph
#[derive(Serialize, Clone, Type, Event)]
pub struct SaveGraph;

/// Event for save as graph
#[derive(Serialize, Clone, Type, Event)]
pub struct SaveAsGraph;
