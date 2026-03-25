use rusqlite::{Connection, Result};

const SCHEMA_SQL: &str = include_str!("../../db/schema.sql");

pub fn open_database(path: &str) -> Result<Connection> {
    let conn = Connection::open(path)?;
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;
    conn.execute_batch(SCHEMA_SQL)?;
    Ok(conn)
}