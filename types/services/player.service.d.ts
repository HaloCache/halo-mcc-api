/**
 * Player Service
 *
 * Provides access to Xbox Live profiles and PlayFab player data.
 * @module services/player
 */
export type XboxProfile = import('../types/player.types.js').XboxProfile;
export type PlayFabProfile = import('../types/player.types.js').PlayFabProfile;
export type PlayFabIdMapping = import('../types/player.types.js').PlayFabIdMapping;
/** @typedef {import('../types/player.types.js').XboxProfile} XboxProfile */
/** @typedef {import('../types/player.types.js').PlayFabProfile} PlayFabProfile */
/** @typedef {import('../types/player.types.js').PlayFabIdMapping} PlayFabIdMapping */
/**
 * Player Service - Xbox and PlayFab profile operations
 *
 * @class PlayerService
 */
export declare class PlayerService {
    client: import("../client.js").MccClient;
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient instance
     */
    constructor(client: import('../client.js').MccClient);
    /**
     * Get XUID from Gamertag.
     *
     * @param {string} gamertag - Xbox Gamertag to look up
     * @returns {Promise<string|null>} XUID if found, null if player doesn't exist
     * @throws {Error} If the API request fails (network, auth issues)
     *
     * @rateLimit 10 requests per 15 seconds (Per Account). Returns 404/null if user not found, but throws on connectivity issues.
     */
    getXuidFromGamertag(gamertag: string): Promise<string | null>;
    /**
     * Get PlayFab Master ID from XUID.
     *
     * @param {string} xuid - Xbox User ID
     * @returns {Promise<string|null>} PlayFab ID if found, null otherwise
     */
    getPlayFabIdFromXuid(xuid: string): Promise<string | null>;
    /**
     * Get Title Player Account ID from PlayFab Master ID.
     * This ID is used for entity-level operations like profiles.
     *
     * @param {string} playFabMasterId - PlayFab Master Player Account ID
     * @returns {Promise<string|null>} Title Player Account ID
     */
    getTitlePlayerAccountId(playFabMasterId: string): Promise<string | null>;
    /**
     * Get Xbox Live profile by XUID.
     *
     * @param {string} xuid - Xbox User ID
     * @returns {Promise<XboxProfile|null>} Profile data if found
     */
    getProfile(xuid: string): Promise<XboxProfile | null>;
    /**
     * Get multiple Xbox Live profiles by XUIDs.
     *
     * @param {string[]} xuids - Array of Xbox User IDs
     * @returns {Promise<XboxProfile[]>} Array of profile data
     */
    getProfiles(xuids: string[]): Promise<XboxProfile[]>;
    /**
     * Get PlayFab player profile.
     *
     * @param {string} titlePlayerAccountId - Title Player Account ID (from getTitlePlayerAccountId)
     * @returns {Promise<PlayFabProfile|null>} PlayFab profile if found
     */
    getPlayFabProfile(titlePlayerAccountId: string): Promise<PlayFabProfile | null>;
    /**
     * Resolve player identifiers and profile data from a gamertag.
     *
     * @param {string} gamertag - Xbox Gamertag
     * @returns {Promise<{xuid: string, playFabId: string, titlePlayerId: string, xboxProfile: XboxProfile}|null>}
     */
    getPlayerByGamertag(gamertag: string): Promise<{
        xuid: string;
        playFabId: string;
        titlePlayerId: string;
        xboxProfile: XboxProfile;
    } | null>;
    /**
     * Resolve a gamertag to XUID, PlayFab ID, and Title Player ID without fetching
     * the full Xbox profile.
     *
     * @param {string} gamertag - Xbox Gamertag
     * @returns {Promise<{xuid: string, playFabId: string|null, titlePlayerId: string|null}|null>}
     *          Player IDs or null if gamertag not found
     */
    resolvePlayer(gamertag: string): Promise<{
        xuid: string;
        playFabId: string | null;
        titlePlayerId: string | null;
    } | null>;
    /**
     * Batch resolve multiple gamertags to XUIDs.
     *
     * @param {string[]} gamertags - Array of gamertags
     * @param {Object} [options]
     * @param {number} [options.concurrency=5] - Maximum simultaneous Xbox lookups
     * @returns {Promise<Map<string, string>>} Map of gamertag -> XUID
     */
    resolveGamertags(gamertags: string[], options?: {
        concurrency?: number;
    }): Promise<Map<string, string>>;
}
