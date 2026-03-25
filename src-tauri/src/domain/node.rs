#[derive(Debug, Clone)]
pub struct Node {
    pub id: i64,
    pub parent_id: Option<i64>,
    pub root_id: i64,
    pub title: String,
    pub content: Option<String>,
    pub depth: i32,
    pub is_done: bool,
    pub created_at: String,
}