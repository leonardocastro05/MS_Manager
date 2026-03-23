const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const User = require('../models/User');
const League = require('../models/League');
const Race = require('../models/Race');

// ===========================================
// RACE CONFIGURATION
// ===========================================
const RACE_CONFIG = {
    // Points per position
    points: {
        1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
        6: 8, 7: 6, 8: 4, 9: 2, 10: 1
    },
    
    // XP per position
    xp: {
        1: 200, 2: 150, 3: 120, 4: 100, 5: 80,
        6: 60, 7: 50, 8: 40, 9: 30, 10: 25
    },
    
    // Money per position (multiplied by league tier)
    money: {
        1: 500000, 2: 350000, 3: 250000, 4: 200000, 5: 150000,
        6: 100000, 7: 80000, 8: 60000, 9: 40000, 10: 30000
    },
    
    // Tyre compounds
    tyres: {
        soft: { grip: 1.1, degradation: 3 },
        medium: { grip: 1.0, degradation: 2 },
        hard: { grip: 0.9, degradation: 1 }
    },
    
    // Fuel consumption per lap (kg)
    fuelConsumption: 1.8,
    
    // Pit stop base time (seconds)
    pitStopTime: 2.5
};

// ===========================================
// GET ACTIVE RACE FOR A LEAGUE
// ===========================================
router.get('/league/:leagueId/active', auth, async (req, res) => {
    try {
        const { leagueId } = req.params;
        
        // Check if user is member of the league
        const league = await League.findById(leagueId);
        if (!league) {
            return res.status(404).json({ success: false, message: 'Liga no encontrada' });
        }
        
        const isMember = league.members.some(m => m.user.toString() === req.user.id);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'No eres miembro de esta liga' });
        }
        
        // Find active race (scheduled or racing)
        let race = await Race.findOne({
            league: leagueId,
            status: { $in: ['scheduled', 'practice', 'qualifying', 'racing'] }
        }).populate('liveState.participants.user', 'username teamName');
        
        // If no active race, create one
        if (!race) {
            race = await createNewRace(league);
        }
        
        res.json({
            success: true,
            race: race
        });
        
    } catch (error) {
        console.error('Get active race error:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// ===========================================
// GET RACE BY ID
// ===========================================
router.get('/:raceId', auth, async (req, res) => {
    try {
        const race = await Race.findById(req.params.raceId)
            .populate('league', 'name settings')
            .populate('liveState.participants.user', 'username teamName');
        
        if (!race) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        
        res.json({ success: true, race });
        
    } catch (error) {
        console.error('Get race error:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// ===========================================
// JOIN RACE
// ===========================================
router.post('/:raceId/join', auth, async (req, res) => {
    try {
        const race = await Race.findById(req.params.raceId);
        
        if (!race) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        
        if (!['scheduled', 'practice', 'qualifying'].includes(race.status)) {
            return res.status(400).json({ success: false, message: 'No puedes unirte a esta carrera' });
        }
        
        // Check if already joined
        const alreadyJoined = race.liveState.participants.some(
            p => p.user.toString() === req.user.id
        );
        
        if (alreadyJoined) {
            return res.json({ success: true, message: 'Ya estás en la carrera', race });
        }
        
        // Get user and league member data
        const user = await User.findById(req.user.id);
        const league = await League.findById(race.league);
        const member = league.members.find(m => m.user.toString() === req.user.id);
        
        if (!member) {
            return res.status(403).json({ success: false, message: 'No eres miembro de esta liga' });
        }
        
        // Add participant
        const position = race.liveState.participants.length + 1;
        
        race.liveState.participants.push({
            user: req.user.id,
            pilotName: member.currentPilot?.name || user.username,
            teamName: user.teamName || 'Sin equipo',
            teamColor: '#' + Math.floor(Math.random()*16777215).toString(16),
            position: position,
            currentLap: 0,
            trackProgress: 0,
            tyres: {
                compound: req.body.tyreCompound || 'medium',
                wear: 100
            },
            fuel: {
                current: req.body.fuelLoad || 100,
                consumption: RACE_CONFIG.fuelConsumption
            },
            damage: 0,
            status: 'racing',
            pitStops: [],
            strategy: {
                pitLap: req.body.pitLap || null,
                fuelLoad: req.body.fuelLoad || 100,
                tyreCompound: req.body.tyreCompound || 'medium'
            },
            isConnected: true,
            lastPing: new Date()
        });
        
        await race.save();
        
        res.json({
            success: true,
            message: 'Te has unido a la carrera',
            race: race
        });
        
    } catch (error) {
        console.error('Join race error:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// ===========================================
// UPDATE PARTICIPANT STATUS (ping, pit stop, etc.)
// ===========================================
router.put('/:raceId/participant', auth, async (req, res) => {
    try {
        const { action, data } = req.body;
        const race = await Race.findById(req.params.raceId);
        
        if (!race) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        
        const participant = race.liveState.participants.find(
            p => p.user.toString() === req.user.id
        );
        
        if (!participant) {
            return res.status(404).json({ success: false, message: 'No estás en esta carrera' });
        }
        
        switch (action) {
            case 'ping':
                participant.isConnected = true;
                participant.lastPing = new Date();
                break;
                
            case 'pit':
                if (participant.status !== 'racing') {
                    return res.status(400).json({ success: false, message: 'No puedes entrar a boxes ahora' });
                }
                
                participant.status = 'pit';
                
                // Calculate pit stop duration
                const pitDuration = RACE_CONFIG.pitStopTime + Math.random() * 1;
                
                // Apply pit stop changes
                setTimeout(async () => {
                    participant.tyres.compound = data.tyreCompound || participant.tyres.compound;
                    participant.tyres.wear = 100;
                    participant.fuel.current = Math.min(110, participant.fuel.current + (data.fuelAdded || 0));
                    participant.status = 'racing';
                    participant.pitStops.push({
                        lap: participant.currentLap,
                        duration: pitDuration,
                        tyreChange: data.tyreCompound,
                        fuelAdded: data.fuelAdded || 0
                    });
                    
                    // Add event
                    race.liveState.events.push({
                        lap: participant.currentLap,
                        time: new Date(),
                        type: 'pit_exit',
                        description: `${participant.pilotName} sale de boxes`,
                        involvedUsers: [req.user.id]
                    });
                    
                    await race.save();
                }, pitDuration * 1000);
                
                // Add pit entry event
                race.liveState.events.push({
                    lap: participant.currentLap,
                    time: new Date(),
                    type: 'pit_entry',
                    description: `${participant.pilotName} entra a boxes`,
                    involvedUsers: [req.user.id]
                });
                break;
                
            case 'retire':
                participant.status = 'retired';
                race.liveState.events.push({
                    lap: participant.currentLap,
                    time: new Date(),
                    type: 'retirement',
                    description: `${participant.pilotName} abandona`,
                    involvedUsers: [req.user.id]
                });
                break;
        }
        
        await race.save();
        
        res.json({ success: true, participant });
        
    } catch (error) {
        console.error('Update participant error:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// ===========================================
// GET RACE STATE (for live updates)
// ===========================================
router.get('/:raceId/state', auth, async (req, res) => {
    try {
        const race = await Race.findById(req.params.raceId)
            .select('status currentLap liveState weather');
        
        if (!race) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        
        res.json({
            success: true,
            status: race.status,
            currentLap: race.currentLap,
            participants: race.liveState.participants,
            events: race.liveState.events.slice(-20), // Last 20 events
            flags: race.liveState.flags,
            fastestLap: race.liveState.fastestLap,
            weather: race.weather
        });
        
    } catch (error) {
        console.error('Get race state error:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// ===========================================
// SEND CHAT MESSAGE
// ===========================================
router.post('/:raceId/chat', auth, async (req, res) => {
    try {
        const { message } = req.body;
        const user = await User.findById(req.user.id);
        
        const race = await Race.findById(req.params.raceId);
        
        if (!race) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        
        race.chat.push({
            user: req.user.id,
            username: user.username,
            message: message.substring(0, 200),
            timestamp: new Date()
        });
        
        // Keep only last 100 messages
        if (race.chat.length > 100) {
            race.chat = race.chat.slice(-100);
        }
        
        await race.save();
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Send chat error:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// ===========================================
// GET CHAT MESSAGES
// ===========================================
router.get('/:raceId/chat', auth, async (req, res) => {
    try {
        const race = await Race.findById(req.params.raceId).select('chat');
        
        if (!race) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        
        res.json({
            success: true,
            chat: race.chat.slice(-50) // Last 50 messages
        });
        
    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// ===========================================
// FINISH RACE (called by server or admin)
// ===========================================
router.post('/:raceId/finish', auth, async (req, res) => {
    try {
        const race = await Race.findById(req.params.raceId);
        
        if (!race) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        
        if (race.status === 'finished') {
            return res.json({ success: true, message: 'La carrera ya ha terminado' });
        }
        
        race.status = 'finished';
        race.endTime = new Date();
        
        // Calculate final results
        const sortedParticipants = [...race.liveState.participants]
            .filter(p => p.status !== 'retired')
            .sort((a, b) => {
                if (a.currentLap !== b.currentLap) return b.currentLap - a.currentLap;
                return b.trackProgress - a.trackProgress;
            });
        
        // Generate results
        race.results = sortedParticipants.map((p, index) => {
            const position = index + 1;
            const points = RACE_CONFIG.points[position] || 0;
            const xp = RACE_CONFIG.xp[position] || 20;
            const money = RACE_CONFIG.money[position] || 20000;
            
            return {
                position,
                user: p.user,
                pilotName: p.pilotName,
                teamName: p.teamName,
                totalTimeMs: p.totalTime,
                lapsCompleted: p.currentLap,
                bestLap: p.bestLapTime,
                points,
                xpEarned: xp,
                moneyEarned: money,
                pitStops: p.pitStops.length,
                status: 'finished'
            };
        });
        
        // Add retired drivers
        race.liveState.participants
            .filter(p => p.status === 'retired')
            .forEach(p => {
                race.results.push({
                    position: race.results.length + 1,
                    user: p.user,
                    pilotName: p.pilotName,
                    teamName: p.teamName,
                    lapsCompleted: p.currentLap,
                    points: 0,
                    xpEarned: 10,
                    moneyEarned: 10000,
                    status: 'retired'
                });
            });
        
        await race.save();
        
        // Update user stats and league standings
        for (const result of race.results) {
            // Update user
            await User.findByIdAndUpdate(result.user, {
                $inc: {
                    'gameData.budget': result.moneyEarned,
                    'gameData.online.xp': result.xpEarned,
                    'gameData.racesCompleted': 1,
                    'gameData.wins': result.position === 1 ? 1 : 0,
                    'gameData.podiums': result.position <= 3 ? 1 : 0
                }
            });
            
            // Update league member stats
            await League.updateOne(
                { _id: race.league, 'members.user': result.user },
                {
                    $inc: {
                        'members.$.stats.points': result.points,
                        'members.$.stats.wins': result.position === 1 ? 1 : 0,
                        'members.$.stats.podiums': result.position <= 3 ? 1 : 0,
                        'members.$.stats.racesCompleted': 1
                    }
                }
            );
            
            // Update season standings
            const league = await League.findById(race.league);
            const standingIndex = league.currentSeason.standings.findIndex(
                s => s.user.toString() === result.user.toString()
            );
            
            if (standingIndex >= 0) {
                league.currentSeason.standings[standingIndex].points += result.points;
                league.currentSeason.standings[standingIndex].wins += result.position === 1 ? 1 : 0;
                league.currentSeason.standings[standingIndex].podiums += result.position <= 3 ? 1 : 0;
            } else {
                league.currentSeason.standings.push({
                    user: result.user,
                    points: result.points,
                    wins: result.position === 1 ? 1 : 0,
                    podiums: result.position <= 3 ? 1 : 0
                });
            }
            
            // Sort standings
            league.currentSeason.standings.sort((a, b) => b.points - a.points);
            league.currentSeason.standings.forEach((s, i) => s.position = i + 1);
            
            // Increment race number
            league.currentSeason.currentRace++;
            
            await league.save();
        }
        
        res.json({
            success: true,
            results: race.results
        });
        
    } catch (error) {
        console.error('Finish race error:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// ===========================================
// HELPER: Create new race for a league
// ===========================================
async function createNewRace(league) {
    // Get track for this race
    const tracks = ['monza', 'bahrain', 'monaco', 'silverstone', 'spa'];
    const trackId = tracks[league.currentSeason.currentRace % tracks.length];
    
    // Schedule for league's scheduled time
    const now = new Date();
    const scheduledTime = new Date();
    
    // Parse league schedule
    const [hours, minutes] = (league.schedule?.time || '20:00').split(':');
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // If time has passed today, schedule for next occurrence
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    // Move to correct day of week
    const targetDay = league.schedule?.dayOfWeek || 6; // Saturday default
    while (scheduledTime.getDay() !== targetDay) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const race = new Race({
        league: league._id,
        circuit: {
            id: trackId,
            name: getTrackName(trackId),
            country: getTrackCountry(trackId),
            laps: 50,
            length: 5.5
        },
        raceNumber: (league.currentSeason.currentRace || 0) + 1,
        seasonNumber: league.currentSeason.number || 1,
        scheduledTime: scheduledTime,
        status: 'scheduled',
        totalLaps: 50,
        weather: {
            condition: ['sunny', 'cloudy', 'lightRain'][Math.floor(Math.random() * 3)],
            temperature: 20 + Math.floor(Math.random() * 15),
            trackTemperature: 30 + Math.floor(Math.random() * 15),
            rainChance: Math.floor(Math.random() * 30)
        },
        liveState: {
            participants: [],
            events: [],
            flags: { safetycar: false, yellowFlag: false, redFlag: false },
            fastestLap: null
        }
    });
    
    await race.save();
    
    return race;
}

function getTrackName(id) {
    const names = {
        monza: 'Autodromo Nazionale Monza',
        bahrain: 'Bahrain International Circuit',
        monaco: 'Circuit de Monaco',
        silverstone: 'Silverstone Circuit',
        spa: 'Circuit de Spa-Francorchamps'
    };
    return names[id] || id;
}

function getTrackCountry(id) {
    const countries = {
        monza: 'Italia',
        bahrain: 'Bahréin',
        monaco: 'Mónaco',
        silverstone: 'Reino Unido',
        spa: 'Bélgica'
    };
    return countries[id] || 'Desconocido';
}

module.exports = router;
