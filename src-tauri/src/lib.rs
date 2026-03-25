pub mod app;
pub mod domain;
pub mod infrastructure;

use crate::app::commands::{
    count_nodes,
    create_root_node,
    list_nodes_with_positions,
    list_root_nodes,
    list_root_nodes_with_positions,
    set_node_parent,
    update_node_position,
};
use crate::app::state::AppState;
use crate::infrastructure::db::connection::open_database;
use std::sync::Mutex;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let conn = open_database("maptaflow.db").expect("failed to initialize database");

    tauri::Builder::default()
        .manage(AppState {
            conn: Mutex::new(conn),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            count_nodes,
            create_root_node,
            list_root_nodes,
            list_root_nodes_with_positions,
            list_nodes_with_positions,
            set_node_parent,
            update_node_position
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}