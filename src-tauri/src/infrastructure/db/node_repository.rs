use crate::app::dto::NodeWithPosition;
use crate::app::errors::{AppError, AppResult};
use crate::domain::node::Node;
use rusqlite::{Connection, OptionalExtension, Row};

fn map_node(row: &Row<'_>) -> rusqlite::Result<Node> {
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
}

fn map_node_with_position(row: &Row<'_>) -> rusqlite::Result<NodeWithPosition> {
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
}

pub fn count_nodes(conn: &Connection) -> AppResult<i64> {
    let count = conn.query_row("SELECT COUNT(*) FROM nodes", [], |row| row.get(0))?;
    Ok(count)
}

pub fn list_nodes_with_positions(conn: &Connection) -> AppResult<Vec<NodeWithPosition>> {
    let mut stmt = conn.prepare(
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
    )?;

    let rows = stmt.query_map([], map_node_with_position)?;
    let nodes: Result<Vec<_>, _> = rows.collect();

    Ok(nodes?)
}

pub fn node_exists(conn: &Connection, node_id: &str) -> AppResult<bool> {
    let exists: i64 = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM nodes WHERE id = ?1)",
        [node_id],
        |row| row.get(0),
    )?;

    Ok(exists != 0)
}

pub fn get_node_by_id(conn: &Connection, node_id: &str) -> AppResult<Node> {
    let node = conn
        .query_row(
            "
            SELECT
                id,
                parent_id,
                title,
                description,
                status,
                sort_order,
                created_at,
                updated_at
            FROM nodes
            WHERE id = ?1
            ",
            [node_id],
            map_node,
        )
        .optional()?;

    node.ok_or_else(|| AppError::NotFound(format!("node not found: {}", node_id)))
}

pub fn insert_node(
    conn: &Connection,
    id: &str,
    parent_id: Option<&str>,
    title: &str,
    description: Option<&str>,
) -> AppResult<()> {
    conn.execute(
        "
        INSERT INTO nodes (
            id,
            parent_id,
            title,
            description,
            status,
            sort_order,
            created_at,
            updated_at
        )
        VALUES (?1, ?2, ?3, ?4, 'idle', 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ",
        (id, parent_id, title, description),
    )?;

    Ok(())
}

pub fn upsert_node_position(conn: &Connection, node_id: &str, x: f64, y: f64) -> AppResult<()> {
    conn.execute(
        "
        INSERT INTO node_positions (node_id, x, y, updated_at)
        VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)
        ON CONFLICT(node_id) DO UPDATE SET
            x = excluded.x,
            y = excluded.y,
            updated_at = CURRENT_TIMESTAMP
        ",
        (node_id, x, y),
    )?;

    Ok(())
}

pub fn update_node_parent(
    conn: &Connection,
    node_id: &str,
    parent_id: Option<&str>,
) -> AppResult<()> {
    conn.execute(
        "
        UPDATE nodes
        SET parent_id = ?2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?1
        ",
        (node_id, parent_id),
    )?;

    Ok(())
}

pub fn touch_node_updated_at(conn: &Connection, node_id: &str) -> AppResult<()> {
    conn.execute(
        "
        UPDATE nodes
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?1
        ",
        [node_id],
    )?;

    Ok(())
}