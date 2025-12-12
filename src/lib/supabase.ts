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
