// Dados mockados para a aplicação
export const mockCampaigns = [
    {
        id: 1,
        name: "A Jornada dos Cinco Anéis",
        description: "Uma aventura épica no mundo de Rokugan, onde honra e tradição se misturam com magia e intriga política.",
        rating: 4.8,
        players: 5,
        status: "Ativa",
        image: "/images/campaign-1.jpg",
        master: "Mestre Kitsune",
        system: "Legend of the Five Rings",
        level: "Iniciante",
        schedule: "Sábados 19h"
    },
    {
        id: 2,
        name: "Dungeons & Dragons: A Coroa Perdida",
        description: "Uma campanha clássica de D&D onde heróis devem recuperar uma coroa mágica roubada por dragões anciões.",
        rating: 4.9,
        players: 4,
        status: "Recrutando",
        image: "/images/campaign-2.jpg",
        master: "Dungeon Master Sarah",
        system: "D&D 5e",
        level: "Intermediário",
        schedule: "Domingos 14h"
    },
    {
        id: 3,
        name: "Call of Cthulhu: O Culto das Profundezas",
        description: "Uma investigação sobrenatural em Innsmouth, onde segredos antigos aguardam ser descobertos.",
        rating: 4.7,
        players: 3,
        status: "Ativa",
        image: "/images/campaign-3.jpg",
        master: "Investigador Mike",
        system: "Call of Cthulhu",
        level: "Avançado",
        schedule: "Quintas 20h"
    }
];

export const mockUser = {
    id: 1,
    name: "Apelido de usuário",
    email: "aventureiro@exemplo.com",
    avatar: "/images/avatar.jpg",
    level: "Intermediário",
    favoriteSystems: ["D&D 5e", "Pathfinder", "Vampire: The Masquerade"],
    campaignsJoined: 12,
    campaignsCreated: 3,
    handle: 'User',
    bio: 'Exemplo de biografia do usuário, seus gostos e preferências!',
    connections: 11,
    campaignsCount: 2
};

export const mockRecommendations = [
    {
        id: 1,
        title: "Aventura Recomendada 1",
        description: "Uma aventura épica baseada no seu perfil de jogador.",
        system: "D&D 5e",
        level: "Intermediário",
        players: "4-6",
        duration: "3-4 horas"
    },
    {
        id: 2,
        title: "Aventura Recomendada 2",
        description: "Uma campanha de mistério e investigação sobrenatural.",
        system: "Call of Cthulhu",
        level: "Avançado",
        players: "3-5",
        duration: "2-3 horas"
    },
    {
        id: 3,
        title: "Aventura Recomendada 3",
        description: "Uma jornada espacial cheia de aventuras e descobertas.",
        system: "Starfinder",
        level: "Iniciante",
        players: "4-6",
        duration: "4-5 horas"
    }
];

// Feed posts mock
export const mockFeedPosts = [
    {
        id: 1,
        author: 'Nickname',
        handle: 'user',
        image: '/images/post-1.jpg'
    },
    {
        id: 2,
        author: 'Aventureiro',
        handle: 'gm_master',
        image: '/images/post-2.jpg'
    }
];

export const mockCharacters = [
    { id: 1, system: 'DND', name: 'Nome do personagem', available: false },
    { id: 2, system: 'DND', name: 'Nome do personagem', available: true }
];

export const mockUserPosts = [
    { id: 101, author: 'Apelido de usuário', handle: 'User', image: '/images/post-1.jpg' },
    { id: 102, author: 'Apelido de usuário', handle: 'User', image: '/images/post-2.jpg' }
];

// Dados mockados para campanha ativa
export const mockActiveCampaign = {
    id: 1,
    name: "Campanha D&D",
    description: "Uma aventura épica no mundo de Faerûn",
    master: "GM Nickname",
    players: [
        { id: 1, name: "Jogador 1", character: "Aragorn", level: 5 },
        { id: 2, name: "Jogador 2", character: "Gandalf", level: 6 },
        { id: 3, name: "Jogador 3", character: "Legolas", level: 5 }
    ],
    channels: [
        { id: 1, name: "Sessão principal", type: "general", active: true },
        { id: 2, name: "OOC", type: "ooc", active: false },
        { id: 3, name: "Dados", type: "dice", active: false }
    ],
    currentChannel: 1
};

// Mensagens do chat mockadas
export const mockChatMessages = [
    {
        id: 1,
        author: "GM Nickname",
        isGM: true,
        timestamp: "28/09/2025 20:41",
        message: "Teste de mensagem na campanha!",
        type: "text"
    },
    {
        id: 2,
        author: "GM Nickname",
        isGM: true,
        timestamp: "28/09/2025 20:42",
        diceRoll: {
            dice: "1D20",
            result: 7,
            modifier: 0
        },
        type: "dice"
    },
    {
        id: 3,
        author: "Jogador 1",
        isGM: false,
        timestamp: "28/09/2025 20:43",
        message: "Vou tentar uma ação de furtividade",
        type: "text"
    },
    {
        id: 4,
        author: "Jogador 1",
        isGM: false,
        timestamp: "28/09/2025 20:44",
        diceRoll: {
            dice: "1D20+3",
            result: 15,
            modifier: 3
        },
        type: "dice"
    }
];

// Campaigns list mock for listing page
export const mockCampaignsList = [
    {
        id: 1,
        system: 'Dungeons & Dragons',
        title: 'Mesa teste de D&D',
        description: 'Uma mesa introdutória explorando a masmorra da coroa perdida.',
        players: 5
    },
    {
        id: 2,
        system: 'Ordem Paranormal',
        title: 'Mesa teste de OP',
        description: 'Investigações de atividades sobrenaturais na capital.',
        players: 4
    },
    {
        id: 3,
        system: 'Tormenta20',
        title: 'Mesa teste de T20',
        description: 'Aventura em Arton com foco em RP e jornada heróica.',
        players: 6
    },
    {
        id: 4,
        system: 'Call of Cthulhu',
        title: 'Mesa teste de CoC',
        description: 'Mistérios lovecraftianos em Innsmouth com investigação pesada.',
        players: 3
    }
];


