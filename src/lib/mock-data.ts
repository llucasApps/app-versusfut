// Mock data para VersusFut

export interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  available: boolean;
  age?: number;
  foto?: string;
  phone?: string;
  preferredFoot?: 'Direito' | 'Esquerdo' | 'Ambos';
  secondaryPosition?: string;
  isCaptain?: boolean;
  isFreeKickTaker?: boolean;
  isGuest?: boolean;
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
  president?: string;
  phone?: string;
  category?: 'Juvenil' | 'Adulto' | 'Veterano 35+' | 'Master 45+';
  availableForMatch?: boolean;
  hasVenue?: boolean; // Se possui local próprio para jogar
  teamType?: 'Campo' | 'Society' | 'Futsal';
  availableDates?: string[]; // Datas disponíveis para jogar (formato ISO)
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
  messages?: ChatMessage[];
}

export interface Invite {
  id: string;
  from: string;
  to: string;
  matchId: string;
  status: 'pending' | 'accepted' | 'declined';
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
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
    name: 'Real Cohab',
    logo: '🏆',
    description: 'Inimigos da vitória',
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
    president: 'Carlos Silva',
    phone: '(11) 99999-1234',
    category: 'Adulto',
    availableForMatch: true,
    hasVenue: true,
    teamType: 'Campo',
    availableDates: ['2024-12-10', '2024-12-15', '2024-12-20', '2024-12-25'],
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
    president: 'Roberto Almeida',
    phone: '(11) 98888-5678',
    category: 'Adulto',
    availableForMatch: true,
    hasVenue: false,
    teamType: 'Society',
    availableDates: ['2024-12-08', '2024-12-12', '2024-12-18', '2024-12-22'],
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
    president: 'Fernando Costa',
    phone: '(11) 97777-9012',
    category: 'Veterano 35+',
    availableForMatch: false,
    hasVenue: true,
    teamType: 'Futsal',
    availableDates: [],
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
    messages: [
      {
        id: 'msg1',
        sender: 'Real Bairro FC',
        message: 'Podemos começar às 16h em vez de 15h?',
        timestamp: new Date('2024-02-14T10:30:00').toISOString()
      },
      {
        id: 'msg2',
        sender: 'Pelada da Praça',
        message: 'Fechado, 16h!',
        timestamp: new Date('2024-02-14T11:15:00').toISOString()
      },
      {
        id: 'msg3',
        sender: 'Real Bairro FC',
        message: 'Perfeito! Nos vemos lá 👍',
        timestamp: new Date('2024-02-14T11:20:00').toISOString()
      }
    ]
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

// Fotos fake para Real Bairro FC (id: '1')
export const initialPhotos = [
  {
    id: 'foto1',
    timeId: '1',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
    titulo: 'Foto do elenco 2024',
    data: '2024-01-15',
    descricao: 'Time completo reunido para foto oficial da temporada 2024'
  },
  {
    id: 'foto2',
    timeId: '1',
    url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop',
    titulo: 'Amistoso contra Pelada da Praça',
    data: '2024-01-20',
    descricao: 'Jogo amistoso preparatório para o campeonato'
  },
  {
    id: 'foto3',
    timeId: '1',
    url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600&fit=crop',
    titulo: 'Equipe campeã do torneio local',
    data: '2023-12-10',
    descricao: 'Comemoração do título do torneio de fim de ano'
  },
  {
    id: 'foto4',
    timeId: '1',
    url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=600&fit=crop',
    titulo: 'Treino tático',
    data: '2024-02-01',
    descricao: 'Sessão de treino focada em táticas defensivas'
  }
];

// Vídeos fake para Real Bairro FC (id: '1')
export const initialVideos = [
  {
    id: 'video1',
    timeId: '1',
    titulo: 'Técnicas de Finalização - Parte 1',
    descricao: 'Aprenda as melhores técnicas para finalizar com precisão e potência',
    urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    categoria: 'Finalização',
    duracao: '12:45'
  },
  {
    id: 'video2',
    timeId: '1',
    titulo: 'Tática 4-4-2: Posicionamento',
    descricao: 'Como se posicionar corretamente na formação 4-4-2',
    urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    categoria: 'Tática',
    duracao: '15:30'
  },
  {
    id: 'video3',
    timeId: '1',
    titulo: 'Preparação Física para Futebol',
    descricao: 'Exercícios essenciais para melhorar seu condicionamento físico',
    urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    categoria: 'Preparação Física',
    duracao: '18:20'
  },
  {
    id: 'video4',
    timeId: '1',
    titulo: 'Passes Curtos e Longos',
    descricao: 'Domine a arte do passe com estas técnicas fundamentais',
    urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    categoria: 'Passe',
    duracao: '10:15'
  },
  {
    id: 'video5',
    timeId: '1',
    titulo: 'Defesa: Marcação Individual',
    descricao: 'Aprenda a marcar seu adversário de forma efetiva',
    urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    categoria: 'Defesa',
    duracao: '14:00'
  }
];

// Função para inicializar dados fake no localStorage
export function initializeFakeData() {
  if (typeof window === 'undefined') return;

  // Inicializar fotos para Real Bairro FC
  const existingPhotos = localStorage.getItem('fotos_1');
  if (!existingPhotos) {
    localStorage.setItem('fotos_1', JSON.stringify(initialPhotos));
  }

  // Inicializar vídeos para Real Bairro FC
  const existingVideos = localStorage.getItem('videos_1');
  if (!existingVideos) {
    localStorage.setItem('videos_1', JSON.stringify(initialVideos));
  }

  // Inicializar configurações
  const existingConfig = localStorage.getItem('userConfig');
  if (!existingConfig) {
    localStorage.setItem('userConfig', JSON.stringify({
      displayName: 'Rafael Jr – Presidente Real Cohab',
      darkMode: true,
      notifications: true
    }));
  }
}
