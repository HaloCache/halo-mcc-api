/**
 * Custom Game Browser (CGB) Service
 *
 * Provides access to the Halo MCC Custom Game Browser server list.
 * @module services/cgb
 */

import { inflate } from 'pako';
import { ENDPOINTS, BUILD_ID, DEFAULT_HEADERS } from '../constants.js';
import { ValidationError } from '../validation.js';
import { getMapByLegacyId, getGlobalGameVariantById, findMapAcrossEngines, getMapPlaceholder, GameEngine } from '@halocache/halo-mcc-data';

/**
 * Decompression bounds for GameServerData.
 */
const MAX_COMPRESSED_BYTES = 512 * 1024;
const MAX_DECOMPRESSED_BYTES = 8 * 1024 * 1024;
const MAX_SERVER_RESULTS = 2000;

function assertIntegerInRange(value, field, minimum, maximum) {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new ValidationError(
            `${field} must be an integer from ${minimum} to ${maximum}`,
            field,
            value,
            `integer from ${minimum} to ${maximum}`,
        );
    }
}

/** @typedef {import('../types/cgb.types.js').CGBGame} CGBGame */
/** @typedef {import('../types/cgb.types.js').CGBData} CGBData */
/** @typedef {import('../types/cgb.types.js').DecodedGameServerData} DecodedGameServerData */

/**
 * CGB Service - Custom Game Browser operations
 *
 * @class CGBService
 */
export class CGBService {
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient instance
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Normalize a player-supplied display string.
     * This cosmetic cleanup does not provide XSS protection; escape output for its
     * rendering context.
     *
     * @param {string} str - Input string
     * @returns {string} Normalised display string
     */
    sanitizeString(str) {
        if (!str) return '';

        let clean = String(str);
        let previous;
        do {
            previous = clean;
            clean = clean.replace(/<[^>]*>?/g, '');
        } while (clean !== previous);

        clean = clean.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

        return clean.trim();
    }

    /**
     * Get the current Build ID used for server queries.
     *
     * @returns {string} Current build ID (format: YYYY.MM.DD.BuildNumber.Patch-Release)
     */
    getBuildId() {
        return BUILD_ID;
    }

    /**
     * Fetch the Custom Game Browser server list.
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxResults=2000] - Maximum number of games to retrieve (max: 2000)
     * @param {string} [options.continuationToken] - Pagination token from previous request
     * @returns {Promise<CGBData>} CGB data including games and pagination token
     * @throws {Error} If the API request fails
     */
    async getServerList(options = {}) {
        const { maxResults = 2000, continuationToken } = options;
        assertIntegerInRange(maxResults, 'maxResults', 1, MAX_SERVER_RESULTS);
        const pf = await this.client.getPlayFabToken();

        const body = {
            "BuildId": BUILD_ID,
            "MaxResults": maxResults
        };

        if (continuationToken) {
            body.ContinuationToken = continuationToken;
        }

        const response = await this.client.http.post(
            ENDPOINTS.MCC.SERVER_LIST,
            body,
            {
                headers: {
                    ...DEFAULT_HEADERS,
                    'x-auth-token': pf.SessionTicket
                },
                validateStatus: () => true
            }
        );

        const rawData = response.data;

        if (response.status >= 400) {
            const err = new Error(`CGB API error: HTTP ${response.status}`);
            err.status = response.status;
            err.responseBody = rawData;
            throw err;
        }

        return rawData?.data || { GameCount: 0, Games: [], ContinuationToken: '' };
    }

    /**
     * Fetch server-list pages up to the configured page limit.
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.pageSize=2000] - Results per page
     * @param {number} [options.maxPages=10] - Maximum pages to fetch (safety limit)
     * @returns {Promise<CGBGame[]>} All games across all pages
     */
    async getAllServers(options = {}) {
        const { pageSize = 2000, maxPages = 10 } = options;
        assertIntegerInRange(pageSize, 'pageSize', 1, MAX_SERVER_RESULTS);
        assertIntegerInRange(maxPages, 'maxPages', 1, 100);
        const allGames = [];
        let continuationToken = null;
        let pageCount = 0;

        do {
            const data = await this.getServerList({
                maxResults: pageSize,
                continuationToken
            });

            allGames.push(...data.Games);
            continuationToken = data.ContinuationToken || null;
            pageCount++;
        } while (continuationToken && pageCount < maxPages);

        return allGames;
    }

    /**
     * Get a specific server by Lobby ID.
     *
     * @param {string} lobbyId - UUID of the lobby to find
     * @returns {Promise<CGBGame|null>} Game session if found, null otherwise
     */
    async getServerById(lobbyId) {
        if (typeof lobbyId !== 'string' || lobbyId.trim() === '') {
            throw new ValidationError(
                `Invalid lobbyId: expected a non-empty string, got ${lobbyId === null ? 'null' : typeof lobbyId}`,
                'lobbyId', lobbyId, 'non-empty string'
            );
        }

        const allServers = await this.getAllServers();
        return allServers.find(g => g.LobbyId === lobbyId || g.id === lobbyId) || null;
    }

    /**
     * Decode the compressed GameServerData field.
     *
     * @param {string} base64Data - Base64-encoded deflate-compressed JSON
     * @returns {Object} Decoded game server data
     * @throws {Error} If decompression or parsing fails
     */
    decodeGameServerData(base64Data) {
        if (!base64Data) return null;

        try {
            const bytes = Buffer.from(base64Data, 'base64');

            if (bytes.length > MAX_COMPRESSED_BYTES) {
                throw new Error(`GameServerData too large: ${bytes.length} bytes (limit ${MAX_COMPRESSED_BYTES})`);
            }

            const inflated = inflate(bytes);
            if (inflated.length > MAX_DECOMPRESSED_BYTES) {
                throw new Error(`GameServerData expanded to ${inflated.length} bytes (limit ${MAX_DECOMPRESSED_BYTES})`);
            }

            const decompressed = new TextDecoder('utf-8').decode(inflated);

            const data = JSON.parse(decompressed);

            try {
                let verifiedMap = null;
                let engine = null;

                if (data.game_mode && Object.values(GameEngine).includes(data.game_mode)) {
                    engine = data.game_mode;
                }

                if (data.map_id !== undefined) {
                    verifiedMap = findMapAcrossEngines(data.map_id);

                    if (verifiedMap) {
                        engine = verifiedMap.engine;
                        data.engine = verifiedMap.engine;

                        data.BaseMapName = verifiedMap.name;
                        data.MapId = verifiedMap.id;
                        data.BuiltInMapId = verifiedMap.builtInId;

                        if (!data.MapName) data.MapName = verifiedMap.name;
                    } else {
                        const placeholder = getMapPlaceholder(data.map_id);

                        data.BaseMapName = placeholder.name;
                        data.MapId = placeholder.id;
                        data.MapIsPlaceholder = true;

                        if (!data.MapName) data.MapName = placeholder.name;
                    }
                }

                const variantTypeId = data.game_variant_data?.variant_type_id ?? data.game_type;

                if (variantTypeId !== undefined && variantTypeId !== null) {
                    const verifiedVariant = getGlobalGameVariantById(variantTypeId);
                    if (verifiedVariant) {
                        data.BaseGameVariantName = verifiedVariant.name;
                        data.GameVariantCategory = verifiedVariant.category;

                        if (!data.GameVariantName) data.GameVariantName = verifiedVariant.name;
                    }
                }
            } catch {
            }

            if (data.playlistVariants) {
                const mapVar = data.playlistVariants.mapVariants?.find(v => v.name);
                if (mapVar && mapVar.name) {
                    data.MapName = this.sanitizeString(mapVar.name);
                }

                const gameVar = data.playlistVariants.gameVariants?.find(v => v.name);
                if (gameVar && gameVar.name) {
                    data.GameVariantName = this.sanitizeString(gameVar.name);
                }
            }

            if (data.session_name) data.session_name = this.sanitizeString(data.session_name);
            if (data.session_description) data.session_description = this.sanitizeString(data.session_description);
            if (data.session_details) data.session_details = this.sanitizeString(data.session_details);

            return data;
        } catch (error) {
            throw new Error(`Failed to decode GameServerData: ${error.message}`);
        }
    }

    /**
     * Get servers with decoded game data.
     *
     * @param {Object} [options] - Query options (same as getServerList)
     * @returns {Promise<Array<CGBGame & {decodedData: Object}>>} Games with decoded data
     */
    async getServersWithDetails(options = {}) {
        const data = await this.getServerList(options);
        return data.Games.map(game => ({
            ...game,
            decodedData: this.decodeGameServerData(game.GameServerData)
        }));
    }




    /**
     * Resolve active CGB session hosts to player identifiers.
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxServers=20] - Maximum servers to scan
     * @param {boolean} [options.requirePlayFab=true] - Only return hosts with PlayFab IDs
     * @returns {Promise<Array<{xuid: string, playFabId: string|null, titlePlayerId: string|null, serverName: string}>>}
     */
    async getActiveHosts(options = {}) {
        const { maxServers = 20, requirePlayFab = true } = options;

        const servers = await this.getServersWithDetails({ maxResults: maxServers });

        const { PlayerService } = await import('./player.service.js');
        const playerService = new PlayerService(this.client);

        const hosts = [];
        const seenXuids = new Set();

        for (const server of servers) {
            if (!server.decodedData?.session_creator) continue;

            const xuid = server.decodedData.session_creator;
            if (seenXuids.has(xuid)) continue;
            seenXuids.add(xuid);

            try {
                const playFabId = await playerService.getPlayFabIdFromXuid(xuid);

                if (requirePlayFab && !playFabId) continue;

                let titlePlayerId = null;
                if (playFabId) {
                    titlePlayerId = await playerService.getTitlePlayerAccountId(playFabId);
                }

                hosts.push({
                    xuid,
                    playFabId,
                    titlePlayerId,
                    serverName: server.decodedData.session_name || server.LobbyId
                });
            } catch (error) {
                continue;
            }
        }

        return hosts;
    }
}
