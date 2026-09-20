/**
 * Custom Game Browser (CGB) Service
 *
 * Provides access to the Halo MCC Custom Game Browser server list.
 * @module services/cgb
 */
export type CGBGame = import('../types/cgb.types.js').CGBGame;
export type CGBData = import('../types/cgb.types.js').CGBData;
export type DecodedGameServerData = import('../types/cgb.types.js').DecodedGameServerData;
/** @typedef {import('../types/cgb.types.js').CGBGame} CGBGame */
/** @typedef {import('../types/cgb.types.js').CGBData} CGBData */
/** @typedef {import('../types/cgb.types.js').DecodedGameServerData} DecodedGameServerData */
/**
 * CGB Service - Custom Game Browser operations
 *
 * @class CGBService
 */
export declare class CGBService {
    client: import("../client.js").MccClient;
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient instance
     */
    constructor(client: import('../client.js').MccClient);
    /**
     * Normalize a player-supplied display string.
     * This cosmetic cleanup does not provide XSS protection; escape output for its
     * rendering context.
     *
     * @param {string} str - Input string
     * @returns {string} Normalised display string
     */
    sanitizeString(str: string): string;
    /**
     * Get the current Build ID used for server queries.
     *
     * @returns {string} Current build ID (format: YYYY.MM.DD.BuildNumber.Patch-Release)
     */
    getBuildId(): string;
    /**
     * Fetch the Custom Game Browser server list.
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxResults=2000] - Maximum number of games to retrieve (max: 2000)
     * @param {string} [options.continuationToken] - Pagination token from previous request
     * @returns {Promise<CGBData>} CGB data including games and pagination token
     * @throws {Error} If the API request fails
     */
    getServerList(options?: {
        maxResults?: number;
        continuationToken?: string;
    }): Promise<CGBData>;
    /**
     * Fetch server-list pages up to the configured page limit.
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.pageSize=2000] - Results per page
     * @param {number} [options.maxPages=10] - Maximum pages to fetch (safety limit)
     * @returns {Promise<CGBGame[]>} All games across all pages
     */
    getAllServers(options?: {
        pageSize?: number;
        maxPages?: number;
    }): Promise<CGBGame[]>;
    /**
     * Get a specific server by Lobby ID.
     *
     * @param {string} lobbyId - UUID of the lobby to find
     * @returns {Promise<CGBGame|null>} Game session if found, null otherwise
     */
    getServerById(lobbyId: string): Promise<CGBGame | null>;
    /**
     * Decode the compressed GameServerData field.
     *
     * @param {string} base64Data - Base64-encoded deflate-compressed JSON
     * @returns {Object} Decoded game server data
     * @throws {Error} If decompression or parsing fails
     */
    decodeGameServerData(base64Data: string): Object;
    /**
     * Get servers with decoded game data.
     *
     * @param {Object} [options] - Query options (same as getServerList)
     * @returns {Promise<Array<CGBGame & {decodedData: Object}>>} Games with decoded data
     */
    getServersWithDetails(options?: Object): Promise<Array<CGBGame & {
        decodedData: Object;
    }>>;
    /**
     * Resolve active CGB session hosts to player identifiers.
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxServers=20] - Maximum servers to scan
     * @param {boolean} [options.requirePlayFab=true] - Only return hosts with PlayFab IDs
     * @returns {Promise<Array<{xuid: string, playFabId: string|null, titlePlayerId: string|null, serverName: string}>>}
     */
    getActiveHosts(options?: {
        maxServers?: number;
        requirePlayFab?: boolean;
    }): Promise<Array<{
        xuid: string;
        playFabId: string | null;
        titlePlayerId: string | null;
        serverName: string;
    }>>;
}
