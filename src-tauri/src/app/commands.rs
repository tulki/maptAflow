use crate::app::dto::{
    CreateNodeInput,
    NodeWithPosition,
    SetNodeParentInput,
    UpdateNodePositionInput,
};
use crate::app::services::node_service;
use crate::app::state::AppState;
use crate::domain::node::Node;
use tauri::State;

#[tauri::command]
pub fn count_nodes(state: State<'_, AppState>) -> Result<i64, String> {
    node_service::count_nodes(state.inner()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_nodes_with_positions(
    state: State<'_, AppState>,
) -> Result<Vec<NodeWithPosition>, String> {
    node_service::list_nodes_with_positions(state.inner()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_node(
    state: State<'_, AppState>,
    input: CreateNodeInput,
) -> Result<Node, String> {
    node_service::create_node(state.inner(), input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_node_parent(
    state: State<'_, AppState>,
    input: SetNodeParentInput,
) -> Result<(), String> {
    node_service::set_node_parent(state.inner(), input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_node_position(
    state: State<'_, AppState>,
    input: UpdateNodePositionInput,
) -> Result<(), String> {
    node_service::update_node_position(state.inner(), input).map_err(|e| e.to_string())
}