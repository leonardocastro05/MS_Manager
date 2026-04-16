const ONLINE_LEVELING = {
    maxLevel: 50,
    getXpForLevel: (level) => {
        const safeLevel = Math.max(1, Number(level) || 1);

        if (safeLevel <= 5) return 100 + (safeLevel - 1) * 30;
        if (safeLevel <= 15) return 250 + (safeLevel - 5) * 50;
        if (safeLevel <= 30) return 750 + (safeLevel - 15) * 100;

        return 2250 + (safeLevel - 30) * 200;
    }
};

function clampNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function calculateOnlineLevel(totalXp) {
    const safeTotalXp = Math.max(0, clampNumber(totalXp, 0));
    let remainingXp = safeTotalXp;
    let level = 1;
    let xpForNextLevel = ONLINE_LEVELING.getXpForLevel(level);

    while (remainingXp >= xpForNextLevel && level < ONLINE_LEVELING.maxLevel) {
        remainingXp -= xpForNextLevel;
        level += 1;
        xpForNextLevel = ONLINE_LEVELING.getXpForLevel(level);
    }

    return {
        level,
        totalXp: safeTotalXp,
        currentXp: remainingXp,
        xpForNextLevel,
        progress: level >= ONLINE_LEVELING.maxLevel
            ? 100
            : Math.min(100, (remainingXp / Math.max(xpForNextLevel, 1)) * 100)
    };
}

function ensureOnlineData(onlineData = {}) {
    const existing = onlineData || {};

    return {
        ...existing,
        coins: Math.max(0, Math.floor(clampNumber(existing.coins, 0))),
        level: Math.max(1, Math.floor(clampNumber(existing.level, 1))),
        xp: Math.max(0, Math.floor(clampNumber(existing.xp, 0))),
        driverLevel: Math.max(1, Math.floor(clampNumber(existing.driverLevel, 1))),
        managerLevel: Math.max(1, Math.floor(clampNumber(existing.managerLevel, 1))),
        sponsor: existing.sponsor || null,
        sponsorRacesRemaining: Math.max(0, Math.floor(clampNumber(existing.sponsorRacesRemaining, 0))),
        carConfig: {
            color: existing.carConfig?.color || '#FFD700',
            finish: existing.carConfig?.finish || 'brillant'
        },
        carUpgrades: {
            engine: Math.max(0, Math.floor(clampNumber(existing.carUpgrades?.engine, 0))),
            aero: Math.max(0, Math.floor(clampNumber(existing.carUpgrades?.aero, 0))),
            chassis: Math.max(0, Math.floor(clampNumber(existing.carUpgrades?.chassis, 0)))
        },
        totalRaces: Math.max(0, Math.floor(clampNumber(existing.totalRaces, 0))),
        onlineWins: Math.max(0, Math.floor(clampNumber(existing.onlineWins, 0))),
        onlinePodiums: Math.max(0, Math.floor(clampNumber(existing.onlinePodiums, 0)))
    };
}

function syncOnlineLevel(onlineData, preventLevelDrop = true) {
    const normalized = ensureOnlineData(onlineData);
    const levelData = calculateOnlineLevel(normalized.xp);

    normalized.level = preventLevelDrop
        ? Math.max(normalized.level, levelData.level)
        : levelData.level;

    return {
        online: normalized,
        levelData: {
            ...levelData,
            level: normalized.level
        }
    };
}

function mergeOnlineData(existingOnline = {}, incomingOnline = {}) {
    const current = ensureOnlineData(existingOnline);
    const incoming = incomingOnline || {};

    const merged = {
        ...current,
        ...incoming,
        carConfig: {
            ...current.carConfig,
            ...(incoming.carConfig || {})
        },
        carUpgrades: {
            ...current.carUpgrades,
            ...(incoming.carUpgrades || {})
        }
    };

    return syncOnlineLevel(merged).online;
}

function addXpToOnlineData(existingOnline = {}, xpToAdd = 0) {
    const normalized = ensureOnlineData(existingOnline);
    normalized.xp += Math.max(0, Math.floor(clampNumber(xpToAdd, 0)));

    return syncOnlineLevel(normalized);
}

function getXpForRacePosition(position, totalParticipants) {
    const maxXp = 100;
    const minXp = 20;
    const safeTotal = Math.max(2, Math.floor(clampNumber(totalParticipants, 2)));
    const safePosition = Math.max(1, Math.min(safeTotal, Math.floor(clampNumber(position, safeTotal))));

    const step = (maxXp - minXp) / Math.max(1, safeTotal - 1);
    return Math.max(minXp, Math.round(maxXp - (safePosition - 1) * step));
}

module.exports = {
    ONLINE_LEVELING,
    calculateOnlineLevel,
    ensureOnlineData,
    syncOnlineLevel,
    mergeOnlineData,
    addXpToOnlineData,
    getXpForRacePosition
};
