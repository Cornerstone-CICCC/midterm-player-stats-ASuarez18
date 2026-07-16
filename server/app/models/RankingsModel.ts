import { pool } from "../db/pool.ts";
import type { RankingRow } from "../types/db.ts";

/**
 * @function getLeaderboard
 * @description Obtains the top 10 players from the database based on the specified sorting criteria (goals, assists, or rating).
 * @param sortBy - The criteria to sort the leaderboard by. It can be "goals", "assists", or "rating".
 * @returns A promise that resolves to an array of RankingRow objects, each representing a player's ranking information.
 */
export async function getLeaderboard(
  sortBy: "goals" | "assists" | "rating",
): Promise<RankingRow[]> {
  // Mapping the sortBy parameter to the corresponding SQL ORDER BY clause
  let orderByClause = "SUM(p.goals) DESC";
  if (sortBy === "assists") {
    orderByClause = "SUM(p.assists) DESC";
  } else if (sortBy === "rating") {
    orderByClause = "AVG(p.player_rating) DESC";
  }

  const query = `
    SELECT 
      pl.player_name,
      pl.team,
      COUNT(p.match_id)::int AS matches_played,
      SUM(p.goals)::int AS total_goals,
      SUM(p.assists)::int AS total_assists,
      ROUND(AVG(p.player_rating), 2)::float AS avg_rating
    FROM performances p
    INNER JOIN players pl ON p.player_id = pl.player_id
    GROUP BY pl.player_id, pl.player_name, pl.team
    ORDER BY ${orderByClause}
    LIMIT 10
  `;

  const { rows } = await pool.query(query);

  // Adding rank to each row based on the order returned by the query
  return rows.map((row, index) => ({
    rank: index + 1,
    ...row,
  }));
}
