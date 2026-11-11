// BIGINT драйверы возвращают строкой или BigInt — приводим к числу, иначе JSON не соберётся.
function toUser(row) {
  return {
    id: Number(row.id),
    github_id: Number(row.github_id),
    login: row.login,
    avatar_url: row.avatar_url,
    created_at: new Date(row.created_at).toISOString(),
  };
}

const COLUMNS = 'id, github_id, login, avatar_url, created_at';

/** Создаёт пользователя при первом входе, при следующих — обновляет логин и аватар. */
export async function upsertUser(db, { githubId, login, avatarUrl }) {
  const { rows } = await db.query(
    `INSERT INTO users (github_id, login, avatar_url)
     VALUES ($1, $2, $3)
     ON CONFLICT (github_id) DO UPDATE
       SET login = EXCLUDED.login, avatar_url = EXCLUDED.avatar_url
     RETURNING ${COLUMNS}`,
    [githubId, login, avatarUrl ?? null],
  );
  return toUser(rows[0]);
}

export async function findUserById(db, id) {
  const { rows } = await db.query(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] ? toUser(rows[0]) : null;
}
