import { pool } from "../db/pool.ts";
import type { Match } from "../types/db.ts";

/**
 * @constant {string[]} ALLOWED_MATCH_COLUMNS - An array of allowed column names for the matches table to avoid SQL Injection.
 */
const ALLOWED_MATCH_COLUMNS = [
  "match_id",
  "match_date",
  "stadium",
  "city",
  "tournament_stage"
];

export type GetMatchesOptions = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export type PaginatedMatches = {
  data: Match[];
  total: number;
}

/**
 * @function getAll
 * @description Obtains matches with support for dynamic sorting, search filtering, and pagination.
 *              If no options are provided, it returns a flat array (dropdowns).
 * @param {GetMatchesOptions} [options] - Pagination, search, and sorting rules
 * @returns {Promise<Match[] | PaginatedMatches>} - Array of matches or Paginated structure
 */
export async function getAll(options?: GetMatchesOptions): Promise<Match[] | PaginatedMatches> {
  const page = options?.page ? parseInt(options.page as any, 10) : null;
  const limit = options?.limit ? parseInt(options.limit as any, 10) : null;
  const search = options?.search ? options.search.trim() : "";
  const sortBy = options?.sortBy || "match_date";
  const sortOrder = options?.sortOrder === "ASC" ? "ASC" : "DESC"; // Default de partidos: más antiguos a más recientes

  // Validar columna de ordenado contra la lista blanca para evitar SQL Injection
  const validatedSortBy = ALLOWED_MATCH_COLUMNS.includes(sortBy) ? sortBy : "match_date";

  let query = `
    SELECT *, COUNT(*) OVER() as total_count
    FROM matches
  `;
  
  const values: any[] = [];

  if (search) {
    query += ` WHERE stadium ILIKE $1 OR city ILIKE $1 OR tournament_stage ILIKE $1 `;
    values.push(`%${search}%`);
  }

  query += ` ORDER BY ${validatedSortBy} ${sortOrder} `;

  if (limit && page) {
    const offset = (page - 1) * limit;
    const limitPlaceholder = `$${values.length + 1}`;
    const offsetPlaceholder = `$${values.length + 2}`;
    
    query += ` LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder} `;
    values.push(limit, offset);
  }

  const { rows } = await pool.query(query, values);

  if (!limit || !page) {
    return rows.map(({ total_count, ...match }) => match as Match);
  }

  const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
  const data = rows.map(({ total_count, ...match }) => match as Match);

  return { data, total };
}

/**
 * @function getById
 * @param id - The unique identifier of the match to retrieve.
 * @description Obtains a specific match from the database based on its unique identifier.
 * @returns {Promise<Match | null>} A promise that resolves to a Match object if found, or null if no match exists with the given ID.
 */
export async function getById(id: string): Promise<Match | null> {
  const query = "SELECT * FROM matches WHERE match_id = $1";
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

/**
 * @function create
 * @description Creates a new match in the database, ensuring that only allowed columns are inserted to prevent SQL injection.
 * @param data - An object containing the match data to be inserted. Only properties that are included in ALLOWED_MATCH_COLUMNS will be considered.
 * @returns {Promise<Match>} A promise that resolves to the newly created Match object.
 */
export async function create(data: Partial<Match>): Promise<Match> {
  const safeData: Record<string, any> = {};

  for (const key of Object.keys(data)) {
    if (ALLOWED_MATCH_COLUMNS.includes(key)) {
      safeData[key] = data[key as keyof typeof data];
    }
  }

  const keys = Object.keys(safeData);
  if (keys.length === 0) {
    throw new Error("No valid fields provided for insertion");
  }

  const values = Object.values(safeData);
  const columns = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

  const query = `INSERT INTO matches (${columns}) VALUES (${placeholders}) RETURNING *`;
  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * @function update
 * @description Updates an existing match in the database, ensuring that only allowed columns are updated and that the match_id remains immutable.
 * @param id - The unique identifier of the match to update.
 * @param data - An object containing the match data to be updated. Only properties that are included in ALLOWED_MATCH_COLUMNS will be considered, and match_id will be ignored.
 * @returns {Promise<Match | null>} A promise that resolves to the updated Match object if the update was successful, or null if no match exists with the given ID.
 */
export async function update(id: string, data: Partial<Match>): Promise<Match | null> {
  const { match_id, ...updateData } = data;
  const safeData: Record<string, any> = {};

  for (const key of Object.keys(updateData)) {
    if (ALLOWED_MATCH_COLUMNS.includes(key)) {
      safeData[key] = updateData[key as keyof typeof updateData];
    }
  }

  const keys = Object.keys(safeData);
  if (keys.length === 0) return null;

  const values = Object.values(safeData);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

  const query = `UPDATE matches SET ${setClause} WHERE match_id = $${keys.length + 1} RETURNING *`;
  const { rows } = await pool.query(query, [...values, id]);
  return rows[0] || null;
}

/**
 * @function remove
 * @description Removes a match from the database. If the `force` parameter is set to true, it will first delete all associated performances before deleting the match. If `force` is false, it will attempt to delete the match directly, which will fail if there are associated performances due to foreign key constraints.
 * @param id - The unique identifier of the match to remove.
 * @param force - A boolean indicating whether to forcefully remove the match along with its associated performances. Defaults to false.
 * @returns {Promise<boolean>} A promise that resolves to true if the match was successfully removed, or false if no match exists with the given ID.
 */
export async function remove(id: string, force: boolean = false): Promise<boolean> {
  if (force) {
    // SQL transaction to ensure that both deletions happen atomically
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete associated performances first to avoid foreign key constraint violations
      await client.query('DELETE FROM performances WHERE match_id = $1', [id]);
      
      // Delete the match itself
      const result = await client.query('DELETE FROM matches WHERE match_id = $1 RETURNING *', [id]);
      
      await client.query('COMMIT');
      return result.rows.length > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } else {
    // Trying to delete the match directly without removing associated performances
    const query = "DELETE FROM matches WHERE match_id = $1 RETURNING *";
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  }
}