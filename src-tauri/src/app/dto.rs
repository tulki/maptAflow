use serde::{Deserialize, Serialize};

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
pub struct CreateNodeInput {
    pub title: String,
    pub description: Option<String>,
    pub x: f64,
    pub y: f64,
    pub parent_id: Option<String>,
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