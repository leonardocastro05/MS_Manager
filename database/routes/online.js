const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const User = require('../models/User');
const League = require('../models/League');
const {
    calculateOnlineLevel,
    ensureOnlineData,
    mergeOnlineData,
    addXpToOnlineData,
    getXpForRacePosition
} = require('../utils/onlineProgression');

// ===========================================
// XP SYSTEM CONFIGURATION
// ===========================================
const XP_CONFIG = {
    // XP rewards basados en posición de carrera
    rewards: {
        // P1: 200xp
        position1: 200,
        // P2-P5: 150xp
        position2to5: 150,
        // P6+: 50xp
        position6plus: 50,
        // Bonus por liga
        leagueWin: 500,
        seasonPodium: 250
    },
    
    // Helper para obtener XP por posición
    getXpForPosition: (position) => {
        if (position === 1) return XP_CONFIG.rewards.position1;
        if (position >= 2 && position <= 5) return XP_CONFIG.rewards.position2to5;
        return XP_CONFIG.rewards.position6plus;
    }
};

// ===========================================
// COIN SHOP CONFIGURATION
// ===========================================
const SHOP_CONFIG = {
    // Coin packages (real money)
    coinPackages: [
        { id: 'coins_5', coins: 5, price: 1.99, currency: 'EUR' },
        { id: 'coins_12', coins: 12, price: 4.99, currency: 'EUR' },
        { id: 'coins_18', coins: 18, price: 7.99, currency: 'EUR' },
        { id: 'coins_30', coins: 30, price: 12.99, currency: 'EUR' },
        { id: 'coins_50', coins: 50, price: 19.99, currency: 'EUR' },
        { id: 'coins_80', coins: 80, price: 29.99, currency: 'EUR' }
    ],
    
    // In-game money packages (coins)
    moneyPackages: [
        { id: 'money_5m', money: 5000000, cost: 5, label: '5M' },
        { id: 'money_10m', money: 10000000, cost: 8, label: '10M' },
        { id: 'money_30m', money: 30000000, cost: 15, label: '30M' }
    ],
    
    // League creation cost
    leagueCreationCost: 5000000 // 5M
};

const SHOP_PURCHASE_COOLDOWN_MS = 2000;
const shopPurchaseCooldownByUser = new Map();

const TRACK_ROTATION = ['monza', 'bahrain', 'portimao', 'montmelo', 'shanghai', 'melbourne', 'leoverse'];

const TRACK_CATALOG = {
    monza: {
        id: 'monza',
        name: 'Autodromo Nazionale Monza',
        country: 'Italia',
        flag: '🇮🇹',
        length: 5.793,
        laps: 20,
        image: 'img/tracks/monza.svg',
        referenceLapMs: 80200
    },
    bahrain: {
        id: 'bahrain',
        name: 'Bahrain International Circuit',
        country: 'Bahréin',
        flag: '🇧🇭',
        length: 5.412,
        laps: 20,
        image: 'img/tracks/bahrain.svg',
        referenceLapMs: 91800
    },
    portimao: {
        id: 'portimao',
        name: 'Autódromo Internacional do Algarve',
        country: 'Portugal',
        flag: '🇵🇹',
        length: 4.653,
        laps: 20,
        image: 'img/tracks/portimao.svg',
        referenceLapMs: 89000
    },
    montmelo: {
        id: 'montmelo',
        name: 'Circuit de Barcelona-Catalunya',
        country: 'España',
        flag: '🇪🇸',
        length: 4.675,
        laps: 20,
        image: 'img/tracks/montmelo.svg',
        referenceLapMs: 88900
    },
    shanghai: {
        id: 'shanghai',
        name: 'Shanghai International Circuit',
        country: 'China',
        flag: '🇨🇳',
        length: 5.360,
        laps: 20,
        image: 'img/tracks/shanghai.svg',
        referenceLapMs: 94100
    },
    melbourne: {
        id: 'melbourne',
        name: 'Albert Park Circuit',
        country: 'Australia',
        flag: '🇦🇺',
        length: 4.900,
        laps: 20,
        image: 'img/tracks/melbourne.svg',
        referenceLapMs: 86200
    },
    leoverse: {
        id: 'leoverse',
        name: 'Leoverse Circuit',
        country: 'Leoverse',
        flag: '🪐',
        length: 5.198,
        laps: 20,
        image: 'img/tracks/bahrain.svg',
        referenceLapMs: 92000
    }
};

const F1_POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const RACE_MONEY_TABLE = [1000000, 750000, 600000, 450000, 350000, 300000, 240000, 180000, 120000, 90000];
const TYRE_QUALIFYING_BONUS_MS = {
    soft: -220,
    medium: 0,
    hard: 180
};
const WEEKDAY_SCHEDULE_DAYS = new Set([1, 2, 3, 4, 5]);
const WEEKDAY_LABELS_ES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const LEAGUE_LIVE_STATE_TTL_MS = 15 * 60 * 1000;
const LEAGUE_LIVE_MEMBERS_CACHE_MS = 30 * 1000;
const leagueLiveRaceStateByLeague = new Map();

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Check if user can access online mode (min level 5 in all HQ categories)
// TODO: Restaurar validación cuando se implementen los requisitos
const canAccessOnline = (user) => {
    // Modo online desbloqueado temporalmente
    return true;
    
    /* DESCOMENTAR PARA REACTIVAR REQUISITOS:
    const hqLevels = user.gameData?.hqLevels || {
        facilities: 1,
        engineering: 1,
        marketing: 1,
        staff: 1
    };
    
    const minRequired = 5;
    return Object.values(hqLevels).every(level => level >= minRequired);
    */
};

const formatLapTime = (lapMs) => {
    if (!Number.isFinite(lapMs)) {
        return null;
    }

    const totalMs = Math.max(0, Math.round(lapMs));
    const minutes = Math.floor(totalMs / 60000);
    const seconds = ((totalMs % 60000) / 1000).toFixed(3).padStart(6, '0');
    return `${minutes}:${seconds}`;
};

const normalizeScheduleTime = (timeValue) => {
    const raw = typeof timeValue === 'string' ? timeValue.trim() : '';
    const match = raw.match(/^(\d{1,2}):(\d{2})$/);

    if (!match) {
        return '20:00';
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return '20:00';
    }

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return '20:00';
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const parseScheduleTime = (timeValue) => {
    const safeTime = normalizeScheduleTime(timeValue);
    const [hoursText, minutesText] = safeTime.split(':');
    const hours = Number(hoursText);
    const minutes = Number(minutesText);

    return {
        value: safeTime,
        hours,
        minutes,
        totalMinutes: (hours * 60) + minutes
    };
};

const normalizeTimeZone = (timeZoneValue) => {
    const fallback = 'Europe/Madrid';
    const candidate = typeof timeZoneValue === 'string' ? timeZoneValue.trim() : '';

    if (!candidate) {
        return fallback;
    }

    try {
        new Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(new Date());
        return candidate;
    } catch (error) {
        return fallback;
    }
};

const getTimeZoneDateParts = (date, timeZone) => {
    const safeTimeZone = normalizeTimeZone(timeZone);
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: safeTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        weekday: 'short'
    });

    const values = {};
    formatter.formatToParts(date).forEach((part) => {
        if (part.type !== 'literal') {
            values[part.type] = part.value;
        }
    });

    const weekdayMap = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6
    };

    const year = Number(values.year);
    const month = Number(values.month);
    const day = Number(values.day);
    const hour = Number(values.hour);
    const minute = Number(values.minute);
    const weekday = weekdayMap[values.weekday] ?? new Date(date).getUTCDay();

    return {
        year,
        month,
        day,
        hour,
        minute,
        weekday,
        totalMinutes: (hour * 60) + minute,
        dateKey: (year * 10000) + (month * 100) + day
    };
};

const addDaysToDateParts = (parts, daysToAdd) => {
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + daysToAdd));
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        weekday: date.getUTCDay(),
        dateKey: (date.getUTCFullYear() * 10000) + ((date.getUTCMonth() + 1) * 100) + date.getUTCDate()
    };
};

const formatDateLabel = (parts) => {
    const day = String(parts.day).padStart(2, '0');
    const month = String(parts.month).padStart(2, '0');
    return `${day}/${month}/${parts.year}`;
};

const getTimeZoneOffsetMs = (date, timeZone) => {
    const localParts = getTimeZoneDateParts(date, timeZone);
    const utcFromLocalParts = Date.UTC(
        localParts.year,
        localParts.month - 1,
        localParts.day,
        localParts.hour,
        localParts.minute,
        0
    );
    return utcFromLocalParts - date.getTime();
};

const buildUtcDateForTimeZone = ({ year, month, day, hours, minutes, timeZone }) => {
    const baseUtcMs = Date.UTC(year, month - 1, day, hours, minutes, 0);
    let adjustedUtcMs = baseUtcMs;

    // Two passes handle DST transitions in most practical cases.
    for (let i = 0; i < 2; i += 1) {
        const offsetMs = getTimeZoneOffsetMs(new Date(adjustedUtcMs), timeZone);
        adjustedUtcMs = baseUtcMs - offsetMs;
    }

    return new Date(adjustedUtcMs);
};

const getScheduleDaysForLeague = (league) => {
    const frequency = league?.schedule?.frequency || 'weekdays';
    if (frequency === 'weekly') {
        const dayOfWeek = Number(league?.schedule?.dayOfWeek);
        if (Number.isFinite(dayOfWeek) && dayOfWeek >= 0 && dayOfWeek <= 6) {
            return new Set([dayOfWeek]);
        }
        return new Set([1]);
    }

    return new Set(WEEKDAY_SCHEDULE_DAYS);
};

const countReleasedRaceSlots = ({ league, nowParts, scheduleTime, scheduleDays, timeZone }) => {
    const totalRaces = Math.max(1, Number(league?.currentSeason?.totalRaces) || 10);
    const seasonStart = league?.currentSeason?.startDate || league?.createdAt || new Date();
    const startParts = getTimeZoneDateParts(new Date(seasonStart), timeZone);

    let cursorUtcMs = Date.UTC(startParts.year, startParts.month - 1, startParts.day);
    const endUtcMs = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);
    if (cursorUtcMs > endUtcMs) {
        return 0;
    }

    let released = 0;
    while (cursorUtcMs <= endUtcMs && released < totalRaces) {
        const weekday = new Date(cursorUtcMs).getUTCDay();
        if (scheduleDays.has(weekday)) {
            if (cursorUtcMs < endUtcMs || nowParts.totalMinutes >= scheduleTime.totalMinutes) {
                released += 1;
            }
        }

        cursorUtcMs += DAY_IN_MS;
    }

    return released;
};

const getNextScheduleSlot = ({ nowParts, scheduleTime, scheduleDays }) => {
    for (let daysAhead = 0; daysAhead <= 21; daysAhead += 1) {
        const candidate = addDaysToDateParts(nowParts, daysAhead);
        if (!scheduleDays.has(candidate.weekday)) {
            continue;
        }

        if (daysAhead === 0 && nowParts.totalMinutes >= scheduleTime.totalMinutes) {
            continue;
        }

        return candidate;
    }

    return null;
};

const getLeagueRaceScheduleStatus = (league, now = new Date()) => {
    const totalRaces = Math.max(1, Number(league?.currentSeason?.totalRaces) || 10);
    const completedRaces = Math.min(totalRaces, Math.max(0, Number(league?.currentSeason?.currentRace) || 0));
    const timeZone = normalizeTimeZone(league?.schedule?.timezone);
    const scheduleTime = parseScheduleTime(league?.schedule?.time);
    const scheduleDays = getScheduleDaysForLeague(league);
    const nowParts = getTimeZoneDateParts(now, timeZone);
    const releasedRaces = Math.min(
        totalRaces,
        countReleasedRaceSlots({
            league,
            nowParts,
            scheduleTime,
            scheduleDays,
            timeZone
        })
    );

    const pendingRaces = Math.max(0, releasedRaces - completedRaces);
    const seasonCompleted = completedRaces >= totalRaces;
    const scheduleDayToday = scheduleDays.has(nowParts.weekday);
    const isRestDay = !scheduleDayToday;
    const isBeforeRaceTimeToday = scheduleDayToday && nowParts.totalMinutes < scheduleTime.totalMinutes;

    let message;
    let nextRaceLabel = null;
    let nextRaceAt = null;

    if (seasonCompleted) {
        message = 'Temporada completada. No hay mas carreras pendientes.';
    } else if (pendingRaces > 0) {
        message = `Carrera ${completedRaces + 1} disponible.`;
        nextRaceAt = now.toISOString();
    } else if (isBeforeRaceTimeToday) {
        message = `La carrera diaria se habilita hoy a las ${scheduleTime.value} (${timeZone}).`;
        nextRaceLabel = `Hoy ${scheduleTime.value}`;
        nextRaceAt = buildUtcDateForTimeZone({
            year: nowParts.year,
            month: nowParts.month,
            day: nowParts.day,
            hours: scheduleTime.hours,
            minutes: scheduleTime.minutes,
            timeZone
        }).toISOString();
    } else {
        const nextSlot = getNextScheduleSlot({ nowParts, scheduleTime, scheduleDays });
        if (nextSlot) {
            const weekdayName = WEEKDAY_LABELS_ES[nextSlot.weekday] || 'dia';
            nextRaceLabel = `${weekdayName} ${formatDateLabel(nextSlot)} ${scheduleTime.value}`;
            message = `Proxima carrera: ${nextRaceLabel} (${timeZone}).`;
            nextRaceAt = buildUtcDateForTimeZone({
                year: nextSlot.year,
                month: nextSlot.month,
                day: nextSlot.day,
                hours: scheduleTime.hours,
                minutes: scheduleTime.minutes,
                timeZone
            }).toISOString();
        } else {
            message = 'No hay mas carreras programadas para esta temporada.';
        }
    }

    const frequency = league?.schedule?.frequency || 'weekdays';

    return {
        frequency,
        time: scheduleTime.value,
        timezone: timeZone,
        scheduleDays: Array.from(scheduleDays.values()).sort((a, b) => a - b),
        scheduleDayToday,
        isRestDay,
        isBeforeRaceTimeToday,
        releasedRaces,
        completedRaces,
        pendingRaces,
        seasonCompleted,
        canRaceNow: !seasonCompleted && pendingRaces > 0,
        currentRaceNumber: Math.min(totalRaces, completedRaces + 1),
        nextRaceAt,
        nextRaceLabel,
        message
    };
};

const sanitizeLeagueScheduleInput = (scheduleInput = {}, forceWeekdays = false) => {
    const safeTime = normalizeScheduleTime(scheduleInput?.time);
    const safeTimezone = normalizeTimeZone(scheduleInput?.timezone);
    const parsedDay = Math.floor(Number(scheduleInput?.dayOfWeek));
    const safeDayOfWeek = Number.isFinite(parsedDay)
        ? Math.max(0, Math.min(6, parsedDay))
        : 1;

    const requestedFrequency = scheduleInput?.frequency === 'weekly' ? 'weekly' : 'weekdays';
    const safeFrequency = forceWeekdays ? 'weekdays' : requestedFrequency;

    return {
        frequency: safeFrequency,
        dayOfWeek: safeDayOfWeek,
        time: safeTime,
        timezone: safeTimezone
    };
};

const getMemberRacesToday = (member, timeZone, now = new Date()) => {
    if (!member) {
        return 0;
    }

    const memberDaily = member.dailyRacesCount || { date: null, count: 0 };
    if (!memberDaily.date) {
        return 0;
    }

    const raceDate = new Date(memberDaily.date);
    if (Number.isNaN(raceDate.getTime())) {
        return 0;
    }

    const nowParts = getTimeZoneDateParts(now, timeZone);
    const raceDateParts = getTimeZoneDateParts(raceDate, timeZone);
    if (raceDateParts.dateKey !== nowParts.dateKey) {
        return 0;
    }

    return Math.max(0, Number(memberDaily.count) || 0);
};

const getCurrentRaceNumber = (league) => {
    const totalRaces = Math.max(1, Number(league?.currentSeason?.totalRaces) || 10);
    const completedRaces = Math.max(0, Number(league?.currentSeason?.currentRace) || 0);
    return Math.min(totalRaces, completedRaces + 1);
};

const getTrackForLeague = (league) => {
    const raceNumber = getCurrentRaceNumber(league);
    const trackId = TRACK_ROTATION[(raceNumber - 1) % TRACK_ROTATION.length] || 'monza';
    return TRACK_CATALOG[trackId] || TRACK_CATALOG.monza;
};

const getMemberUserId = (member) => {
    const raw = member?.user?._id || member?.user?.id || member?.user;
    return raw ? raw.toString() : null;
};

const normalizeLeagueLiveProgress = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return ((parsed % 1) + 1) % 1;
};

const normalizeLeagueLiveCarState = (carState = {}) => {
    const progress = normalizeLeagueLiveProgress(carState.progress);
    const lap = Math.max(0, Math.floor(Number(carState.lap) || 0));
    const totalProgressParsed = Number(carState.totalProgress);
    const totalProgress = Number.isFinite(totalProgressParsed)
        ? Math.max(0, totalProgressParsed)
        : (lap + progress);
    const tire = ['soft', 'medium', 'hard'].includes(String(carState.tire || '').toLowerCase())
        ? String(carState.tire || '').toLowerCase()
        : 'medium';
    const nextPitTyre = ['soft', 'medium', 'hard'].includes(String(carState.nextPitTyre || '').toLowerCase())
        ? String(carState.nextPitTyre || '').toLowerCase()
        : 'medium';
    const tireLifeParsed = Number(carState.tireLife);
    const pitTimeParsed = Number(carState.pitTime);
    const lastLapParsed = Number(carState.lastLap);
    const bestLapParsed = Number(carState.bestLap);

    return {
        progress,
        lap,
        totalProgress,
        inPit: Boolean(carState.inPit),
        pitRequested: Boolean(carState.pitRequested),
        pitTime: Number.isFinite(pitTimeParsed) ? Math.max(0, Math.min(20, pitTimeParsed)) : 0,
        tire,
        nextPitTyre,
        tireLife: Number.isFinite(tireLifeParsed) ? Math.max(0, Math.min(100, tireLifeParsed)) : 100,
        finished: Boolean(carState.finished),
        retired: Boolean(carState.retired),
        lastLap: Number.isFinite(lastLapParsed) && lastLapParsed > 0 ? lastLapParsed : null,
        bestLap: Number.isFinite(bestLapParsed) && bestLapParsed > 0 ? bestLapParsed : null
    };
};

const pruneStaleLeagueLiveStates = () => {
    const now = Date.now();
    for (const [leagueId, entry] of leagueLiveRaceStateByLeague.entries()) {
        if (!entry || now - entry.updatedAt > LEAGUE_LIVE_STATE_TTL_MS) {
            leagueLiveRaceStateByLeague.delete(leagueId);
        }
    }
};

const ensureLeagueLiveStateEntry = (leagueId) => {
    const existing = leagueLiveRaceStateByLeague.get(leagueId);
    if (existing) return existing;

    const created = {
        updatedAt: Date.now(),
        participants: new Map(),
        memberUserIds: new Set(),
        membersCheckedAt: 0
    };

    leagueLiveRaceStateByLeague.set(leagueId, created);
    return created;
};

const clearLeagueLiveState = (leagueId) => {
    leagueLiveRaceStateByLeague.delete(leagueId);
};

const upsertLeagueLiveParticipantState = (leagueId, userId, carState) => {
    const entry = ensureLeagueLiveStateEntry(leagueId);
    const normalized = normalizeLeagueLiveCarState(carState);
    const safeUserId = userId.toString();

    entry.participants.set(safeUserId, {
        userId: safeUserId,
        ...normalized,
        updatedAt: new Date().toISOString()
    });
    entry.memberUserIds.add(safeUserId);
    entry.updatedAt = Date.now();
};

const cacheLeagueLiveMembership = (leagueId, league) => {
    const entry = ensureLeagueLiveStateEntry(leagueId);
    entry.memberUserIds = new Set((league.members || []).map(member => getMemberUserId(member)).filter(Boolean));
    entry.membersCheckedAt = Date.now();
    entry.updatedAt = Date.now();
};

const hasFreshLeagueLiveMembership = (leagueId, userId) => {
    const entry = leagueLiveRaceStateByLeague.get(leagueId);
    if (!entry) return false;

    const age = Date.now() - Number(entry.membersCheckedAt || 0);
    if (age > LEAGUE_LIVE_MEMBERS_CACHE_MS) return false;

    return entry.memberUserIds.has(userId.toString());
};

const serializeLeagueLiveStates = (leagueId) => {
    const entry = leagueLiveRaceStateByLeague.get(leagueId);
    if (!entry) return [];

    return [...entry.participants.values()]
        .sort((a, b) => (b.totalProgress || 0) - (a.totalProgress || 0))
        .map((state, index) => ({
            ...state,
            position: index + 1
        }));
};

const sanitizeLevel = (value, fallback = 1) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(1, Math.floor(parsed));
};

const normalizeMemberHq = (member) => {
    const hq = member?.hq || {};
    return {
        engine: sanitizeLevel(hq.engine?.level),
        aero: sanitizeLevel(hq.aero?.level),
        drs: sanitizeLevel(hq.drs?.level),
        chassis: sanitizeLevel(hq.chassis?.level),
        market: sanitizeLevel(hq.market?.level)
    };
};

const getMemberCarRating = (member) => {
    const hq = normalizeMemberHq(member);
    return Math.round((hq.engine + hq.aero + hq.drs + hq.chassis) / 4);
};

const ensureStandingEntry = (league, userId) => {
    const existingIndex = league.currentSeason.standings.findIndex(
        standing => standing.user.toString() === userId.toString()
    );

    if (existingIndex !== -1) {
        return existingIndex;
    }

    league.currentSeason.standings.push({
        user: userId,
        points: 0,
        wins: 0,
        podiums: 0,
        position: league.currentSeason.standings.length + 1
    });
    league.updateStandings();

    return league.currentSeason.standings.findIndex(
        standing => standing.user.toString() === userId.toString()
    );
};

const buildLeagueStandings = (league) => {
    const standingsByUser = new Map();

    league.currentSeason.standings.forEach((standing) => {
        standingsByUser.set(standing.user.toString(), {
            userId: standing.user.toString(),
            points: standing.points || 0,
            wins: standing.wins || 0,
            podiums: standing.podiums || 0,
            position: standing.position || 999
        });
    });

    league.members.forEach((member) => {
        const userId = getMemberUserId(member);
        if (!userId) return;

        const standing = standingsByUser.get(userId) || {
            userId,
            points: 0,
            wins: 0,
            podiums: 0,
            position: 999
        };

        standing.points = Number.isFinite(member?.stats?.points) ? member.stats.points : standing.points;
        standing.wins = Number.isFinite(member?.stats?.wins) ? member.stats.wins : standing.wins;
        standing.podiums = Number.isFinite(member?.stats?.podiums) ? member.stats.podiums : standing.podiums;
        standing.racesCompleted = Number.isFinite(member?.stats?.racesCompleted) ? member.stats.racesCompleted : 0;
        standing.displayName = member?.user?.displayName || member?.user?.username || 'Manager';
        standing.username = member?.user?.username || standing.displayName;
        standing.teamName = member?.user?.teamName || 'Sin equipo';
        standing.avatar = member?.user?.avatar || null;
        standing.country = member?.user?.country || 'ES';

        standingsByUser.set(userId, standing);
    });

    const standings = Array.from(standingsByUser.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.podiums !== a.podiums) return b.podiums - a.podiums;
        return a.displayName.localeCompare(b.displayName, 'es');
    });

    standings.forEach((standing, index) => {
        standing.position = index + 1;
    });

    return standings;
};

const buildRaceCenterParticipants = (league) => {
    const currentRaceNumber = getCurrentRaceNumber(league);

    const participants = league.members.map((member) => {
        const userId = getMemberUserId(member);
        const hq = normalizeMemberHq(member);
        const strategy = {
            tyreCompound: member?.raceStrategy?.tyreCompound || 'medium',
            pitLap: Number.isFinite(member?.raceStrategy?.pitLap) ? member.raceStrategy.pitLap : null,
            plannedLaps: Number.isFinite(member?.raceStrategy?.plannedLaps) ? member.raceStrategy.plannedLaps : 20,
            updatedAt: member?.raceStrategy?.updatedAt || null
        };

        const hasCurrentQualifying = member?.qualifying?.raceNumber === currentRaceNumber
            && Number.isFinite(member?.qualifying?.lapTimeMs);

        return {
            userId,
            displayName: member?.user?.displayName || member?.user?.username || 'Manager',
            username: member?.user?.username || 'manager',
            teamName: member?.user?.teamName || 'Sin equipo',
            avatar: member?.user?.avatar || null,
            country: member?.user?.country || 'ES',
            pilot: member?.currentPilot || null,
            hq,
            carRating: getMemberCarRating(member),
            strategy,
            qualifying: {
                raceNumber: member?.qualifying?.raceNumber || currentRaceNumber,
                lapTimeMs: hasCurrentQualifying ? member.qualifying.lapTimeMs : null,
                lapTime: hasCurrentQualifying ? member.qualifying.lapTime : null,
                position: hasCurrentQualifying ? member.qualifying.position : null,
                updatedAt: hasCurrentQualifying ? member.qualifying.updatedAt : null
            },
            stats: {
                points: member?.stats?.points || 0,
                wins: member?.stats?.wins || 0,
                podiums: member?.stats?.podiums || 0,
                racesCompleted: member?.stats?.racesCompleted || 0
            }
        };
    });

    participants.sort((a, b) => {
        const aHasTime = Number.isFinite(a.qualifying.lapTimeMs);
        const bHasTime = Number.isFinite(b.qualifying.lapTimeMs);

        if (aHasTime && bHasTime) {
            return a.qualifying.lapTimeMs - b.qualifying.lapTimeMs;
        }
        if (aHasTime) return -1;
        if (bHasTime) return 1;

        if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
        if (b.stats.wins !== a.stats.wins) return b.stats.wins - a.stats.wins;
        return a.displayName.localeCompare(b.displayName, 'es');
    });

    participants.forEach((participant, index) => {
        participant.gridPosition = index + 1;
    });

    return participants;
};

const calculateQualifyingLapMs = (track, member) => {
    const baseMs = Number(track?.referenceLapMs) || 90000;
    const hq = normalizeMemberHq(member);

    const pilotOverall = Number(member?.currentPilot?.overall)
        || Number(member?.currentPilot?.level) * 2
        || 50;
    const tyreCompound = member?.raceStrategy?.tyreCompound || 'medium';

    const hqScore = hq.engine + hq.aero + hq.drs + hq.chassis;
    const hqBonus = -Math.round((hqScore - 4) * 38);
    const pilotBonus = -Math.round((pilotOverall - 50) * 24);
    const tyreBonus = TYRE_QUALIFYING_BONUS_MS[tyreCompound] || 0;
    const randomSpread = Math.round((Math.random() - 0.5) * 700);

    return Math.max(Math.round(baseMs * 0.86), baseMs + hqBonus + pilotBonus + tyreBonus + randomSpread);
};

const normalizeFinishOrder = (submittedResults, participants) => {
    const fallbackOrder = participants.map(participant => participant.userId);
    if (!Array.isArray(submittedResults)) {
        return fallbackOrder;
    }

    const knownIds = new Set(fallbackOrder);
    const finishOrder = [];

    submittedResults.forEach((result) => {
        const userId = typeof result === 'string'
            ? result
            : (result?.userId || result?.id || result?.managerId || null);
        if (!userId) return;

        const normalized = userId.toString();
        if (!knownIds.has(normalized)) return;
        if (finishOrder.includes(normalized)) return;
        finishOrder.push(normalized);
    });

    fallbackOrder.forEach((userId) => {
        if (!finishOrder.includes(userId)) {
            finishOrder.push(userId);
        }
    });

    return finishOrder;
};

const enforceShopPurchaseCooldown = (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        return next();
    }

    const now = Date.now();
    const nextAllowedAt = shopPurchaseCooldownByUser.get(userId) || 0;

    if (now < nextAllowedAt) {
        return res.status(429).json({
            success: false,
            message: 'Espera 2 segundos entre compras',
            retryAfterMs: nextAllowedAt - now
        });
    }

    shopPurchaseCooldownByUser.set(userId, now + SHOP_PURCHASE_COOLDOWN_MS);
    next();
};

// ===========================================
// ROUTES
// ===========================================

// GET /api/online/status - Check online mode access
router.get('/status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const hasAccess = canAccessOnline(user);
        const hqLevels = user.gameData?.hqLevels || {
            facilities: 1,
            engineering: 1,
            marketing: 1,
            staff: 1
        };
        
        res.json({
            success: true,
            hasAccess,
            hqLevels,
            requiredLevel: 5,
            online: ensureOnlineData(user.gameData.online || {})
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/online/profile - Get online profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (!canAccessOnline(user)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Online mode not unlocked. Reach level 5 in all HQ categories.' 
            });
        }
        
        const previousOnline = user.gameData.online || {};
        const synced = mergeOnlineData(previousOnline, {});
        user.gameData.online = synced;

        const levelData = calculateOnlineLevel(synced.xp || 0);
        levelData.level = synced.level;

        if (JSON.stringify(previousOnline) !== JSON.stringify(synced)) {
            user.markModified('gameData');
            await user.save();
        }
        
        res.json({
            success: true,
            profile: {
                username: user.username,
                displayName: user.displayName || user.username,
                teamName: user.teamName,
                avatar: user.avatar,
                country: user.country,
                coins: synced.coins || 0,
                level: synced.level || levelData.level,
                xp: synced.xp || 0,
                xpProgress: levelData,
                stats: {
                    totalRaces: synced.totalRaces || 0,
                    wins: synced.onlineWins || 0,
                    podiums: synced.onlinePodiums || 0
                },
                leagues: user.gameData.onlineLeagues || []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/online/shop - Get shop items
router.get('/shop', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            shop: {
                coinPackages: SHOP_CONFIG.coinPackages,
                moneyPackages: SHOP_CONFIG.moneyPackages
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/shop/buy-money - Buy in-game money with coins
router.post('/shop/buy-money', auth, enforceShopPurchaseCooldown, async (req, res) => {
    try {
        const { packageId } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const package_ = SHOP_CONFIG.moneyPackages.find(p => p.id === packageId);
        if (!package_) {
            return res.status(400).json({ success: false, message: 'Invalid package' });
        }

        user.gameData.online = mergeOnlineData(user.gameData.online || {}, {});
        
        const userCoins = user.gameData.online?.coins || 0;
        if (userCoins < package_.cost) {
            return res.status(400).json({ 
                success: false, 
                message: 'Not enough coins',
                required: package_.cost,
                current: userCoins
            });
        }
        
        // Deduct coins and add money
        user.gameData.online.coins -= package_.cost;
        user.gameData.budget += package_.money;
        await user.save();
        
        res.json({
            success: true,
            message: `Purchased ${package_.label} for ${package_.cost} coins`,
            newBalance: {
                coins: user.gameData.online.coins,
                budget: user.gameData.budget
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/xp/add - Add XP (for race results)
router.post('/xp/add', auth, async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const currentOnline = mergeOnlineData(user.gameData.online || {}, {});
        const oldLevel = currentOnline.level;

        const xpUpdate = addXpToOnlineData(currentOnline, amount || 0);
        user.gameData.online = xpUpdate.online;
        
        await user.save();
        
        const leveledUp = xpUpdate.online.level > oldLevel;
        
        res.json({
            success: true,
            xpAdded: amount,
            reason,
            leveledUp,
            newLevel: xpUpdate.online.level,
            xpProgress: xpUpdate.levelData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===========================================
// LEAGUE ROUTES
// ===========================================

// GET /api/online/leagues - Search/list leagues
router.get('/leagues', auth, async (req, res) => {
    try {
        const { search, country, page = 1, limit = 20 } = req.query;
        
        const leagues = await League.searchLeagues(search, {
            country,
            page: parseInt(page),
            limit: parseInt(limit)
        });
        
        res.json({
            success: true,
            leagues: leagues.map(l => l.getPublicInfo()),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: leagues.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/online/leagues/:id - Get league details
router.get('/leagues/:id', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id)
            .populate('members.user', 'username displayName teamName avatar country')
            .populate('creator', 'username displayName teamName avatar');
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        // Check if user is member for full info
        const isMember = league.members.some(m => m.user._id.toString() === req.user.id);
        const standings = isMember ? buildLeagueStandings(league) : [];
        const currentTrack = isMember ? getTrackForLeague(league) : null;

        if (isMember) {
            standings.forEach((entry) => {
                const standingIndex = ensureStandingEntry(league, entry.userId);
                if (standingIndex !== -1) {
                    league.currentSeason.standings[standingIndex].points = entry.points;
                    league.currentSeason.standings[standingIndex].wins = entry.wins;
                    league.currentSeason.standings[standingIndex].podiums = entry.podiums;
                    league.currentSeason.standings[standingIndex].position = entry.position;
                }
            });
            await league.save();
        }
        
        res.json({
            success: true,
            league: isMember ? league : league.getPublicInfo(),
            isMember,
            inviteCode: isMember && league.settings.isPrivate ? league.settings.inviteCode : null,
            standings,
            currentTrack
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/online/leagues/:id/standings - Real standings with all managers
router.get('/leagues/:id/standings', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id)
            .populate('members.user', 'username displayName teamName avatar country');

        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }

        const isMember = league.members.some(m => getMemberUserId(m) === req.user.id);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }

        const standings = buildLeagueStandings(league);
        standings.forEach((entry) => {
            const standingIndex = ensureStandingEntry(league, entry.userId);
            if (standingIndex !== -1) {
                league.currentSeason.standings[standingIndex].points = entry.points;
                league.currentSeason.standings[standingIndex].wins = entry.wins;
                league.currentSeason.standings[standingIndex].podiums = entry.podiums;
                league.currentSeason.standings[standingIndex].position = entry.position;
            }
        });

        await league.save();

        res.json({
            success: true,
            raceNumber: getCurrentRaceNumber(league),
            standings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/online/leagues/:id/race-center - Race briefing + qualifying grid
router.get('/leagues/:id/race-center', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id)
            .populate('members.user', 'username displayName teamName avatar country');

        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }

        const isMember = league.members.some(m => getMemberUserId(m) === req.user.id);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }

        const schedule = getLeagueRaceScheduleStatus(league);
        const track = getTrackForLeague(league);
        const participants = buildRaceCenterParticipants(league);
        const standings = buildLeagueStandings(league);
        const myParticipant = participants.find(participant => participant.userId === req.user.id) || null;

        res.json({
            success: true,
            raceNumber: schedule.currentRaceNumber,
            track,
            participants,
            standings,
            myParticipant,
            schedule
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const saveRaceStrategyHandler = async (req, res) => {
    try {
        const { tyreCompound, pitLap, plannedLaps } = req.body;
        const league = await League.findById(req.params.id);

        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }

        const memberIndex = league.members.findIndex(m => m.user.toString() === req.user.id);
        if (memberIndex === -1) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }

        const safeTyre = ['soft', 'medium', 'hard'].includes(tyreCompound) ? tyreCompound : 'medium';
        const parsedPitLap = Number.isFinite(Number(pitLap)) ? Math.max(1, Math.floor(Number(pitLap))) : null;
        const parsedPlannedLaps = Number.isFinite(Number(plannedLaps))
            ? Math.max(8, Math.min(40, Math.floor(Number(plannedLaps))))
            : 20;

        league.members[memberIndex].raceStrategy = {
            tyreCompound: safeTyre,
            pitLap: parsedPitLap,
            plannedLaps: parsedPlannedLaps,
            updatedAt: new Date()
        };

        await league.save();

        res.json({
            success: true,
            strategy: league.members[memberIndex].raceStrategy
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const qualifyRaceHandler = async (req, res) => {
    try {
        const league = await League.findById(req.params.id)
            .populate('members.user', 'username displayName teamName avatar country');

        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }

        const memberIndex = league.members.findIndex(m => getMemberUserId(m) === req.user.id);
        if (memberIndex === -1) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }

        const schedule = getLeagueRaceScheduleStatus(league);
        if (!schedule.canRaceNow) {
            return res.status(403).json({
                success: false,
                message: schedule.message,
                schedule
            });
        }

        const member = league.members[memberIndex];
        const maxRacesPerDay = 1;
        const racesToday = getMemberRacesToday(member, schedule.timezone);
        if (racesToday >= maxRacesPerDay) {
            return res.status(403).json({
                success: false,
                message: `Has alcanzado el limite de ${maxRacesPerDay} carrera diaria`,
                reason: 'daily_limit',
                racesToday,
                maxRacesPerDay,
                schedule
            });
        }

        if (!member.currentPilot) {
            return res.status(400).json({
                success: false,
                message: 'Necesitas un piloto contratado para clasificar'
            });
        }

        const raceNumber = schedule.currentRaceNumber;
        const track = getTrackForLeague(league);
        const lapTimeMs = calculateQualifyingLapMs(track, member);

        member.qualifying = {
            lapTimeMs,
            lapTime: formatLapTime(lapTimeMs),
            position: null,
            raceNumber,
            updatedAt: new Date()
        };

        const participants = buildRaceCenterParticipants(league);
        participants.forEach((participant) => {
            const idx = league.members.findIndex(memberEntry => getMemberUserId(memberEntry) === participant.userId);
            if (idx !== -1) {
                league.members[idx].qualifying.position = participant.gridPosition;
                league.members[idx].qualifying.raceNumber = raceNumber;
            }
        });

        await league.save();

        const myParticipant = participants.find(participant => participant.userId === req.user.id);

        res.json({
            success: true,
            raceNumber,
            track,
            lapTime: member.qualifying.lapTime,
            lapTimeMs: member.qualifying.lapTimeMs,
            position: myParticipant?.gridPosition || null,
            participants,
            schedule
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/online/leagues/:id/race/strategy - Save strategy for current race
router.post('/leagues/:id/race/strategy', auth, saveRaceStrategyHandler);
// Compatibility aliases
router.post('/leagues/:id/strategy', auth, saveRaceStrategyHandler);

// POST /api/online/leagues/:id/race/qualify - Save one-lap qualifying for the manager
router.post('/leagues/:id/race/qualify', auth, qualifyRaceHandler);
// Compatibility aliases
router.post('/leagues/:id/race/qualifying', auth, qualifyRaceHandler);
router.post('/leagues/:id/qualify', auth, qualifyRaceHandler);

// GET /api/online/leagues/:id/race/live-state - Get synchronized live race states
router.get('/leagues/:id/race/live-state', auth, async (req, res) => {
    try {
        const leagueId = req.params.id;
        pruneStaleLeagueLiveStates();

        if (!hasFreshLeagueLiveMembership(leagueId, req.user.id)) {
            const league = await League.findById(leagueId).select('members status');
            if (!league) {
                return res.status(404).json({ success: false, message: 'League not found' });
            }

            const isMember = league.members.some(member => getMemberUserId(member) === req.user.id);
            if (!isMember) {
                return res.status(403).json({ success: false, message: 'Not a member of this league' });
            }

            cacheLeagueLiveMembership(leagueId, league);
        }

        res.json({
            success: true,
            serverTime: new Date().toISOString(),
            states: serializeLeagueLiveStates(leagueId)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues/:id/race/live-state - Upsert member live car state and return synchronized states
router.post('/leagues/:id/race/live-state', auth, async (req, res) => {
    try {
        const leagueId = req.params.id;
        pruneStaleLeagueLiveStates();

        if (!hasFreshLeagueLiveMembership(leagueId, req.user.id)) {
            const league = await League.findById(leagueId).select('members status');
            if (!league) {
                return res.status(404).json({ success: false, message: 'League not found' });
            }

            const isMember = league.members.some(member => getMemberUserId(member) === req.user.id);
            if (!isMember) {
                return res.status(403).json({ success: false, message: 'Not a member of this league' });
            }

            cacheLeagueLiveMembership(leagueId, league);
        }

        if (req.body && typeof req.body.carState === 'object' && req.body.carState) {
            upsertLeagueLiveParticipantState(leagueId, req.user.id, req.body.carState);
        }

        res.json({
            success: true,
            serverTime: new Date().toISOString(),
            states: serializeLeagueLiveStates(leagueId)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues/:id/race/complete-multiplayer - Apply multiplayer race results
router.post('/leagues/:id/race/complete-multiplayer', auth, async (req, res) => {
    try {
        const { results, trackId, laps } = req.body;
        const league = await League.findById(req.params.id)
            .populate('members.user', 'username displayName teamName avatar country');

        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }

        const requesterMemberIndex = league.members.findIndex(member => getMemberUserId(member) === req.user.id);
        if (requesterMemberIndex === -1) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }

        const schedule = getLeagueRaceScheduleStatus(league);
        if (!schedule.canRaceNow) {
            return res.status(403).json({
                success: false,
                message: schedule.message,
                schedule
            });
        }

        const maxRacesPerDay = 1;
        const requesterRacesToday = getMemberRacesToday(league.members[requesterMemberIndex], schedule.timezone);
        if (requesterRacesToday >= maxRacesPerDay) {
            return res.status(403).json({
                success: false,
                message: `Has alcanzado el limite de ${maxRacesPerDay} carrera diaria`,
                reason: 'daily_limit',
                racesToday: requesterRacesToday,
                maxRacesPerDay,
                schedule
            });
        }

        const participants = buildRaceCenterParticipants(league);
        if (participants.length < 2) {
            return res.status(400).json({ success: false, message: 'Se necesitan al menos 2 managers para cerrar la carrera' });
        }

        const finishOrder = normalizeFinishOrder(results, participants);
        const users = await User.find({ _id: { $in: finishOrder } });
        const usersById = new Map(users.map(user => [user._id.toString(), user]));

        const raceNumber = schedule.currentRaceNumber;
        const track = TRACK_CATALOG[trackId] || getTrackForLeague(league);
        const raceResults = [];

        finishOrder.forEach((userId, index) => {
            const position = index + 1;
            const points = F1_POINTS_TABLE[index] || 0;
            const xpEarned = getXpForRacePosition(position, finishOrder.length);
            const moneyEarned = RACE_MONEY_TABLE[index] || 75000;

            const memberIndex = league.members.findIndex(member => getMemberUserId(member) === userId);
            if (memberIndex !== -1) {
                const member = league.members[memberIndex];
                member.stats.points = (member.stats.points || 0) + points;
                member.stats.racesCompleted = (member.stats.racesCompleted || 0) + 1;
                member.dailyRacesCount = {
                    date: new Date(),
                    count: 1
                };
                if (position === 1) {
                    member.stats.wins = (member.stats.wins || 0) + 1;
                }
                if (position <= 3) {
                    member.stats.podiums = (member.stats.podiums || 0) + 1;
                }
            }

            const standingIndex = ensureStandingEntry(league, userId);
            if (standingIndex !== -1) {
                league.currentSeason.standings[standingIndex].points += points;
                if (position === 1) {
                    league.currentSeason.standings[standingIndex].wins += 1;
                }
                if (position <= 3) {
                    league.currentSeason.standings[standingIndex].podiums += 1;
                }
            }

            const user = usersById.get(userId);
            if (user) {
                const xpUpdate = addXpToOnlineData(user.gameData.online || {}, xpEarned);
                user.gameData.online = xpUpdate.online;
                user.gameData.online.totalRaces = (user.gameData.online.totalRaces || 0) + 1;
                if (position === 1) {
                    user.gameData.online.onlineWins = (user.gameData.online.onlineWins || 0) + 1;
                }
                if (position <= 3) {
                    user.gameData.online.onlinePodiums = (user.gameData.online.onlinePodiums || 0) + 1;
                }

                user.gameData.budget = (user.gameData.budget || 0) + moneyEarned;

                user.gameData.globalRanking = user.gameData.globalRanking || { rank: 'learner', totalWins: 0, currentSeason: { wins: 0, races: 0 } };
                user.gameData.globalRanking.currentSeason = user.gameData.globalRanking.currentSeason || { wins: 0, races: 0 };
                user.gameData.globalRanking.currentSeason.races = (user.gameData.globalRanking.currentSeason.races || 0) + 1;
                if (position === 1) {
                    user.gameData.globalRanking.totalWins = (user.gameData.globalRanking.totalWins || 0) + 1;
                    user.gameData.globalRanking.currentSeason.wins = (user.gameData.globalRanking.currentSeason.wins || 0) + 1;
                }
            }

            const participantInfo = participants.find(participant => participant.userId === userId);
            raceResults.push({
                position,
                user: userId,
                points,
                xpEarned,
                time: null,
                displayName: participantInfo?.displayName || 'Manager',
                teamName: participantInfo?.teamName || 'Sin equipo'
            });
        });

        league.updateStandings();
        league.currentSeason.currentRace = raceNumber;

        league.members.forEach((member) => {
            member.qualifying = {
                lapTimeMs: null,
                lapTime: null,
                position: null,
                raceNumber: raceNumber + 1,
                updatedAt: null
            };
        });

        league.raceHistory.push({
            raceNumber,
            circuit: track.name,
            date: new Date(),
            results: raceResults.map(result => ({
                position: result.position,
                user: result.user,
                points: result.points,
                time: result.time,
                xpEarned: result.xpEarned
            }))
        });
        if (league.raceHistory.length > 120) {
            league.raceHistory = league.raceHistory.slice(-120);
        }

        await Promise.all(users.map(async (user) => {
            user.markModified('gameData');
            await user.save();
        }));
        await league.save();
        clearLeagueLiveState(req.params.id);

        const standings = buildLeagueStandings(league);

        res.json({
            success: true,
            raceNumber,
            track,
            laps: Number.isFinite(Number(laps)) ? Number(laps) : track.laps,
            results: raceResults,
            standings,
            schedule: getLeagueRaceScheduleStatus(league)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues - Create a new league
router.post('/leagues', auth, async (req, res) => {
    try {
        const { name, description, logo, country, schedule, settings } = req.body;
        const user = await User.findById(req.user.id);
        const safeSchedule = sanitizeLeagueScheduleInput(schedule || {}, true);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (!canAccessOnline(user)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Online mode not unlocked' 
            });
        }
        
        // Check budget
        if (user.gameData.budget < SHOP_CONFIG.leagueCreationCost) {
            return res.status(400).json({
                success: false,
                message: 'Not enough budget to create a league',
                required: SHOP_CONFIG.leagueCreationCost,
                current: user.gameData.budget
            });
        }
        
        // Deduct creation cost
        user.gameData.budget -= SHOP_CONFIG.leagueCreationCost;
        
        // Create league
        const league = new League({
            name,
            description,
            logo,
            country: country || user.country,
            schedule: safeSchedule,
            dailyRaces: {
                maxRacesPerDay: 1,
                restDays: [0, 6]
            },
            settings: settings || {},
            creator: user._id,
            members: [{
                user: user._id,
                role: 'owner',
                joinedAt: new Date()
            }]
        });
        
        // Initialize standings
        league.currentSeason.standings = [{
            user: user._id,
            points: 0,
            wins: 0,
            podiums: 0,
            position: 1
        }];
        
        await league.save();
        
        // Add league to user's list
        user.gameData.onlineLeagues = user.gameData.onlineLeagues || [];
        user.gameData.onlineLeagues.push(league._id);
        await user.save();
        
        res.status(201).json({
            success: true,
            message: 'League created successfully',
            league: league.getPublicInfo(),
            newBudget: user.gameData.budget
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues/:id/join - Join a league
router.post('/leagues/:id/join', auth, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const league = await League.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (!canAccessOnline(user)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Online mode not unlocked' 
            });
        }
        
        // Check level requirement
        const userLevel = mergeOnlineData(user.gameData.online || {}, {}).level;
        if (userLevel < league.settings.minLevel) {
            return res.status(403).json({
                success: false,
                message: `Minimum level ${league.settings.minLevel} required`,
                currentLevel: userLevel
            });
        }
        
        // Check if private and invite code
        if (league.settings.isPrivate) {
            if (!inviteCode || inviteCode !== league.settings.inviteCode) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid invite code'
                });
            }
        }
        
        // Add member
        await league.addMember(user._id);
        
        // Add league to user's list
        user.gameData.onlineLeagues = user.gameData.onlineLeagues || [];
        if (!user.gameData.onlineLeagues.includes(league._id)) {
            user.gameData.onlineLeagues.push(league._id);
            await user.save();
        }
        
        res.json({
            success: true,
            message: 'Joined league successfully',
            league: league.getPublicInfo()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues/:id/leave - Leave a league
router.post('/leagues/:id/leave', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        await league.removeMember(user._id);
        
        // Remove from user's list
        user.gameData.onlineLeagues = user.gameData.onlineLeagues.filter(
            id => id.toString() !== league._id.toString()
        );
        await user.save();
        
        res.json({
            success: true,
            message: 'Left league successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/online/leagues/:id - Update league (owner/admin only)
router.put('/leagues/:id', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        // Check permissions
        const member = league.members.find(m => m.user.toString() === req.user.id);
        if (!member || !['owner', 'admin'].includes(member.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to edit this league' 
            });
        }
        
        const { name, description, logo, schedule, settings } = req.body;
        
        if (name) league.name = name;
        if (description !== undefined) league.description = description;
        if (logo !== undefined) league.logo = logo;
        if (schedule) {
            league.schedule = {
                ...league.schedule,
                ...sanitizeLeagueScheduleInput(schedule, true)
            };
            league.dailyRaces.maxRacesPerDay = 1;
            league.dailyRaces.restDays = [0, 6];
        }
        if (settings) {
            // Only owner can change certain settings
            if (member.role === 'owner') {
                league.settings = { ...league.settings, ...settings };
            }
        }
        
        await league.save();
        
        res.json({
            success: true,
            message: 'League updated successfully',
            league: league.getPublicInfo()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/online/leagues/:id - Delete a league (owner only)
router.delete('/leagues/:id', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        // Solo el creador puede eliminar la liga
        if (league.creator.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only the league creator can delete this league' 
            });
        }
        
        // Eliminar la liga de todos los miembros
        const memberIds = league.members.map(m => m.user);
        await User.updateMany(
            { _id: { $in: memberIds } },
            { $pull: { 'gameData.onlineLeagues': league._id } }
        );
        
        // Eliminar la liga
        await League.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'League deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/online/my-leagues - Get user's leagues
router.get('/my-leagues', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const leagues = await League.find({
            _id: { $in: user.gameData.onlineLeagues || [] }
        }).populate('creator', 'username displayName teamName avatar');
        
        res.json({
            success: true,
            leagues: leagues.map(l => ({
                ...l.getPublicInfo(),
                myRole: l.members.find(m => m.user.toString() === req.user.id)?.role
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===========================================
// LEAGUE HQ ROUTES
// ===========================================

// HQ Upgrade costs (base cost * 1.35^(nextLevel-1))
const HQ_CONFIG = {
    components: {
        engine: { baseCost: 500000, maxLevel: 50 },
        aero: { baseCost: 600000, maxLevel: 50 },
        drs: { baseCost: 700000, maxLevel: 50 },
        chassis: { baseCost: 800000, maxLevel: 50 },
        market: { baseCost: 1000000, maxLevel: 50 }
    },
    calculateCost: (component, level) => {
        const base = HQ_CONFIG.components[component]?.baseCost || 500000;
        const safeLevel = Math.max(1, Number(level) || 1);
        return Math.floor(base * Math.pow(1.35, safeLevel - 1));
    }
};

// GET /api/online/leagues/:id/hq - Get user's HQ for this league
router.get('/leagues/:id/hq', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        // Check if user is member
        const memberData = league.members.find(m => m.user.toString() === req.user.id);
        if (!memberData) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }
        
        // Get or initialize user's HQ for this league
        const userHQ = memberData.hq || {
            engine: { level: 1 },
            aero: { level: 1 },
            drs: { level: 1 },
            chassis: { level: 1 },
            market: { level: 1 }
        };
        
        // Calculate next upgrade costs using known components only
        const hqWithCosts = {};
        Object.keys(HQ_CONFIG.components).forEach((component) => {
            const level = sanitizeLevel(userHQ?.[component]?.level);
            hqWithCosts[component] = {
                level,
                nextCost: HQ_CONFIG.calculateCost(component, level + 1),
                maxLevel: HQ_CONFIG.components[component]?.maxLevel || 50
            };
        });
        
        res.json({
            success: true,
            hq: hqWithCosts,
            pilot: memberData.currentPilot || null,
            accountLevel: mergeOnlineData(user.gameData?.online || {}, {}).level
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues/:id/hq/upgrade - Upgrade a HQ component
router.post('/leagues/:id/hq/upgrade', auth, async (req, res) => {
    try {
        const { component } = req.body;
        const league = await League.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        if (!HQ_CONFIG.components[component]) {
            return res.status(400).json({ success: false, message: 'Invalid component' });
        }
        
        // Find member
        const memberIndex = league.members.findIndex(m => m.user.toString() === req.user.id);
        if (memberIndex === -1) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }
        
        // Initialize HQ if needed
        if (!league.members[memberIndex].hq) {
            league.members[memberIndex].hq = {
                engine: { level: 1 },
                aero: { level: 1 },
                drs: { level: 1 },
                chassis: { level: 1 },
                market: { level: 1 }
            };
        }
        
        const currentLevel = sanitizeLevel(league.members[memberIndex].hq[component]?.level);
        const accountLevel = mergeOnlineData(user.gameData?.online || {}, {}).level;
        
        // Check level limit
        if (currentLevel >= accountLevel) {
            return res.status(403).json({
                success: false,
                message: `Account level ${accountLevel} cannot upgrade beyond level ${accountLevel}`,
                currentLevel,
                accountLevel
            });
        }
        
        // Check max level
        if (currentLevel >= HQ_CONFIG.components[component].maxLevel) {
            return res.status(400).json({
                success: false,
                message: 'Component already at maximum level'
            });
        }
        
        // Calculate cost
        const cost = HQ_CONFIG.calculateCost(component, currentLevel + 1);
        
        // Check budget
        if (user.gameData.budget < cost) {
            return res.status(400).json({
                success: false,
                message: 'Not enough budget',
                required: cost,
                current: user.gameData.budget
            });
        }
        
        // Deduct cost and upgrade
        user.gameData.budget -= cost;
        league.members[memberIndex].hq[component].level = currentLevel + 1;
        
        await user.save();
        await league.save();
        
        res.json({
            success: true,
            message: `${component} upgraded to level ${currentLevel + 1}`,
            newLevel: currentLevel + 1,
            newBudget: user.gameData.budget,
            nextCost: HQ_CONFIG.calculateCost(component, currentLevel + 2)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===========================================
// LEAGUE PILOT ROUTES
// ===========================================

// POST /api/online/leagues/:id/pilot/hire - Hire a pilot
router.post('/leagues/:id/pilot/hire', auth, async (req, res) => {
    try {
        const { pilot } = req.body;
        const league = await League.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        // Find member
        const memberIndex = league.members.findIndex(m => m.user.toString() === req.user.id);
        if (memberIndex === -1) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }
        
        // Check budget
        if (user.gameData.budget < pilot.price) {
            return res.status(400).json({
                success: false,
                message: 'Not enough budget',
                required: pilot.price,
                current: user.gameData.budget
            });
        }
        
        // Deduct cost and hire
        user.gameData.budget -= pilot.price;
        league.members[memberIndex].currentPilot = pilot;
        
        await user.save();
        await league.save();
        
        res.json({
            success: true,
            message: `Hired ${pilot.name}`,
            pilot: pilot,
            newBudget: user.gameData.budget
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues/:id/pilot/sell - Sell current pilot
router.post('/leagues/:id/pilot/sell', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        // Find member
        const memberIndex = league.members.findIndex(m => m.user.toString() === req.user.id);
        if (memberIndex === -1) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }
        
        const currentPilot = league.members[memberIndex].currentPilot;
        if (!currentPilot) {
            return res.status(400).json({ success: false, message: 'No pilot to sell' });
        }
        
        // Calculate sell price (70% of original)
        const sellPrice = Math.floor(currentPilot.price * 0.7);
        
        // Add money and remove pilot
        user.gameData.budget += sellPrice;
        league.members[memberIndex].currentPilot = null;
        
        await user.save();
        await league.save();
        
        res.json({
            success: true,
            message: `Sold pilot for ${sellPrice}`,
            sellPrice,
            newBudget: user.gameData.budget
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===========================================
// DAILY RACES SYSTEM
// ===========================================

// GET /api/online/leagues/:id/daily-status - Check if user can race today
router.get('/leagues/:id/daily-status', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }

        const memberIndex = league.members.findIndex(m => m.user.toString() === req.user.id);
        if (memberIndex === -1) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }

        const schedule = getLeagueRaceScheduleStatus(league);
        const maxRacesPerDay = 1;

        const member = league.members[memberIndex];
        const racesToday = getMemberRacesToday(member, schedule.timezone);
        const dailyLimitReached = racesToday >= maxRacesPerDay;
        const canRace = schedule.canRaceNow && !dailyLimitReached;
        const racesRemaining = canRace ? (maxRacesPerDay - racesToday) : 0;
        const reason = canRace
            ? null
            : (schedule.canRaceNow ? 'daily_limit' : 'scheduled_window');
        const message = canRace
            ? `Carrera ${schedule.currentRaceNumber} disponible`
            : (dailyLimitReached
                ? `Has alcanzado el limite de ${maxRacesPerDay} carrera diaria`
                : schedule.message);
        
        res.json({
            success: true,
            canRace,
            racesToday,
            racesRemaining,
            maxRacesPerDay,
            restDays: league.dailyRaces.restDays,
            isRestDay: schedule.isRestDay,
            reason,
            message,
            schedule
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues/:id/race/complete - Complete a race and award XP
router.post('/leagues/:id/race/complete', auth, async (req, res) => {
    try {
        const { position, raceData } = req.body;
        const league = await League.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const memberIndex = league.members.findIndex(m => m.user.toString() === req.user.id);
        if (memberIndex === -1) {
            return res.status(403).json({
                success: false,
                message: 'Not a member of this league',
                reason: 'not_member'
            });
        }

        const schedule = getLeagueRaceScheduleStatus(league);
        const maxRacesPerDay = 1;
        const racesToday = getMemberRacesToday(league.members[memberIndex], schedule.timezone);

        if (!schedule.canRaceNow || racesToday >= maxRacesPerDay) {
            return res.status(403).json({
                success: false,
                message: !schedule.canRaceNow
                    ? schedule.message
                    : `Has alcanzado el limite de ${maxRacesPerDay} carrera diaria`,
                reason: !schedule.canRaceNow ? 'scheduled_window' : 'daily_limit',
                schedule
            });
        }
        
        // XP progresivo: P1 = 100, bajando por posición
        const xpEarned = getXpForRacePosition(position, Math.max(2, league.members.length));

        // Update user's XP
        const currentOnline = mergeOnlineData(user.gameData.online || {}, {});
        const oldLevel = currentOnline.level;
        const xpUpdate = addXpToOnlineData(currentOnline, xpEarned);

        user.gameData.online = xpUpdate.online;
        user.gameData.online.totalRaces = (user.gameData.online.totalRaces || 0) + 1;
        
        if (position === 1) {
            user.gameData.online.onlineWins = (user.gameData.online.onlineWins || 0) + 1;
        }
        if (position <= 3) {
            user.gameData.online.onlinePodiums = (user.gameData.online.onlinePodiums || 0) + 1;
        }
        
        const newLevelData = {
            ...xpUpdate.levelData,
            level: user.gameData.online.level
        };
        
        // Increment daily race count
        await league.incrementDailyRaceCount(req.user.id);
        
        // Update league standings
        if (memberIndex !== -1) {
            league.members[memberIndex].stats.racesCompleted++;
            if (position === 1) league.members[memberIndex].stats.wins++;
            if (position <= 3) league.members[memberIndex].stats.podiums++;
            
            // Add points (F1 system)
            const pointsTable = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
            const points = position <= 10 ? pointsTable[position - 1] : 0;
            league.members[memberIndex].stats.points += points;
            
            // Update standings
            const standingIndex = league.currentSeason.standings.findIndex(
                s => s.user.toString() === req.user.id
            );
            if (standingIndex !== -1) {
                league.currentSeason.standings[standingIndex].points += points;
                if (position === 1) league.currentSeason.standings[standingIndex].wins++;
                if (position <= 3) league.currentSeason.standings[standingIndex].podiums++;
            }
            league.updateStandings();
            
        }
        
        await user.save();
        await league.save();
        
        const leveledUp = user.gameData.online.level > oldLevel;
        const scheduleAfter = getLeagueRaceScheduleStatus(league);
        const racesTodayAfter = getMemberRacesToday(league.members[memberIndex], scheduleAfter.timezone);
        
        res.json({
            success: true,
            xpEarned,
            position,
            leveledUp,
            newLevel: user.gameData.online.level,
            xpProgress: newLevelData,
            racesRemaining: Math.max(0, maxRacesPerDay - racesTodayAfter),
            racesToday: racesTodayAfter,
            schedule: scheduleAfter
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===========================================
// LEAGUE CHAT ROUTES
// ===========================================

// GET /api/online/leagues/:id/chat - Get league chat messages
router.get('/leagues/:id/chat', auth, async (req, res) => {
    try {
        const { limit = 50, before } = req.query;
        const league = await League.findById(req.params.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        // Check membership
        const isMember = league.members.some(m => m.user.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }
        
        let messages = league.chat || [];
        
        // Filter by date if 'before' provided
        if (before) {
            const beforeDate = new Date(before);
            messages = messages.filter(m => new Date(m.timestamp) < beforeDate);
        }
        
        // Get last N messages
        messages = messages.slice(-parseInt(limit));
        
        res.json({
            success: true,
            messages,
            total: league.chat.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues/:id/chat - Send a message
router.post('/leagues/:id/chat', auth, async (req, res) => {
    try {
        const { message } = req.body;
        const league = await League.findById(req.params.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        // Check membership
        const isMember = league.members.some(m => m.user.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Not a member of this league' });
        }
        
        // Validate message
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty' });
        }
        
        if (message.length > 500) {
            return res.status(400).json({ success: false, message: 'Message too long (max 500 chars)' });
        }
        
        const newMessage = await league.addChatMessage(req.user.id, message.trim(), 'message');
        
        res.json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===========================================
// PAYMENT SYSTEM (Stripe Integration)
// ===========================================

// POST /api/online/shop/buy-coins-simulated - Simulate coin purchase (DEMO MODE)
router.post('/shop/buy-coins-simulated', auth, enforceShopPurchaseCooldown, async (req, res) => {
    try {
        const { packageId } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const package_ = SHOP_CONFIG.coinPackages.find(p => p.id === packageId);
        if (!package_) {
            return res.status(400).json({ success: false, message: 'Invalid package' });
        }
        
        // SIMULATED PURCHASE - Add coins immediately
        user.gameData.online = mergeOnlineData(user.gameData.online || {}, {
            coins: (user.gameData.online?.coins || 0) + package_.coins
        });
        await user.save();
        
        res.json({
            success: true,
            message: `¡Compra simulada! Has recibido ${package_.coins} coins`,
            simulation: true,
            package: {
                id: package_.id,
                coins: package_.coins,
                price: package_.price,
                currency: package_.currency
            },
            newBalance: {
                coins: user.gameData.online.coins
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/shop/create-checkout - Create Stripe checkout session
router.post('/shop/create-checkout', auth, async (req, res) => {
    try {
        const { packageId } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const package_ = SHOP_CONFIG.coinPackages.find(p => p.id === packageId);
        if (!package_) {
            return res.status(400).json({ success: false, message: 'Invalid package' });
        }
        
        // NOTE: This is a placeholder for Stripe integration
        // To enable real payments, you need to:
        // 1. Create a Stripe account at https://stripe.com
        // 2. Get your API keys from Stripe Dashboard
        // 3. Install stripe: npm install stripe
        // 4. Configure webhook endpoint for payment confirmation
        
        /* 
        // STRIPE INTEGRATION CODE:
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: package_.currency.toLowerCase(),
                    product_data: {
                        name: `${package_.coins} Coins - MS Manager`,
                        description: `Pack de ${package_.coins} coins para MS Manager`,
                    },
                    unit_amount: Math.round(package_.price * 100), // Stripe uses cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/online.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/online.html?payment=cancelled`,
            client_reference_id: user._id.toString(),
            metadata: {
                userId: user._id.toString(),
                packageId: package_.id,
                coins: package_.coins.toString()
            }
        });
        
        return res.json({
            success: true,
            checkoutUrl: session.url,
            sessionId: session.id
        });
        */
        
        // Temporary: Return info about setting up payments
        res.json({
            success: false,
            message: 'Payment system not configured yet',
            setupInstructions: {
                step1: 'Create a Stripe account at https://stripe.com',
                step2: 'Get your API keys from the Stripe Dashboard',
                step3: 'Add STRIPE_SECRET_KEY to your .env file',
                step4: 'Uncomment the Stripe code in this route',
                step5: 'Set up a webhook endpoint for payment confirmations'
            },
            package: package_
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/shop/webhook - Stripe webhook for payment confirmation
router.post('/shop/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    // NOTE: This endpoint handles Stripe webhooks
    // When a payment is completed, Stripe sends a notification here
    
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Get user and add coins
        const userId = session.client_reference_id;
        const coins = parseInt(session.metadata.coins);
        
        const user = await User.findById(userId);
        if (user) {
            user.gameData.online = user.gameData.online || {};
            user.gameData.online.coins = (user.gameData.online.coins || 0) + coins;
            await user.save();
            
            console.log(`Added ${coins} coins to user ${userId}`);
        }
    }
    */
    
    res.json({ received: true });
});

// POST /api/online/shop/verify-payment - Verify a completed payment (for testing)
router.post('/shop/verify-payment', auth, async (req, res) => {
    try {
        const { sessionId, packageId } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const package_ = SHOP_CONFIG.coinPackages.find(p => p.id === packageId);
        if (!package_) {
            return res.status(400).json({ success: false, message: 'Invalid package' });
        }
        
        // NOTE: In production, verify with Stripe API
        // This is just for testing purposes
        
        /*
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status !== 'paid') {
            return res.status(400).json({ success: false, message: 'Payment not completed' });
        }
        
        // Verify it's for this user
        if (session.client_reference_id !== user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Payment not for this user' });
        }
        */
        
        res.json({
            success: false,
            message: 'Payment verification not implemented - use Stripe webhook'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
