use crate::app::state::AppState;
use crate::domain::node::{CreateRootNodeInput, Node};
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize)]
pub struct NodeWithPosition {
    pub id: String,
    pub parent_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub sort_order: f64,
    pub created_at: String,
    pub updated_at: String,
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateNodePositionInput {
    pub node_id: String,
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SetNodeParentInput {
    pub node_id: String,
    pub parent_id: Option<String>,
}

#[tauri::command]
pub fn count_nodes(state: State<AppState>) -> Result<i64, String> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| "failed to lock database connection".to_string())?;

    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM nodes", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    Ok(count)
}

#[tauri::command]
pub fn list_root_nodes(state: State<AppState>) -> Result<Vec<Node>, String> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| "failed to lock database connection".to_string())?;

    let mut stmt = conn
        .prepare(
            "
            SELECT id, parent_id, title, description, status, sort_order, created_at, updated_at
            FROM nodes
            WHERE parent_id IS NULL
            ORDER BY sort_order ASC, created_at ASC
            ",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Node {
                id: row.get(0)?,
                parent_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                status: row.get(4)?,
                sort_order: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let nodes: Result<Vec<_>, _> = rows.collect();
    nodes.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_root_nodes_with_positions(
    state: State<AppState>,
) -> Result<Vec<NodeWithPosition>, String> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| "failed to lock database connection".to_string())?;

    let mut stmt = conn
        .prepare(
            "
            SELECT
                n.id,
                n.parent_id,
                n.title,
                n.description,
                n.status,
                n.sort_order,
                n.created_at,
                n.updated_at,
                COALESCE(p.x, 0.0) AS x,
                COALESCE(p.y, 0.0) AS y
            FROM nodes n
            LEFT JOIN node_positions p ON p.node_id = n.id
            WHERE n.parent_id IS NULL
            ORDER BY n.sort_order ASC, n.created_at ASC
            ",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(NodeWithPosition {
                id: row.get(0)?,
                parent_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                status: row.get(4)?,
                sort_order: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                x: row.get(8)?,
                y: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let nodes: Result<Vec<_>, _> = rows.collect();
    nodes.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_nodes_with_positions(
    state: State<AppState>,
) -> Result<Vec<NodeWithPosition>, String> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| "failed to lock database connection".to_string())?;

    let mut stmt = conn
        .prepare(
            "
            SELECT
                n.id,
                n.parent_id,
                n.title,
                n.description,
                n.status,
                n.sort_order,
                n.created_at,
                n.updated_at,
                COALESCE(p.x, 0.0) AS x,
                COALESCE(p.y, 0.0) AS y
            FROM nodes n
            LEFT JOIN node_positions p ON p.node_id = n.id
            ORDER BY n.sort_order ASC, n.created_at ASC
            ",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(NodeWithPosition {
                id: row.get(0)?,
                parent_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                status: row.get(4)?,
                sort_order: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                x: row.get(8)?,
                y: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let nodes: Result<Vec<_>, _> = rows.collect();
    nodes.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_root_node(
    state: State<AppState>,
    input: CreateRootNodeInput,
) -> Result<Node, String> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| "failed to lock database connection".to_string())?;

    let id = Uuid::new_v4().to_string();

    conn.execute(
        "
        INSERT INTO nodes (
            id, parent_id, title, description, status, sort_order, created_at, updated_at
        )
        VALUES (?1, NULL, ?2, ?3, 'idle', 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ",
        (&id, &input.title, &input.description),
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "
        INSERT INTO node_positions (node_id, x, y, updated_at)
        VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)
        ",
        (&id, input.x, input.y),
    )
    .map_err(|e| e.to_string())?;

    let node = conn
        .query_row(
            "
            SELECT id, parent_id, title, description, status, sort_order, created_at, updated_at
            FROM nodes
            WHERE id = ?1
            ",
            [&id],
            |row| {
                Ok(Node {
                    id: row.get(0)?,
                    parent_id: row.get(1)?,
                    title: row.get(2)?,
                    description: row.get(3)?,
                    status: row.get(4)?,
                    sort_order: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(node)
}

#[tauri::command]
pub fn set_node_parent(
    state: State<AppState>,
    input: SetNodeParentInput,
) -> Result<(), String> {
    if input.parent_id.as_ref() == Some(&input.node_id) {
        return Err("node cannot be parent of itself".to_string());
    }

    let conn = state
        .conn
        .lock()
        .map_err(|_| "failed to lock database connection".to_string())?;

    let exists: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM nodes WHERE id = ?1",
            [&input.node_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if exists == 0 {
        return Err(format!("node not found: {}", input.node_id));
    }

    if let Some(parent_id) = &input.parent_id {
        let parent_exists: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM nodes WHERE id = ?1",
                [parent_id],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        if parent_exists == 0 {
            return Err(format!("parent node not found: {}", parent_id));
        }
    }

    conn.execute(
        "
        UPDATE nodes
        SET parent_id = ?2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?1
        ",
        (&input.node_id, &input.parent_id),
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_node_position(
    state: State<AppState>,
    input: UpdateNodePositionInput,
) -> Result<(), String> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| "failed to lock database connection".to_string())?;

    let exists: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM nodes WHERE id = ?1",
            [&input.node_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if exists == 0 {
        return Err(format!("node not found: {}", input.node_id));
    }

    conn.execute(
        "
        INSERT INTO node_positions (node_id, x, y, updated_at)
        VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)
        ON CONFLICT(node_id) DO UPDATE SET
            x = excluded.x,
            y = excluded.y,
            updated_at = CURRENT_TIMESTAMP
        ",
        (&input.node_id, input.x, input.y),
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "
        UPDATE nodes
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?1
        ",
        [&input.node_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}