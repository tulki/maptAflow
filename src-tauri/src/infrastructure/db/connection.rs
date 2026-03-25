use rusqlite::{Connection, Result};

pub fn open_database(path: &str) -> Result<Connection> {
    Connection::open(path)
}