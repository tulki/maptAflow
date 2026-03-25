use crate::app::dto::{
    CreateNodeInput,
    NodeWithPosition,
    SetNodeParentInput,
    UpdateNodePositionInput,
};
use crate::app::errors::{AppError, AppResult};
use crate::app::state::AppState;
use crate::domain::node::Node;
use crate::infrastructure::db::node_repository;
use rusqlite::Connection;
use std::sync::MutexGuard;
use uuid::Uuid;

fn lock_connection(state: &AppState) -> AppResult<MutexGuard<'_, Connection>> {
    state
        .conn
        .lock()
        .map_err(|_| AppError::Database("failed to lock database connection".to_string()))
}

fn ensure_node_exists(conn: &Connection, node_id: &str, error: AppError) -> AppResult<()> {
    if node_repository::node_exists(conn, node_id)? {
        Ok(())
    } else {
        Err(error)
    }
}

pub fn count_nodes(state: &AppState) -> AppResult<i64> {
    let conn = lock_connection(state)?;
    node_repository::count_nodes(&conn)
}

pub fn list_nodes_with_positions(state: &AppState) -> AppResult<Vec<NodeWithPosition>> {
    let conn = lock_connection(state)?;
    node_repository::list_nodes_with_positions(&conn)
}

pub fn create_node(state: &AppState, input: CreateNodeInput) -> AppResult<Node> {
    let CreateNodeInput {
        title,
        description,
        x,
        y,
        parent_id,
    } = input;

    let conn = lock_connection(state)?;

    if let Some(parent_id_value) = parent_id.as_deref() {
        ensure_node_exists(
            &conn,
            parent_id_value,
            AppError::NotFound(format!("parent node not found: {}", parent_id_value)),
        )?;
    }

    let id = Uuid::new_v4().to_string();

    node_repository::insert_node(
        &conn,
        &id,
        parent_id.as_deref(),
        &title,
        description.as_deref(),
    )?;

    node_repository::upsert_node_position(&conn, &id, x, y)?;

    node_repository::get_node_by_id(&conn, &id)
}

pub fn set_node_parent(state: &AppState, input: SetNodeParentInput) -> AppResult<()> {
    let SetNodeParentInput { node_id, parent_id } = input;

    if parent_id.as_deref() == Some(node_id.as_str()) {
        return Err(AppError::Validation(
            "node cannot be parent of itself".to_string(),
        ));
    }

    let conn = lock_connection(state)?;

    ensure_node_exists(
        &conn,
        &node_id,
        AppError::NotFound(format!("node not found: {}", node_id)),
    )?;

    if let Some(parent_id_value) = parent_id.as_deref() {
        ensure_node_exists(
            &conn,
            parent_id_value,
            AppError::NotFound(format!("parent node not found: {}", parent_id_value)),
        )?;
    }

    node_repository::update_node_parent(&conn, &node_id, parent_id.as_deref())
}

pub fn update_node_position(
    state: &AppState,
    input: UpdateNodePositionInput,
) -> AppResult<()> {
    let UpdateNodePositionInput { node_id, x, y } = input;

    let conn = lock_connection(state)?;

    ensure_node_exists(
        &conn,
        &node_id,
        AppError::NotFound(format!("node not found: {}", node_id)),
    )?;

    node_repository::upsert_node_position(&conn, &node_id, x, y)?;
    node_repository::touch_node_updated_at(&conn, &node_id)?;

    Ok(())
}