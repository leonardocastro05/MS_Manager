// ============================================
// DADES DEL MODE ONLINE - F1 MANAGER
// ============================================

/**
 * PATROCINADORS DISPONIBLES
 * Cada patrocinador dona rewards diferents per posició
 */
const sponsors = [
    {
        id: 1,
        name: 'Sponsor Bronze',
        icon: '🥉',
        cost: 500000, // 500k
        coinsPerRace: 1,
        bonusCondition: 'top5', // Top 5
        bonusMoney: 1000000, // 1M
        description: 'Ideal per començar: 1 coin per cursa + 1M si acabes top 5'
    },
    {
        id: 2,
        name: 'Sponsor Silver',
        icon: '🥈',
        cost: 700000, // 700k
        coinsPerRace: 1,
        bonusCondition: 'top5',
        bonusMoney: 3000000, // 3M
        description: '1 coin per cursa + 3M si acabes top 5'
    },
    {
        id: 3,
        name: 'Sponsor Gold',
        icon: '🥇',
        cost: 1500000, // 1.5M
        coinsPerRace: 2,
        bonusCondition: 'top3',
        bonusMoney: 5000000, // 5M
        description: '2 coins per cursa + 5M si acabes top 3'
    },
    {
        id: 4,
        name: 'Sponsor Platinum',
        icon: '💎',
        cost: 3000000, // 3M
        coinsPerRace: 3,
        bonusCondition: 'top3',
        bonusMoney: 5000000, // 5M
        description: '3 coins per cursa + 5M si acabes top 3'
    },
    {
        id: 5,
        name: 'Sponsor Elite',
        icon: '👑',
        cost: 5000000, // 5M
        coinsPerRace: 5,
        bonusCondition: 'winner',
        bonusMoney: 10000000, // 10M
        description: 'El millor: 5 coins + 10M per cada victòria!'
    }
];

/**
 * TENDA DE COINS (COMPRES REALS)
 * Preus en euros
 */
const coinShop = [
    {
        id: 'coins_3',
        coins: 3,
        price: 1.99,
        label: 'Paquet Inicial',
        badge: null
    },
    {
        id: 'coins_10',
        coins: 10,
        price: 3.99,
        label: 'Paquet Estàndard',
        badge: null
    },
    {
        id: 'coins_20',
        coins: 20,
        price: 5.99,
        label: 'Paquet Premium',
        badge: '⭐ MILLOR OFERTA'
    },
    {
        id: 'coins_50',
        coins: 50,
        price: 10.99,
        label: 'Paquet Pro',
        badge: null
    },
    {
        id: 'coins_120',
        coins: 120,
        price: 29.99,
        label: 'Paquet Elite',
        badge: null
    }
];

/**
 * TENDA DE BITLLETS AMB COINS
 * Pots comprar diners del joc amb coins
 */
const moneyShop = [
    {
        id: 'money_5m',
        amount: 5000000, // 5M
        coinsCost: 5,
        label: '5 Milions €'
    },
    {
        id: 'money_15m',
        amount: 15000000, // 15M
        coinsCost: 12,
        label: '15 Milions €'
    },
    {
        id: 'money_25m',
        amount: 25000000, // 25M
        coinsCost: 16,
        label: '25 Milions €'
    }
];

/**
 * OFERTA ESPECIAL STARTER PACK
 * Pilot i manager nivell 5
 */
const starterPack = {
    id: 'starter_pack',
    price: 3.99,
    includes: {
        driverLevel: 5,
        managerLevel: 5
    },
    label: '🎁 Starter Pack',
    description: 'Pilot Nv.5 + Manager Nv.5'
};

/**
 * SISTEMA D'EXPERIÈNCIA (XP)
 * Recompenses per pujar de nivell
 */
const xpRewards = {
    // Nivells 1-5: 3M per nivell
    1: { money: 3000000, coins: 0 },
    2: { money: 3000000, coins: 0 },
    3: { money: 3000000, coins: 0 },
    4: { money: 3000000, coins: 0 },
    5: { money: 3000000, coins: 0 },
    
    // Nivells 6-9: 5M per nivell
    6: { money: 5000000, coins: 0 },
    7: { money: 5000000, coins: 0 },
    8: { money: 5000000, coins: 0 },
    9: { money: 5000000, coins: 0 },
    
    // Nivells 10-14: 8M per nivell
    10: { money: 8000000, coins: 0 },
    11: { money: 8000000, coins: 0 },
    12: { money: 8000000, coins: 0 },
    13: { money: 8000000, coins: 0 },
    14: { money: 8000000, coins: 0 },
    
    // Nivells 15-20: 10M + 5 coins per nivell
    15: { money: 10000000, coins: 5 },
    16: { money: 10000000, coins: 5 },
    17: { money: 10000000, coins: 5 },
    18: { money: 10000000, coins: 5 },
    19: { money: 10000000, coins: 5 },
    20: { money: 10000000, coins: 5 }
};

/**
 * XP necessària per pujar cada nivell
 * Escala exponencial per fer-ho més desafiant
 */
const xpRequirements = {
    1: 0,
    2: 100,
    3: 250,
    4: 450,
    5: 700,
    6: 1000,
    7: 1400,
    8: 1900,
    9: 2500,
    10: 3200,
    11: 4000,
    12: 5000,
    13: 6200,
    14: 7600,
    15: 9200,
    16: 11000,
    17: 13000,
    18: 15500,
    19: 18500,
    20: 22000
};

/**
 * XP guanyada segons posició a la cursa
 */
const xpPerPosition = {
    1: 100,  // 1r lloc
    2: 80,
    3: 65,
    4: 55,
    5: 45,
    6: 40,
    7: 35,
    8: 30,
    9: 25,
    10: 20,
    // 11+ = 10 XP
};

/**
 * Calcula l'XP guanyada segons la posició
 */
function getXPForPosition(position) {
    return xpPerPosition[position] || 10;
}

/**
 * Calcula l'XP necessària per al següent nivell
 */
function getXPForLevel(level) {
    return xpRequirements[level] || 22000;
}

/**
 * Calcula les recompenses per pujar de nivell
 */
function getRewardForLevel(level) {
    return xpRewards[level] || { money: 10000000, coins: 5 };
}