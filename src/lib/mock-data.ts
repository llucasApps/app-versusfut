// Mock data para VersusFut

export interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  available: boolean;
  stats: {
    goals: number;
    assists: number;
    matches: number;
  };
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  description: string;
  players: Player[];
  stats: {
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  isMyTeam: boolean;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'pending' | 'completed';
  score?: {
    home: number;
    away: number;
  };
}

export interface Invite {
  id: string;
  from: string;
  to: string;
  matchId: string;
  status: 'pending' | 'accepted' | 'declined';
  date: string;
}

// Meus Times
export const myTeams: Team[] = [
  {
    id: '1',
    name: 'Real Bairro FC',
    logo: '⚽',
    description: 'Time do bairro, raiz desde 2015',
    isMyTeam: true,
    stats: {
      wins: 12,
      draws: 5,
      losses: 3,
      goalsFor: 45,
      goalsAgainst: 18,
    },
    players: [
      { id: 'p1', name: 'Carlos Silva', position: 'Goleiro', number: 1, available: true, stats: { goals: 0, assists: 0, matches: 20 } },
      { id: 'p2', name: 'João Pedro', position: 'Zagueiro', number: 3, available: true, stats: { goals: 2, assists: 1, matches: 18 } },
      { id: 'p3', name: 'Rafael Costa', position: 'Meio-Campo', number: 8, available: false, stats: { goals: 5, assists: 8, matches: 20 } },
      { id: 'p4', name: 'Lucas Martins', position: 'Atacante', number: 9, available: true, stats: { goals: 15, assists: 4, matches: 19 } },
      { id: 'p5', name: 'Bruno Alves', position: 'Lateral', number: 2, available: true, stats: { goals: 1, assists: 3, matches: 17 } },
    ],
  },
  {
    id: '2',
    name: 'Veteranos da Vila',
    logo: '🏆',
    description: 'Experiência em campo desde 2010',
    isMyTeam: true,
    stats: {
      wins: 8,
      draws: 7,
      losses: 5,
      goalsFor: 32,
      goalsAgainst: 25,
    },
    players: [
      { id: 'p6', name: 'Roberto Santos', position: 'Goleiro', number: 1, available: true, stats: { goals: 0, assists: 0, matches: 15 } },
      { id: 'p7', name: 'Marcelo Dias', position: 'Zagueiro', number: 4, available: true, stats: { goals: 3, assists: 2, matches: 16 } },
      { id: 'p8', name: 'Fernando Lima', position: 'Meio-Campo', number: 10, available: true, stats: { goals: 8, assists: 12, matches: 18 } },
      { id: 'p9', name: 'André Souza', position: 'Atacante', number: 11, available: false, stats: { goals: 12, assists: 5, matches: 17 } },
    ],
  },
  {
    id: '3',
    name: 'Juventude Unidos',
    logo: '⭐',
    description: 'Jovens talentos em ascensão',
    isMyTeam: true,
    stats: {
      wins: 15,
      draws: 3,
      losses: 2,
      goalsFor: 52,
      goalsAgainst: 15,
    },
    players: [
      { id: 'p10', name: 'Gabriel Rocha', position: 'Goleiro', number: 1, available: true, stats: { goals: 0, assists: 0, matches: 20 } },
      { id: 'p11', name: 'Thiago Mendes', position: 'Zagueiro', number: 5, available: true, stats: { goals: 4, assists: 2, matches: 19 } },
      { id: 'p12', name: 'Vinicius Oliveira', position: 'Meio-Campo', number: 7, available: true, stats: { goals: 10, assists: 15, matches: 20 } },
      { id: 'p13', name: 'Pedro Henrique', position: 'Atacante', number: 9, available: true, stats: { goals: 22, assists: 8, matches: 20 } },
      { id: 'p14', name: 'Matheus Ferreira', position: 'Lateral', number: 6, available: true, stats: { goals: 2, assists: 6, matches: 18 } },
      { id: 'p15', name: 'Diego Barbosa', position: 'Volante', number: 5, available: false, stats: { goals: 3, assists: 4, matches: 16 } },
    ],
  },
];

// Times Adversários
export const opponentTeams: Team[] = [
  {
    id: '4',
    name: 'Pelada da Praça',
    logo: '🔥',
    description: 'Time tradicional da praça',
    isMyTeam: false,
    stats: {
      wins: 10,
      draws: 6,
      losses: 4,
      goalsFor: 38,
      goalsAgainst: 22,
    },
    players: [],
  },
  {
    id: '5',
    name: 'Galera do Sintético',
    logo: '⚡',
    description: 'Especialistas em campo sintético',
    isMyTeam: false,
    stats: {
      wins: 14,
      draws: 4,
      losses: 2,
      goalsFor: 48,
      goalsAgainst: 16,
    },
    players: [],
  },
  {
    id: '6',
    name: 'Amigos FC',
    logo: '🎯',
    description: 'Unidos pelo futebol',
    isMyTeam: false,
    stats: {
      wins: 7,
      draws: 8,
      losses: 5,
      goalsFor: 28,
      goalsAgainst: 26,
    },
    players: [],
  },
];

export const allTeams = [...myTeams, ...opponentTeams];

// Agenda de Jogos
export const matches: Match[] = [
  {
    id: 'm1',
    homeTeam: 'Real Bairro FC',
    awayTeam: 'Pelada da Praça',
    date: '2024-02-15',
    time: '19:00',
    location: 'Campo do Bairro',
    status: 'scheduled',
  },
  {
    id: 'm2',
    homeTeam: 'Juventude Unidos',
    awayTeam: 'Galera do Sintético',
    date: '2024-02-18',
    time: '20:00',
    location: 'Arena Sintética',
    status: 'confirmed',
  },
  {
    id: 'm3',
    homeTeam: 'Veteranos da Vila',
    awayTeam: 'Amigos FC',
    date: '2024-02-20',
    time: '18:30',
    location: 'Campo da Vila',
    status: 'pending',
  },
  {
    id: 'm4',
    homeTeam: 'Real Bairro FC',
    awayTeam: 'Juventude Unidos',
    date: '2024-02-10',
    time: '19:00',
    location: 'Campo Central',
    status: 'completed',
    score: { home: 2, away: 3 },
  },
  {
    id: 'm5',
    homeTeam: 'Galera do Sintético',
    awayTeam: 'Veteranos da Vila',
    date: '2024-02-08',
    time: '20:30',
    location: 'Arena Sintética',
    status: 'completed',
    score: { home: 1, away: 1 },
  },
];

// Convites
export const invites: Invite[] = [
  {
    id: 'i1',
    from: 'Pelada da Praça',
    to: 'Real Bairro FC',
    matchId: 'm1',
    status: 'pending',
    date: '2024-02-15',
  },
  {
    id: 'i2',
    from: 'Juventude Unidos',
    to: 'Galera do Sintético',
    matchId: 'm2',
    status: 'accepted',
    date: '2024-02-18',
  },
  {
    id: 'i3',
    from: 'Amigos FC',
    to: 'Veteranos da Vila',
    matchId: 'm3',
    status: 'pending',
    date: '2024-02-20',
  },
];
