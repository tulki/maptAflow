WITH RECURSIVE ancestors(id) AS (
    SELECT ?2
    UNION
    SELECT n.parent_id
    FROM nodes n
    JOIN ancestors a ON n.id = a.id
    WHERE n.parent_id IS NOT NULL
)
SELECT EXISTS(SELECT 1 FROM ancestors WHERE id = ?1)
