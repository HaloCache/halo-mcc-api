/**
 * Access to player FileShare content, including map and game variants.
 *
 * @module services/fileshare
 */

import { createWriteStream } from 'node:fs';
import { rm } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { ENDPOINTS, DEFAULT_HEADERS } from '../constants.js';
import { enrichResponse } from '../utils/response-enrichment.js';
import { mapWithConcurrency } from '../utils/concurrency.js';
import { ValidationError } from '../validation.js';
import { RateLimitError } from '../errors.js';
import { isValidGuid } from '@halocache/halo-mcc-common';

/** @typedef {import('../types/fileshare.types.js').FileShareItemDetails} FileShareItemDetails */
/** @typedef {import('../types/fileshare.types.js').FileShareResponse} FileShareResponse */
/** @typedef {import('../utils/response-enrichment.js').EnrichedResponse} EnrichedResponse */

import { FileShareItem } from '../models/fileshare.model.js';

/**
 * Supported FileShare content types.
 *
 * @type {string[]}
 */
export const CONTENT_TYPES = [
    'MapVariant',
    'GameVariant'
];

/**
 * Content types outside the supported CONTENT_TYPES list.
 *
 * @type {string[]}
 */
export const UNVERIFIED_CONTENT_TYPES = [
    'Screenshot',
    'Film',
    'Prefab'
];

/**
 * Access to player FileShare content, including map and game variants.
 *
 * @class FileShareService
 */
export class FileShareService {
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient instance
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Get a player's FileShare items with request and response metadata.
     *
     * @param {string} creatorEntityId - PlayFab Title Player Account ID of the player whose files to fetch
     * @returns {Promise<EnrichedResponse>} Enriched response with data and metadata
     * @throws {Error} If the API request fails
     */
    async getPlayerItems(creatorEntityId) {
        const pf = await this.client.getPlayFabToken();
        const localEntityId = pf.EntityToken.Entity.Id;

        return enrichResponse(
            () => this.client.http.post(
                ENDPOINTS.MCC.GET_UGC_ITEMS,
                {},
                {
                    headers: {
                        'Accept': 'application/json',
                        'UserEntityId': localEntityId,
                        'CreatorEntityId': creatorEntityId
                    }
                }
            ).then(res => {
                if (res.data?.data && Array.isArray(res.data.data.Items)) {
                    res.data.data.Items = FileShareItem.fromArray(res.data.data.Items);
                } else if (res.data && Array.isArray(res.data.Items)) {
                    res.data.Items = FileShareItem.fromArray(res.data.Items);
                }
                return res;
            }),
            {
                endpoint: 'GetPlayFabUgcItems',
                method: 'POST',
                params: { creatorEntityId }
            }
        );
    }

    /**
     * Get player's screenshots.
     *
     * @param {string} creatorEntityId - PlayFab Title Player Account ID
     * @returns {Promise<FileShareItem[]>} Array of screenshot items
     */
    async getPlayerScreenshots(creatorEntityId) {
        const result = await this.getPlayerItems(creatorEntityId);
        const items = result.data.Items || [];
        return items.filter(item => item.contentType === 'Screenshot');
    }

    /**
     * Get player's map variants.
     *
     * @param {string} creatorEntityId - PlayFab Title Player Account ID
     * @returns {Promise<FileShareItem[]>} Array of map variant items
     */
    async getPlayerMaps(creatorEntityId) {
        const result = await this.getPlayerItems(creatorEntityId);
        const items = result.data.Items || [];
        return items.filter(item => item.isMapVariant);
    }

    /**
     * Get player's game variants.
     *
     * @param {string} creatorEntityId - PlayFab Title Player Account ID
     * @returns {Promise<FileShareItem[]>} Array of game variant items
     */
    async getPlayerGameVariants(creatorEntityId) {
        const result = await this.getPlayerItems(creatorEntityId);
        const items = result.data.Items || [];
        return items.filter(item => item.isGameVariant);
    }

    /**
     * Get player's films/recordings.
     *
     * @param {string} creatorEntityId - PlayFab Title Player Account ID
     * @returns {Promise<FileShareItem[]>} Array of film items
     */
    async getPlayerFilms(creatorEntityId) {
        const result = await this.getPlayerItems(creatorEntityId);
        const items = result.data.Items || [];
        return items.filter(item => item.contentType === 'Film');
    }

    /**
     * Get details for a specific FileShare item, including download URL.
     *
     * @param {string} itemId - UGC Item ID
     * @returns {Promise<FileShareItemDetails|null>} Item details with download URL
     */
    async getItemDetails(itemId, retryCount = 0) {
        if (!isValidGuid(itemId)) {
            throw new ValidationError(
                `Invalid itemId: expected a GUID, got ${itemId}`,
                'itemId', itemId, 'GUID'
            );
        }

        try {
            const pf = await this.client.getPlayFabToken();

            const response = await this.client.http.post(
                ENDPOINTS.MCC.GET_UGC_ITEM,
                { "ItemId": itemId },
                {
                    headers: {
                        ...DEFAULT_HEADERS,
                        'X-EntityToken': pf.EntityToken.EntityToken
                    }
                }
            );

            if (response.data?.Error && response.data.Error.HttpStatus === 'TooManyRequests') {
                if (retryCount >= 3) {
                    const retryAfterSeconds = Number(response.data.Error.RetryAfterSeconds) || 5;
                    throw new RateLimitError({
                        message: `Rate limit exceeded for item ${itemId} after ${retryCount} retries`,
                        retryAfter: retryAfterSeconds * 1000,
                        endpoint: 'GetPlayFabUgcItem'
                    });
                }

                const waitSeconds = (response.data.Error.RetryAfterSeconds || 5) + 1;
                this.client.log.warn(`Rate limited by PlayFab; retrying in ${waitSeconds}s`, {
                    attempt: retryCount + 1,
                });

                await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
                return this.getItemDetails(itemId, retryCount + 1);
            }

            if (response.data?.data?.Item) {
                const item = new FileShareItem(response.data.data.Item);
                return item;
            }

            if (response.data?.code === 404 || response.data?.status === 'NotFound') {
                return null;
            }

            this.client.log.warn(`Unexpected response structure for item ${itemId}`, response.data);
            return null;
        } catch (error) {
            if (error.response?.status === 429) {
                if (retryCount >= 3) throw error;

                const waitSeconds = parseInt(error.response.headers['retry-after'] || 5) + 1;
                this.client.log.warn(`Rate limited while fetching ${itemId}; retrying in ${waitSeconds}s`, {
                    attempt: retryCount + 1,
                });
                await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
                return this.getItemDetails(itemId, retryCount + 1);
            }

            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Download a FileShare item to a local file.
     *
     * @param {string} itemId - UGC Item ID
     * @param {string} outputPath - Local file path to save to
     * @returns {Promise<boolean>} True if download succeeded
     */
    async downloadItem(itemId, outputPath) {
        const stream = await this.fetchItemBinaryStream(itemId);
        try {
            await pipeline(stream, createWriteStream(outputPath));
        } catch (error) {
            await rm(outputPath, { force: true }).catch(() => {});
            throw error;
        }
        return true;
    }

    /**
     * Fetch item binary data as a readable stream without buffering the full file.
     *
     * @param {string} itemId - UGC Item ID
     * @returns {Promise<import('stream').Readable>} Readable stream of binary data
     */
    async fetchItemBinaryStream(itemId) {
        const details = await this.getItemDetails(itemId);

        if (!details?.DownloadUrl) {
            throw new Error(`No download URL available for item ${itemId}`);
        }

        const response = await this.client.http.get(details.DownloadUrl, {
            responseType: 'stream'
        });

        return response.data;
    }

    /**
     * Get FileShare items for the authenticated user.
     *
     * @returns {Promise<FileShareResponse>} Own FileShare data
     */
    async getOwnItems() {
        const pf = await this.client.getPlayFabToken();
        return this.getPlayerItems(pf.EntityToken.Entity.Id);
    }

    /**
     * Get own screenshots.
     *
     * @returns {Promise<FileShareItem[]>} Array of own screenshot items
     */
    async getOwnScreenshots() {
        const pf = await this.client.getPlayFabToken();
        return this.getPlayerScreenshots(pf.EntityToken.Entity.Id);
    }

    /**
     * Get own map variants.
     *
     * @returns {Promise<FileShareItem[]>} Array of own map variant items
     */
    async getOwnMaps() {
        const pf = await this.client.getPlayFabToken();
        return this.getPlayerMaps(pf.EntityToken.Entity.Id);
    }

    /**
     * Get own game variants.
     *
     * @returns {Promise<FileShareItem[]>} Array of own game variant items
     */
    async getOwnGameVariants() {
        const pf = await this.client.getPlayFabToken();
        return this.getPlayerGameVariants(pf.EntityToken.Entity.Id);
    }

    /**
     * Resolve a gamertag to its Title Player ID and fetch FileShare content.
     *
     * @param {string} gamertag - Xbox Gamertag
     * @returns {Promise<{items: FileShareItem[], maps: FileShareItem[], gameVariants: FileShareItem[], player: Object}|null>}
     *          Player's content or null if gamertag not found
     */
    async getItemsByGamertag(gamertag) {
        const { PlayerService } = await import('./player.service.js');
        const playerService = new PlayerService(this.client);

        const player = await playerService.resolvePlayer(gamertag);
        if (!player || !player.titlePlayerId) {
            return null;
        }

        const itemsResult = await this.getPlayerItems(player.titlePlayerId);
        const items = itemsResult.data?.Items || [];

        return {
            items,
            maps: items.filter(item => item.isMapVariant),
            gameVariants: items.filter(item => item.isGameVariant),
            player
        };
    }

    /**
     * Resolve an XUID through PlayFab and fetch the player's FileShare items.
     *
     * @param {string} xuid - Xbox User ID
     * @returns {Promise<{items: FileShareItem[], maps: FileShareItem[], gameVariants: FileShareItem[], player: Object}|null>}
     */
    async getItemsByXuid(xuid) {
        const { PlayerService } = await import('./player.service.js');
        const playerService = new PlayerService(this.client);

        const playFabId = await playerService.getPlayFabIdFromXuid(xuid);
        if (!playFabId) return null;

        const titlePlayerId = await playerService.getTitlePlayerAccountId(playFabId);
        if (!titlePlayerId) return null;

        const itemsResult = await this.getPlayerItems(titlePlayerId);
        const items = itemsResult.data?.Items || [];

        return {
            items,
            maps: items.filter(item => item.isMapVariant),
            gameVariants: items.filter(item => item.isGameVariant),
            player: { xuid, playFabId, titlePlayerId }
        };
    }

    /**
     * Batch fetch FileShare content for multiple players.
     *
     * @param {string[]} titlePlayerIds - Array of Title Player Account IDs
     * @param {Object} [options]
     * @param {number} [options.concurrency=5] - Maximum simultaneous FileShare requests
     * @returns {Promise<Map<string, {items: FileShareItem[], maps: FileShareItem[], gameVariants: FileShareItem[]}>>}
     *          Map of titlePlayerId -> content
     */
    async getBulkPlayerContent(titlePlayerIds, options = {}) {
        if (!Array.isArray(titlePlayerIds)) throw new TypeError('titlePlayerIds must be an array');
        const results = new Map();

        await mapWithConcurrency(titlePlayerIds, options.concurrency ?? 5, async (titlePlayerId) => {
            try {
                const itemsResult = await this.getPlayerItems(titlePlayerId);
                const items = itemsResult.data?.Items || [];

                results.set(titlePlayerId, {
                    items,
                    maps: items.filter(item => item.isMapVariant),
                    gameVariants: items.filter(item => item.isGameVariant)
                });
            } catch (error) {
                results.set(titlePlayerId, { items: [], maps: [], gameVariants: [], error: error.message });
            }
        });
        return results;
    }

    /**
     * Find a player's map variant by name and return its download details.
     *
     * @param {string} titlePlayerId - Creator's Title Player ID
     * @param {string} mapName - Name of the map to find (fuzzy match supported)
     * @returns {Promise<FileShareItemDetails|null>} Item details with Download URL if found
     */
    async findMapInUserShare(titlePlayerId, mapName) {
        if (!titlePlayerId || !mapName) return null;

        try {
            const maps = await this.getPlayerMaps(titlePlayerId);

            let match = maps.find(m =>
                m.title === mapName ||
                m.fileName === mapName
            );

            if (!match) {
                const searchLower = mapName.toLowerCase();
                match = maps.find(m => {
                    return (m.title.toLowerCase().includes(searchLower) ||
                        (m.fileName && m.fileName.toLowerCase().includes(searchLower)));
                });
            }

            if (match) {
                return this.getItemDetails(match.id);
            }
        } catch (error) {
            this.client.log.debug(`Unable to find map '${mapName}' in ${titlePlayerId}`, error);
        }

        return null;
    }

    /**
     * Find a specific game variant in a player's File Share.
     *
     * @param {string} titlePlayerId - Creator's Title Player ID
     * @param {string} gameVariantName - Name of the game variant
     * @returns {Promise<FileShareItemDetails|null>} Item details with Download URL if found
     */
    async findGameVariantInUserShare(titlePlayerId, gameVariantName) {
        if (!titlePlayerId || !gameVariantName) return null;

        try {
            const variants = await this.getPlayerGameVariants(titlePlayerId);

            let match = variants.find(v =>
                v.title === gameVariantName ||
                v.fileName === gameVariantName
            );

            if (!match) {
                const searchLower = gameVariantName.toLowerCase();
                match = variants.find(v => {
                    return (v.title.toLowerCase().includes(searchLower) ||
                        (v.fileName && v.fileName.toLowerCase().includes(searchLower)));
                });
            }

            if (match) {
                return this.getItemDetails(match.id);
            }
        } catch (error) {
            this.client.log.debug(`Unable to find game variant '${gameVariantName}' in ${titlePlayerId}`, error);
        }
        return null;
    }
}
