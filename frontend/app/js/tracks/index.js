// ============================================================
// TRACKS INDEX - Dynamic Track Loading
// ============================================================

export { MonzaTrack } from './monza.js';
export { BahrainTrack } from './bahrain.js';

export {
    getSplinePoint,
    getSplineAngle,
    getSplineNormal,
    getSplineTangent,
    buildArcLengthTable,
    arcLengthToFraction,
    getSpeedFactor,
    getSectionName,
    isInDRSZone,
    isInOvertakingZone,
    getCurrentSector,
    precomputeTrackGeometry,
} from './monza.js';

// Track registry — maps trackId to track data object
import { MonzaTrack } from './monza.js';
import { BahrainTrack } from './bahrain.js';

export const TRACKS = {
    monza: MonzaTrack,
    bahrain: BahrainTrack,
};

export function getTrackById(id) {
    return TRACKS[id] || MonzaTrack;
}
