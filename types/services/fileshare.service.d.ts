/**
 * Access to player FileShare content, including map and game variants.
 *
 * @module services/fileshare
 */
export type FileShareItemDetails = import('../types/fileshare.types.js').FileShareItemDetails;
export type FileShareResponse = import('../types/fileshare.types.js').FileShareResponse;
export type EnrichedResponse = import('../utils/response-enrichment.js').EnrichedResponse;
/** @typedef {import('../types/fileshare.types.js').FileShareItemDetails} FileShareItemDetails */
/** @typedef {import('../types/fileshare.types.js').FileShareResponse} FileShareResponse */
/** @typedef {import('../utils/response-enrichment.js').EnrichedResponse} EnrichedResponse */
import { FileShareItem } from '../models/fileshare.model.js';
/**
 * Supported FileShare content types.
 *
 * @type {string[]}
 */
export declare const CONTENT_TYPES: string[];
/**
 * Content types outside the supported CONTENT_TYPES list.
 *
 * @type {string[]}
 */
export declare const UNVERIFIED_CONTENT_TYPES: string[];
/**
 * Access to player FileShare content, including map and game variants.
 *
 * @class FileShareService
 */
export declare class FileShareService {
    client: import("../client.js").MccClient;
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient instance
     */
    constructor(client: import('../client.js').MccClient);
    /**
     * Get a player's FileShare items with request and response metadata.
     *
     * @param {string} creatorEntityId - PlayFab Title Player Account ID of the player whose files to fetch
     * @returns {Promise<EnrichedResponse>} Enriched response with data and metadata
     * @throws {Error} If the API request fails
     */
    getPlayerItems(creatorEntityId: string): Promise<EnrichedResponse>;
    /**
     * Get player's screenshots.
     *
     * @param {string} creatorEntityId - PlayFab Title Player Account ID
     * @returns {Promise<FileShareItem[]>} Array of screenshot items
     */
    getPlayerScreenshots(creatorEntityId: string): Promise<FileShareItem[]>;
    /**
     * Get player's map variants.
     *
     * @param {string} creatorEntityId - PlayFab Title Player Account ID
     * @returns {Promise<FileShareItem[]>} Array of map variant items
     */
    getPlayerMaps(creatorEntityId: string): Promise<FileShareItem[]>;
    /**
     * Get player's game variants.
     *
     * @param {string} creatorEntityId - PlayFab Title Player Account ID
     * @returns {Promise<FileShareItem[]>} Array of game variant items
     */
    getPlayerGameVariants(creatorEntityId: string): Promise<FileShareItem[]>;
    /**
     * Get player's films/recordings.
     *
     * @param {string} creatorEntityId - PlayFab Title Player Account ID
     * @returns {Promise<FileShareItem[]>} Array of film items
     */
    getPlayerFilms(creatorEntityId: string): Promise<FileShareItem[]>;
    /**
     * Get details for a specific FileShare item, including download URL.
     *
     * @param {string} itemId - UGC Item ID
     * @returns {Promise<FileShareItemDetails|null>} Item details with download URL
     */
    getItemDetails(itemId: string, retryCount?: number): Promise<FileShareItemDetails | null>;
    /**
     * Download a FileShare item to a local file.
     *
     * @param {string} itemId - UGC Item ID
     * @param {string} outputPath - Local file path to save to
     * @returns {Promise<boolean>} True if download succeeded
     */
    downloadItem(itemId: string, outputPath: string): Promise<boolean>;
    /**
     * Fetch item binary data as a readable stream without buffering the full file.
     *
     * @param {string} itemId - UGC Item ID
     * @returns {Promise<import('stream').Readable>} Readable stream of binary data
     */
    fetchItemBinaryStream(itemId: string): Promise<import('stream').Readable>;
    /**
     * Get FileShare items for the authenticated user.
     *
     * @returns {Promise<FileShareResponse>} Own FileShare data
     */
    getOwnItems(): Promise<FileShareResponse>;
    /**
     * Get own screenshots.
     *
     * @returns {Promise<FileShareItem[]>} Array of own screenshot items
     */
    getOwnScreenshots(): Promise<FileShareItem[]>;
    /**
     * Get own map variants.
     *
     * @returns {Promise<FileShareItem[]>} Array of own map variant items
     */
    getOwnMaps(): Promise<FileShareItem[]>;
    /**
     * Get own game variants.
     *
     * @returns {Promise<FileShareItem[]>} Array of own game variant items
     */
    getOwnGameVariants(): Promise<FileShareItem[]>;
    /**
     * Resolve a gamertag to its Title Player ID and fetch FileShare content.
     *
     * @param {string} gamertag - Xbox Gamertag
     * @returns {Promise<{items: FileShareItem[], maps: FileShareItem[], gameVariants: FileShareItem[], player: Object, completeness: 'complete', count: number}|null>}
     *          Player's content or null if gamertag not found
     */
    getItemsByGamertag(gamertag: string): Promise<{
        items: FileShareItem[];
        maps: FileShareItem[];
        gameVariants: FileShareItem[];
        player: Object;
        completeness: 'complete';
        count: number;
    } | null>;
    /**
     * Resolve an XUID through PlayFab and fetch the player's FileShare items.
     *
     * @param {string} xuid - Xbox User ID
     * @returns {Promise<{items: FileShareItem[], maps: FileShareItem[], gameVariants: FileShareItem[], player: Object, completeness: 'complete', count: number}|null>}
     */
    getItemsByXuid(xuid: string): Promise<{
        items: FileShareItem[];
        maps: FileShareItem[];
        gameVariants: FileShareItem[];
        player: Object;
        completeness: 'complete';
        count: number;
    } | null>;
    /**
     * Batch fetch FileShare content for multiple players.
     *
     * @param {string[]} titlePlayerIds - Array of Title Player Account IDs
     * @param {Object} [options]
     * @param {number} [options.concurrency=5] - Maximum simultaneous FileShare requests
     * @returns {Promise<Map<string, {items: FileShareItem[], maps: FileShareItem[], gameVariants: FileShareItem[]}>>}
     *          Map of titlePlayerId -> content
     */
    getBulkPlayerContent(titlePlayerIds: string[], options?: {
        concurrency?: number;
    }): Promise<Map<string, {
        items: FileShareItem[];
        maps: FileShareItem[];
        gameVariants: FileShareItem[];
    }>>;
    /**
     * Find a player's map variant by name and return its download details.
     *
     * @param {string} titlePlayerId - Creator's Title Player ID
     * @param {string} mapName - Name of the map to find (fuzzy match supported)
     * @returns {Promise<FileShareItemDetails|null>} Item details with Download URL if found
     */
    findMapInUserShare(titlePlayerId: string, mapName: string): Promise<FileShareItemDetails | null>;
    /**
     * Find a specific game variant in a player's File Share.
     *
     * @param {string} titlePlayerId - Creator's Title Player ID
     * @param {string} gameVariantName - Name of the game variant
     * @returns {Promise<FileShareItemDetails|null>} Item details with Download URL if found
     */
    findGameVariantInUserShare(titlePlayerId: string, gameVariantName: string): Promise<FileShareItemDetails | null>;
}
