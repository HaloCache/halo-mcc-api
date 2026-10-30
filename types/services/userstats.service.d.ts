/**
 * User Stats Service
 *
 * Xbox Live title stats, read by stat name. The builders here compose the names
 * MCC uses for campaign missions, playlists and multiplayer scores. Needs an
 * XSTS token for xboxlive.com; the scid defaults to MCC_SCID.
 * @module services/userstats
 */
/**
 * Per-mission stat name: best score or best time for a mission.
 * @param {{metric:'score'|'time'|'Score64'|'TimeMS', difficultyId:number, mapId:number, coop:number}} q
 * @returns {string}
 */
export declare function buildMissionStatName(q: {
    metric: 'score' | 'time' | 'Score64' | 'TimeMS';
    difficultyId: number;
    mapId: number;
    coop: number;
}): string;
/**
 * Playlist-completed stat name.
 * @param {{playlistId:number, isCoop:number}} q
 * @returns {string}
 */
export declare function buildPlaylistStatName(q: {
    playlistId: number;
    isCoop: number;
}): string;
/**
 * Builder for the other stat-name families.
 * @param {string} kind - one of: missionCompleted, highestMissionDifficulty,
 *   totalMultiplayerScore64, bestMultiplayerScore64, totalMissionScore64
 * @param {Object} p
 * @returns {string}
 */
export declare function buildUserStatName(kind: string, p?: Object): string;
export declare class UserStatsService {
    client: import("../client.js").MccClient;
    scid: string;
    /**
     * @param {import('../client.js').MccClient} client
     * @param {Object} [options]
     * @param {string} [options.scid]
     */
    constructor(client: import('../client.js').MccClient, options?: {
        scid?: string;
    });
    /** @private */
    private _headers;
    /**
     * Build the stats URL.
     * @param {string} xuid @param {string[]} stats @returns {string}
     */
    buildUrl(xuid: string, stats: string[]): string;
    /**
     * Normalize the userstats response into flat per-stat rows.
     * Real shape: { statlistscollection: [ { arrangebyfieldid, stats: [ { xuid,
     * name, type, value, properties } ] } ] }.
     * @param {Object} body
     * @returns {Array<{xuid:string,name:string,type:string,value:string|number,properties:Object}>}
     */
    static normalize(body: Object): Array<{
        xuid: string;
        name: string;
        type: string;
        value: string | number;
        properties: Object;
    }>;
    /**
     * Read a player's stats by name.
     * @param {Object} params
     * @param {string} params.xuid
     * @param {string[]} params.stats - Stat names (use the builders above).
     * @returns {Promise<Array<{xuid:string,name:string,type:string,value:string|number,properties:Object}>>}
     */
    getStats({ xuid, stats }?: {
        xuid: string;
        stats: string[];
    }): Promise<Array<{
        xuid: string;
        name: string;
        type: string;
        value: string | number;
        properties: Object;
    }>>;
}
