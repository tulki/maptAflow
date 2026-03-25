use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum AppError {
    Database(String),
    NotFound(String),
    Validation(String),
}

impl Display for AppError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Database(message) => write!(f, "Database error: {message}"),
            AppError::NotFound(message) => write!(f, "Not found: {message}"),
            AppError::Validation(message) => write!(f, "Validation error: {message}"),
        }
    }
}

impl std::error::Error for AppError {}