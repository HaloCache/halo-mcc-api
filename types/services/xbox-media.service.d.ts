/**
 * Access to Xbox Game DVR screenshots and game clips.
 *
 * Metadata and download access depend on the target account's privacy settings.
 *
 * @module services/xbox-media
 */
export type Screenshot = import('../types/xbox-media.types.js').Screenshot;
export type GameClip = import('../types/xbox-media.types.js').GameClip;
export type ScreenshotsResponse = import('../types/xbox-media.types.js').ScreenshotsResponse;
export type GameClipsResponse = import('../types/xbox-media.types.js').GameClipsResponse;
/**
 * @constant {number}
 */
export declare const MCC_TITLE_ID = 1144039928;
/**
 * Xbox Media Service - Screenshots and Game Clips from Xbox Game DVR
 *
 * @class XboxMediaService
 */
export declare class XboxMediaService {
    client: Object;
    /**
     * @param {Object} client - MccClient instance with auth
     */
    constructor(client: Object);
    /**
     * Get Xbox authorization headers
     *
     * @private
     * @returns {Promise<Object>} Headers with XSTS authorization
     */
    private _getHeaders;
    /**
     * Get screenshots for a player by XUID
     *
     * @param {string} xuid - Xbox User ID
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum items to return
     * @param {string} [options.continuationToken] - Token for pagination
     * @returns {Promise<ScreenshotsResponse>} Screenshots response
     *
     * @throws {HttpClientError} 403 - Privacy Settings (Common)
     * @throws {HttpClientError} 429 - Rate Limit
     */
    getPlayerScreenshots(xuid: string, options?: {
        maxItems?: number;
        continuationToken?: string;
    }): Promise<ScreenshotsResponse>;
    /**
     * Get own screenshots (authenticated user)
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum items to return
     * @param {string} [options.continuationToken] - Token for pagination
     * @returns {Promise<ScreenshotsResponse>} Screenshots response
     */
    getOwnScreenshots(options?: {
        maxItems?: number;
        continuationToken?: string;
    }): Promise<ScreenshotsResponse>;
    /**
     * Collect title-filtered media across pages until the matching-item limit,
     * page limit, or end of results is reached.
     *
     * @param {Function} fetchPage - (opts) => Promise<response>
     * @param {string} listKey - Response key holding the array ('screenshots' | 'gameClips')
     * @param {Object} [options]
     * @param {number} [options.maxItems=25] - How many *matching* items to return
     * @param {number} [options.pageSize=100] - Items requested per page
     * @param {number} [options.maxPages=10] - Safety bound on pages fetched
     * @returns {Promise<Array>} Matching items, up to maxItems
     * @private
     */
    private _collectByTitle;
    /**
     * Get MCC screenshots for a player
     *
     * @param {string} xuid - Xbox User ID
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum MCC screenshots to return
     * @param {number} [options.pageSize=100] - Items fetched per underlying request
     * @param {number} [options.maxPages=10] - Safety bound on pages fetched
     * @returns {Promise<Screenshot[]>} MCC screenshots only
     */
    getPlayerMccScreenshots(xuid: string, options?: {
        maxItems?: number;
        pageSize?: number;
        maxPages?: number;
    }): Promise<Screenshot[]>;
    /**
     * Get own MCC screenshots
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum MCC screenshots to return
     * @param {number} [options.pageSize=100] - Items fetched per underlying request
     * @param {number} [options.maxPages=10] - Safety bound on pages fetched
     * @returns {Promise<Screenshot[]>} MCC screenshots only
     */
    getOwnMccScreenshots(options?: {
        maxItems?: number;
        pageSize?: number;
        maxPages?: number;
    }): Promise<Screenshot[]>;
    /**
     * Get game clips for a player by XUID
     *
     * @param {string} xuid - Xbox User ID
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum items to return
     * @param {string} [options.continuationToken] - Token for pagination
     * @returns {Promise<GameClipsResponse>} Game clips response
     *
     * @throws {HttpClientError} 403 - Privacy Settings (Common)
     * @throws {HttpClientError} 429 - Rate Limit
     */
    getPlayerGameClips(xuid: string, options?: {
        maxItems?: number;
        continuationToken?: string;
    }): Promise<GameClipsResponse>;
    /**
     * Get own game clips (authenticated user)
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum items to return
     * @param {string} [options.continuationToken] - Token for pagination
     * @returns {Promise<GameClipsResponse>} Game clips response
     */
    getOwnGameClips(options?: {
        maxItems?: number;
        continuationToken?: string;
    }): Promise<GameClipsResponse>;
    /**
     * Get MCC game clips for a player
     *
     * @param {string} xuid - Xbox User ID
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum MCC clips to return
     * @param {number} [options.pageSize=100] - Items fetched per underlying request
     * @param {number} [options.maxPages=10] - Safety bound on pages fetched
     * @returns {Promise<GameClip[]>} MCC game clips only
     */
    getPlayerMccGameClips(xuid: string, options?: {
        maxItems?: number;
        pageSize?: number;
        maxPages?: number;
    }): Promise<GameClip[]>;
    /**
     * Get own MCC game clips
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum MCC clips to return
     * @param {number} [options.pageSize=100] - Items fetched per underlying request
     * @param {number} [options.maxPages=10] - Safety bound on pages fetched
     * @returns {Promise<GameClip[]>} MCC game clips only
     */
    getOwnMccGameClips(options?: {
        maxItems?: number;
        pageSize?: number;
        maxPages?: number;
    }): Promise<GameClip[]>;
    /**
     * Get all Xbox media (screenshots + clips) for a player
     *
     * @param {string} xuid - Xbox User ID
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum items per type
     * @param {boolean} [options.mccOnly=false] - Only return MCC content
     * @returns {Promise<{screenshots: Screenshot[], gameClips: GameClip[]}>} Combined media
     */
    getPlayerMedia(xuid: string, options?: {
        maxItems?: number;
        mccOnly?: boolean;
    }): Promise<{
        screenshots: Screenshot[];
        gameClips: GameClip[];
    }>;
    /**
     * Get own Xbox media (screenshots + clips)
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum items per type
     * @param {boolean} [options.mccOnly=false] - Only return MCC content
     * @returns {Promise<{screenshots: Screenshot[], gameClips: GameClip[]}>} Combined media
     */
    getOwnMedia(options?: {
        maxItems?: number;
        mccOnly?: boolean;
    }): Promise<{
        screenshots: Screenshot[];
        gameClips: GameClip[];
    }>;
    /**
     * Get thumbnail URL for a screenshot or game clip
     * Thumbnails are publicly accessible.
     *
     * @param {Screenshot|GameClip} item - Screenshot or game clip
     * @param {number} [type=1] - Thumbnail type (1=small, 2=large)
     * @returns {string|null} Thumbnail URL or null
     */
    getThumbnailUrl(item: Screenshot | GameClip, type?: number): string | null;
    /**
     * Get small thumbnail URL (Type 1)
     * @param {Screenshot|GameClip} item
     * @returns {string|null}
     */
    getSmallThumbnailUrl(item: Screenshot | GameClip): string | null;
    /**
     * Get large thumbnail URL (Type 2)
     * @param {Screenshot|GameClip} item
     * @returns {string|null}
     */
    getLargeThumbnailUrl(item: Screenshot | GameClip): string | null;
    /**
     * Get the full content URL from the type-2 media entry.
     * Returns null when no processed, accessible full-content entry is available.
     *
     * @param {Screenshot|GameClip} item
     * @returns {string|null} Full URL (with SAS token) or null
     */
    getFullContentUrl(item: Screenshot | GameClip): string | null;
    /**
     * Get full content URL for a screenshot
     * Note: URLs expire and include SAS tokens.
     *
     * @param {Screenshot} screenshot - Screenshot object
     * @returns {string|null} Full image URL or null
     */
    getScreenshotUrl(screenshot: Screenshot): string | null;
    /**
     * Get video URL for a game clip
     * Note: URLs expire and include SAS tokens.
     *
     * @param {GameClip} gameClip - Game clip object
     * @returns {string|null} Video URL or null
     */
    getGameClipUrl(gameClip: GameClip): string | null;
}
