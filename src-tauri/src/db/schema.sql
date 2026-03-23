CREATE TABLE IF NOT EXISTS workspace_meta (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    workspace_title TEXT NOT NULL,
    schema_version INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    parent_id TEXT,

    title TEXT NOT NULL,
    description TEXT,

    status TEXT NOT NULL DEFAULT 'idle',

    sort_order REAL NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    CHECK (id <> parent_id),

    FOREIGN KEY (parent_id) REFERENCES nodes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_nodes_parent_id
ON nodes(parent_id);

CREATE INDEX IF NOT EXISTS idx_nodes_parent_sort
ON nodes(parent_id, sort_order);


CREATE TABLE IF NOT EXISTS node_positions (
    node_id TEXT PRIMARY KEY,

    x REAL NOT NULL,
    y REAL NOT NULL,

    updated_at TEXT NOT NULL,

    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS node_metrics (
    node_id TEXT PRIMARY KEY,

    children_count INTEGER NOT NULL DEFAULT 0 CHECK (children_count >= 0),
    done_children_count INTEGER NOT NULL DEFAULT 0 CHECK (done_children_count >= 0),

    progress REAL NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 1),

    updated_at TEXT NOT NULL,

    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    CHECK (done_children_count <= children_count)
);


CREATE TABLE IF NOT EXISTS windows (
    id TEXT PRIMARY KEY,

    root_node_id TEXT NOT NULL,
    title TEXT,

    camera_x REAL NOT NULL DEFAULT 0,
    camera_y REAL NOT NULL DEFAULT 0,
    zoom REAL NOT NULL DEFAULT 1,

    sort_order REAL NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (root_node_id) REFERENCES nodes(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS window_node_state (
    window_id TEXT NOT NULL,
    node_id TEXT NOT NULL,

    is_collapsed INTEGER NOT NULL DEFAULT 0 CHECK (is_collapsed IN (0, 1)),

    updated_at TEXT NOT NULL,

    PRIMARY KEY (window_id, node_id),

    FOREIGN KEY (window_id) REFERENCES windows(id) ON DELETE CASCADE,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_window_node_state_window
ON window_node_state(window_id);

CREATE INDEX IF NOT EXISTS idx_window_node_state_node
ON window_node_state(node_id);