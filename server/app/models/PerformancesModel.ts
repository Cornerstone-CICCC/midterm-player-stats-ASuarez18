import { pool } from "../db/pool.ts";
import type { Performance } from "../types/db.ts";

export interface PaginatedPerformances {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

/**
 * @function getAllPaginated
 * @description Obtains all performances with pagination, optional search, and sorting.
 * @param params - An object containing pagination, search, and sorting parameters.
 * @param params.page - The page number for pagination (1-based index).
 * @param params.limit - The number of records to return per page.
 * @param params.search - Optional search term to filter performances by player name.
 * @param params.sortBy - Optional field to sort by (e.g., 'goals', 'assists', 'player_rating').
 * @param params.sortOrder - Optional sort order ('ASC' or 'DESC'). Default is 'DESC'.
 * @returns {Promise<PaginatedPerformances>} - An object containing the paginated performances, total count, current page, and limit.
 */
export async function getAllPaginated(params: {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<PaginatedPerformances> {
  const { page, limit, search, sortBy, sortOrder = "DESC" } = params;
  const offset = (page - 1) * limit;

  // Column names allowed for sorting must match the database column names or aliases used in the SELECT statement
  const allowedSortFields: Record<string, string> = {
    player_name: "pl.player_name",
    team: "pl.team",
    opponent_team: "p.opponent_team",
    match_date: "m.match_date",
    position: "pl.position",
    minutes_played: "p.minutes_played",
    goals: "p.goals",
    assists: "p.assists",
    shots: "p.shots",
    pass_accuracy: "p.pass_accuracy",
    player_rating: "p.player_rating",
  };

  const sortColumn = allowedSortFields[sortBy || ""] || "m.match_date";

  // Dynamic parameterized query construction for filters
  let whereClauses: string[] = [];
  let values: any[] = [];
  let paramIndex = 1;

  if (search) {
    whereClauses.push(`pl.player_name ILIKE $${paramIndex}`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereSQL =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // 1. Obtain total count for client-side pagination
  const countQuery = `
    SELECT COUNT(*) 
    FROM performances p
    INNER JOIN players pl ON p.player_id = pl.player_id
    INNER JOIN matches m ON p.match_id = m.match_id
    ${whereSQL}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count, 10);

  // 2. Obtain the actual data with pagination
  const dataQuery = `
    SELECT 
      p.id,
      p.player_id,
      p.match_id,
      pl.player_name,
      pl.jersey_number,
      pl.position,
      pl.team,
      p.opponent_team,
      m.match_date,
      p.minutes_played,
      p.goals,
      p.assists,
      p.shots,
      p.pass_accuracy,
      p.player_rating
    FROM performances p
    INNER JOIN players pl ON p.player_id = pl.player_id
    INNER JOIN matches m ON p.match_id = m.match_id
    ${whereSQL}
    ORDER BY ${sortColumn} ${sortOrder === "ASC" ? "ASC" : "DESC"}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const { rows } = await pool.query(dataQuery, [...values, limit, offset]);

  return {
    data: rows,
    total,
    page,
    limit,
  };
}

/**
 * @function getById
 * @description Obtains a performance by its ID, including related player and match details.
 * @param id - Id of the performance to retrieve
 * @returns {Promise<any | null>} - The performance object with related player and match details if found, otherwise null
 */
export async function getById(id: number): Promise<any | null> {
  const query = `
    SELECT 
      p.*,
      pl.player_name,
      pl.jersey_number,
      pl.position,
      pl.team,
      m.stadium,
      m.match_date,
      m.tournament_stage
    FROM performances p
    INNER JOIN players pl ON p.player_id = pl.player_id
    INNER JOIN matches m ON p.match_id = m.match_id
    WHERE p.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

/**
 * @function create
 * @description Creates a new performance in the database
 * @param data - An object containing the performance data to insert
 * @returns {Promise<Performance>} - The newly created performance object
 */
export async function create(data: Partial<Performance>): Promise<Performance> {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const columns = keys.join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

  const query = `INSERT INTO performances (${columns}) VALUES (${placeholders}) RETURNING *`;
  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * @function update
 * @description Updates an existing performance in the database by its ID
 * @param id - The ID of the performance to update
 * @param data - An object containing the performance data to update
 * @returns {Promise<Performance | null>} - The updated performance object if found and updated, otherwise null
 */
export async function update(
  id: number,
  data: Partial<Performance>,
): Promise<Performance | null> {
  const keys = Object.keys(data);
  if (keys.length === 0) return null;

  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const query = `UPDATE performances SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
  const { rows } = await pool.query(query, [...values, id]);
  return rows[0] || null;
}

/**
 * @function remove
 * @description Deletes a performance from the database by its ID
 * @param id - The ID of the performance to delete
 * @returns {Promise<boolean>} - True if the performance was deleted, otherwise false
 */
export async function remove(id: number): Promise<boolean> {
  const query = "DELETE FROM performances WHERE id = $1 RETURNING *";
  const { rows } = await pool.query(query, [id]);
  return rows.length > 0;
}
