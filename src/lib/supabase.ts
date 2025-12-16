import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos baseados no schema do banco
export interface Profile {
  id: string;
  name: string;
  role: 'jogador' | 'admin' | 'presidente';
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  logo?: string;
  description?: string;
  president?: string;
  phone?: string;
  category?: 'Juvenil' | 'Adulto' | 'Veterano 35+' | 'Master 45+';
  team_type?: 'Campo' | 'Society' | 'Futsal';
  has_venue?: boolean;
  available_for_match?: boolean;
  wins?: number;
  draws?: number;
  losses?: number;
  goals_for?: number;
  goals_against?: number;
}

export interface TeamPlayer {
  id: string;
  team_id: string;
  player_id: string;
  joined_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  position: string;
  number: number;
  available: boolean;
  age?: number;
  foto?: string;
  phone?: string;
  preferred_foot?: 'Direito' | 'Esquerdo' | 'Ambos';
  secondary_position?: string;
  is_captain?: boolean;
  is_free_kick_taker?: boolean;
  is_guest?: boolean;
  goals: number;
  assists: number;
  matches: number;
  created_at: string;
}

export interface Game {
  id: string;
  team1_id: string;
  team2_id: string;
  date: string;
  location: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface Invitation {
  id: string;
  game_id: string;
  invited_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: string | null;
  created_at: string;
  updated_at: string;
}

export interface FieldPlayer {
  id: string;
  playerId: string | null;
  name: string;
  number: number;
  x: number;
  y: number;
}

export interface Tactic {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  formation: string;
  layout_json: {
    players: FieldPlayer[];
  };
  created_at: string;
  updated_at: string;
}

export interface PhotoFolder {
  id: string;
  team_id: string;
  name: string;
  created_at: string;
}

export interface TeamPhoto {
  id: string;
  team_id: string;
  folder_id?: string;
  url: string;
  title?: string;
  description?: string;
  photo_date?: string;
  created_at: string;
}

export interface VideoFolder {
  id: string;
  team_id: string;
  nome: string;
  created_at: string;
}

export interface VideoTutorial {
  id: string;
  team_id: string;
  folder_id?: string | null;
  titulo: string;
  descricao?: string | null;
  url_embed: string;
  categoria: string;
  duracao?: string | null;
  created_at?: string;
}

// Interfaces para Agenda
export interface Match {
  id: string;
  team_id: string;
  home_team_id?: string | null;
  home_team_name: string;
  away_team_id?: string | null;
  away_team_name: string;
  match_date: string;
  match_time: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'pending' | 'completed';
  score_home?: number | null;
  score_away?: number | null;
  highlight_player_name?: string | null;
  highlight_player_photo?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MatchMessage {
  id: string;
  match_id: string;
  sender_team_id?: string | null;
  sender_name: string;
  message: string;
  created_at?: string;
}

export interface TeamAvailableDate {
  id: string;
  team_id: string;
  available_date: string;
  created_at?: string;
}

export interface TeamAgendaSettings {
  id: string;
  team_id: string;
  observation?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MatchInvite {
  id: string;
  from_team_id: string;
  from_team_name: string;
  to_team_id: string;
  to_team_name: string;
  proposed_date: string;
  proposed_time: string;
  proposed_location?: string | null;
  message?: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at?: string;
  updated_at?: string;
  // Campos expandidos (join)
  from_team?: Team;
  to_team?: Team;
}

export interface InviteMessage {
  id: string;
  invite_id: string;
  sender_team_id: string;
  sender_name: string;
  message: string;
  read_at?: string | null;
  created_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  display_name: string;
  dark_mode: boolean;
  notifications: boolean;
  view_mode: 'owner' | 'player';
  settings_created_at?: string;
  settings_updated_at?: string;
}

// Partidas Internas
export interface InternalMatch {
  id: string;
  team_id: string;
  match_date: string;
  match_time?: string | null;
  location?: string | null;
  description?: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface InternalMatchTeam {
  id: string;
  internal_match_id: string;
  team_name: string;
  team_color?: string | null;
  created_at?: string;
  // Expandido
  players?: InternalMatchTeamPlayer[];
}

export interface InternalMatchTeamPlayer {
  id: string;
  internal_match_team_id: string;
  player_id: string;
  created_at?: string;
  // Expandido
  player?: Player;
}

export interface InternalMatchStats {
  id: string;
  internal_match_id: string;
  player_id: string;
  goals: number;
  assists: number;
  created_at?: string;
  // Expandido
  player?: Player;
}
