/**
 * User Stats Service
 *
 * Xbox Live title stats, read by stat name. The builders here compose the names
 * MCC uses for campaign missions, playlists and multiplayer scores. Needs an
 * XSTS token for xboxlive.com; the scid defaults to MCC_SCID.
 * @module services/userstats
 */

import { ENDPOINTS, MCC_SCID, RELYING_PARTIES } from '../constants.js';

const CONTRACT_VERSION = '2';

/** Score64 (score) vs TimeMS (time) token. */
const metricToken = (m) => (m === 'Score64' || m === 'scoring' || m === 'score' ? 'Score64' : m === 'TimeMS' || m === 'timing' || m === 'time' ? 'TimeMS' : null);

/**
 * Per-mission stat name: best score or best time for a mission.
 * @param {{metric:'score'|'time'|'Score64'|'TimeMS', difficultyId:number, mapId:number, coop:number}} q
 * @returns {string}
 */
export function buildMissionStatName(q) {
    const t = metricToken(q.metric);
    if (!t) throw new Error('metric must be score|time');
    if (q.difficultyId == null || q.mapId == null || q.coop == null) throw new Error('mission stat requires { difficultyId, mapId, coop }');
    return `BestMission${t}.DifficultyId.${q.difficultyId}.MapId.${q.mapId}.Coop.${q.coop}`;
}

/**
 * Playlist-completed stat name.
 * @param {{playlistId:number, isCoop:number}} q
 * @returns {string}
 */
export function buildPlaylistStatName(q) {
    if (q.playlistId == null) throw new Error('playlist stat requires { playlistId }');
    return `PlaylistCompleted.PlaylistId.${q.playlistId}.IsCoop.${q.isCoop ?? 0}`;
}

/**
 * Builder for the other stat-name families.
 * @param {string} kind - one of: missionCompleted, highestMissionDifficulty,
 *   totalMultiplayerScore64, bestMultiplayerScore64, totalMissionScore64
 * @param {Object} p
 * @returns {string}
 */
export function buildUserStatName(kind, p = {}) {
    switch (kind) {
        case 'missionCompleted': return `MissionCompleted.MapId.${p.mapId}.Coop.${p.coop ?? 0}`;
        case 'highestMissionDifficulty': return `HighestMissionDifficulty.MapId.${p.mapId}.Coop.${p.coop ?? 0}`;
        case 'totalMultiplayerScore64': return `TotalMultiplayerScore64${p.suffix ?? ''}.GameCategoryId.${p.gameCategoryId}.MatchMade.${p.matchMade ?? 0}`;
        case 'bestMultiplayerScore64': return `BestMultiplayerScore64${p.suffix ?? ''}.GameCategoryId.${p.gameCategoryId}.MatchMade.${p.matchMade ?? 0}`;
        case 'totalMissionScore64': return `TotalMissionScore64${p.suffix ?? ''}.GameCategoryId.${p.gameCategoryId}`;
        default: throw new Error(`unknown stat kind: ${kind}`);
    }
}

export class UserStatsService {
    /**
     * @param {import('../client.js').MccClient} client
     * @param {Object} [options]
     * @param {string} [options.scid]
     */
    constructor(client, options = {}) {
        if (!client) throw new Error('UserStatsService requires an MccClient');
        this.client = client;
        this.scid = options.scid || MCC_SCID;
    }

    /** @private */
    async _headers() {
        const xsts = await this.client.getXboxToken(RELYING_PARTIES.XBOX_LIVE);
        return { Authorization: xsts.tokenString, 'x-xbl-contract-version': CONTRACT_VERSION, Accept: 'application/json' };
    }

    /**
     * Build the stats URL.
     * @param {string} xuid @param {string[]} stats @returns {string}
     */
    buildUrl(xuid, stats) {
        if (!xuid) throw new Error('userstats requires xuid');
        if (!this.scid) throw new Error('userstats requires a scid');
        let url = `${ENDPOINTS.XBOX_LIVE_SERVICES.USER_STATS}/users/xuid(${encodeURIComponent(xuid)})/scids/${encodeURIComponent(this.scid)}/stats`;
        if (Array.isArray(stats) && stats.length) url += `/${stats.map(encodeURIComponent).join(',')}`;
        return url;
    }

    /**
     * Normalize the userstats response into flat per-stat rows.
     * Real shape: { statlistscollection: [ { arrangebyfieldid, stats: [ { xuid,
     * name, type, value, properties } ] } ] }.
     * @param {Object} body
     * @returns {Array<{xuid:string,name:string,type:string,value:string|number,properties:Object}>}
     */
    static normalize(body) {
        const coll = body?.statlistscollection ?? [];
        const out = [];
        for (const group of coll) {
            for (const s of group.stats ?? []) {
                out.push({ xuid: s.xuid ?? group.arrangebyfieldid ?? null, name: s.name ?? s.statname, type: s.type ?? null, value: s.value ?? null, properties: s.properties ?? {} });
            }
        }
        return out;
    }

    /**
     * Read a player's stats by name.
     * @param {Object} params
     * @param {string} params.xuid
     * @param {string[]} params.stats - Stat names (use the builders above).
     * @returns {Promise<Array<{xuid:string,name:string,type:string,value:string|number,properties:Object}>>}
     */
    async getStats({ xuid, stats } = {}) {
        if (!Array.isArray(stats) || stats.length === 0) throw new Error('getStats requires { stats: [names] } (use buildMissionStatName / buildPlaylistStatName / buildUserStatName)');
        const res = await this.client.http.get(this.buildUrl(xuid, stats), { headers: await this._headers() });
        return UserStatsService.normalize(res.data);
    }
}
