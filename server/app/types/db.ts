export type Player = {
  player_id: string;
  player_name: string;
  age?: number;
  nationality?: string;
  team?: string;
  jersey_number?: number;
  position?: string;
  height_cm?: number;
  weight_kg?: number;
  preferred_foot?: string;
  club_name?: string;
  market_value_eur?: string | number; // BIGINT can be like string
  total_goals_tournament?: number;
  total_assists_tournament?: number;
  total_minutes_tournament?: number;
  player_of_match_awards?: number;
  tournament_rating?: string | number;
}

export type Match = {
  match_id: string;
  match_date?: string; // Date can be ISO in JSON
  stadium?: string;
  city?: string;
  tournament_stage?: string;
}

export type Performance = {
  id: number;
  player_id: string;
  match_id: string;
  opponent_team?: string;
  match_result?: string;
  goals_team?: number;
  goals_opponent?: number;
  minutes_played?: number;
  goals?: number;
  assists?: number;
  shots?: number;
  shots_on_target?: number;
  expected_goals_xg?: string | number;
  expected_assists_xa?: string | number;
  key_passes?: number;
  successful_passes?: number;
  total_passes?: number;
  pass_accuracy?: string | number;
  dribbles_attempted?: number;
  successful_dribbles?: number;
  crosses?: number;
  successful_crosses?: number;
  tackles?: number;
  interceptions?: number;
  clearances?: number;
  blocks?: number;
  aerial_duels_won?: number;
  aerial_duels_lost?: number;
  recoveries?: number;
  defensive_actions?: number;
  fouls_committed?: number;
  fouls_suffered?: number;
  yellow_cards?: number;
  red_cards?: number;
  offsides?: number;
  saves?: number;
  save_percentage?: string | number;
  punches?: number;
  clean_sheet?: number;
  goals_conceded?: number;
  penalty_saves?: number;
  distance_covered_km?: string | number;
  sprint_distance_km?: string | number;
  top_speed_kmh?: string | number;
  accelerations?: number;
  decelerations?: number;
  stamina_score?: string | number;
  player_rating?: string | number;
  performance_score?: string | number;
  offensive_contribution?: string | number;
  defensive_contribution?: string | number;
  possession_impact?: string | number;
  pressure_resistance?: string | number;
  creativity_score?: string | number;
  consistency_score?: string | number;
  clutch_performance_score?: string | number;
}

export type RankingRow = {
  rank?: number;
  player_name: string;
  team: string;
  matches_played: number;
  total_goals: number;
  total_assists: number;
  avg_rating: number;
}