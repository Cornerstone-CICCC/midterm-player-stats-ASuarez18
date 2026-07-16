import { pool } from "../db/pool.ts";
import type { Player } from "../types/db.ts";

/**
 * @constant {string[]} ALLOWED_PLAYER_COLUMNS
 * @description List of allowed columns for player operations to prevent SQL injection.
 * @readonly
 * @type {string[]}
 */
const ALLOWED_PLAYER_COLUMNS = [
  "player_id",
  "player_name",
  "age",
  "nationality",
  "team",
  "jersey_number",
  "position",
  "height_cm",
  "weight_kg",
  "preferred_foot",
  "club_name",
  "market_value_eur",
  "total_goals_tournament",
  "total_assists_tournament",
  "total_minutes_tournament",
  "player_of_match_awards",
  "tournament_rating",
];

/**
 * @function getAll
 * @description Obtains all players ordered by name (useful for dropdowns)
 * @returns {Promise<Player[]>} - An array of player objects
 */
export async function getAll(): Promise<Player[]> {
  const query = `
    SELECT player_id, player_name, team, position, jersey_number 
    FROM players 
    ORDER BY player_name ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
}

/**
 * @function getById
 * @description Obtains a player by their ID
 * @param id - The ID of the player to retrieve
 * @returns {Promise<Player | null>} - The player object if found, otherwise null
 */
export async function getById(id: string): Promise<Player | null> {
  const query = "SELECT * FROM players WHERE player_id = $1";
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

/**
 * @function create
 * @description Creates a new player in the database
 * @param data - An object containing the player data to insert
 * @returns {Promise<Player>} - The newly created player object
 */
export async function create(data: Partial<Player>): Promise<Player> {
  // Filter the input data to only include allowed columns to prevent SQL injection
  const safeData = Object.keys(data)
    .filter((key) => ALLOWED_PLAYER_COLUMNS.includes(key))
    .reduce(
      (obj, key) => {
        obj[key] = data[key as keyof Player];
        return obj;
      },
      {} as Record<string, any>,
    );

  const keys = Object.keys(safeData);
  if (keys.length === 0) {
    throw new Error("No valid fields provided for insertion");
  }

  const values = Object.values(safeData);
  const columns = keys.join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

  const query = `INSERT INTO players (${columns}) VALUES (${placeholders}) RETURNING *`;
  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * @function update
 * @description Updates an existing player in the database by their ID, ensuring that only allowed fields are updated and that the player_id remains unchanged.
 * @param id - The ID of the player to update
 * @param data - An object containing the player data to update
 * @returns {Promise<Player | null>} - The updated player object if found and updated, otherwise null
 */
export async function update(
  id: string,
  data: Partial<Player>,
): Promise<Player | null> {
  const { player_id, ...updateData } = data;
  const safeData: Record<string, any> = {};

  for (const key of Object.keys(updateData)) {
    if (ALLOWED_PLAYER_COLUMNS.includes(key)) {
      safeData[key] = updateData[key as keyof typeof updateData];
    }
  }

  const keys = Object.keys(safeData);
  if (keys.length === 0) return null;

  const values = Object.values(safeData);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const query = `UPDATE players SET ${setClause} WHERE player_id = $${keys.length + 1} RETURNING *`;
  const { rows } = await pool.query(query, [...values, id]);
  return rows[0] || null;
}

// 5. REMOVE - Eliminar jugador manejando la restricción de integridad de performances
/**
 * @function remove
 * @description Deletes a player from the database by their ID. If the player has associated performances, it will either throw an error or delete the performances first based on the `force` parameter.
 * @param id - The ID of the player to delete
 * @param force - A boolean indicating whether to force deletion by first removing associated performances. Default is false.
 * @returns {Promise<boolean>} - True if the player was deleted, otherwise false
 */
export async function remove(
  id: string,
  force: boolean = false,
): Promise<boolean> {
  if (force) {
    // Transaction SQL to delete dependencies before deleting the player
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Delete associated performances first
      await client.query("DELETE FROM performances WHERE player_id = $1", [id]);

      // Delete Player
      const result = await client.query(
        "DELETE FROM players WHERE player_id = $1 RETURNING *",
        [id],
      );

      await client.query("COMMIT");
      return result.rows.length > 0;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } else {
    // Direct try. If the player has performances, PostgreSQL will throw error 23503
    const query = "DELETE FROM players WHERE player_id = $1 RETURNING *";
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  }
}
