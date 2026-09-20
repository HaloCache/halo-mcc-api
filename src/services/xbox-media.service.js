/**
 * Access to Xbox Game DVR screenshots and game clips.
 *
 * Metadata and download access depend on the target account's privacy settings.
 *
 * @module services/xbox-media
 */



/** @typedef {import('../types/xbox-media.types.js').Screenshot} Screenshot */
/** @typedef {import('../types/xbox-media.types.js').GameClip} GameClip */
/** @typedef {import('../types/xbox-media.types.js').ScreenshotsResponse} ScreenshotsResponse */
/** @typedef {import('../types/xbox-media.types.js').GameClipsResponse} GameClipsResponse */

import { XboxScreenshot, XboxGameClip } from '../models/xbox-media.model.js';

/**
 * @constant {number}
 */
export const MCC_TITLE_ID = 1144039928;

/**
 * Xbox Media Service - Screenshots and Game Clips from Xbox Game DVR
 *
 * @class XboxMediaService
 */
export class XboxMediaService {
    /**
     * @param {Object} client - MccClient instance with auth
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Get Xbox authorization headers
     *
     * @private
     * @returns {Promise<Object>} Headers with XSTS authorization
     */
    async _getHeaders() {
        const xboxToken = await this.client.auth.getXboxToken('http://xboxlive.com');
        return {
            'Authorization': `XBL3.0 x=${xboxToken.userHash};${xboxToken.token}`,
            'x-xbl-contract-version': '5',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
    }

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
    async getPlayerScreenshots(xuid, options = {}) {
        const headers = await this._getHeaders();
        const params = {
            maxItems: options.maxItems || 25
        };
        if (options.continuationToken) {
            params.continuationToken = options.continuationToken;
        }

        const response = await this.client.http.get(
            `https://screenshotsmetadata.xboxlive.com/users/xuid(${encodeURIComponent(xuid)})/screenshots`,
            { headers, params }
        );

        if (response.data && Array.isArray(response.data.screenshots)) {
            response.data.screenshots = XboxScreenshot.fromArray(response.data.screenshots);
        }

        return response.data;
    }

    /**
     * Get own screenshots (authenticated user)
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum items to return
     * @param {string} [options.continuationToken] - Token for pagination
     * @returns {Promise<ScreenshotsResponse>} Screenshots response
     */
    async getOwnScreenshots(options = {}) {
        const headers = await this._getHeaders();
        const params = {
            maxItems: options.maxItems || 25
        };
        if (options.continuationToken) {
            params.continuationToken = options.continuationToken;
        }

        const response = await this.client.http.get(
            'https://screenshotsmetadata.xboxlive.com/users/me/screenshots',
            { headers, params }
        );

        if (response.data && Array.isArray(response.data.screenshots)) {
            response.data.screenshots = XboxScreenshot.fromArray(response.data.screenshots);
        }

        return response.data;
    }

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
    async _collectByTitle(fetchPage, listKey, options = {}) {
        const maxItems = options.maxItems ?? 25;
        const pageSize = options.pageSize ?? 100;
        const maxPages = options.maxPages ?? 10;

        const matches = [];
        let continuationToken = options.continuationToken;

        for (let page = 0; page < maxPages && matches.length < maxItems; page++) {
            const response = await fetchPage({ maxItems: pageSize, continuationToken });
            const items = response?.[listKey] || [];

            for (const item of items) {
                if (item.titleId === MCC_TITLE_ID) matches.push(item);
                if (matches.length >= maxItems) break;
            }

            continuationToken = response?.pagingInfo?.continuationToken;
            if (!continuationToken || items.length === 0) break;
        }

        return matches.slice(0, maxItems);
    }

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
    async getPlayerMccScreenshots(xuid, options = {}) {
        return this._collectByTitle(
            (opts) => this.getPlayerScreenshots(xuid, opts),
            'screenshots',
            options
        );
    }

    /**
     * Get own MCC screenshots
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum MCC screenshots to return
     * @param {number} [options.pageSize=100] - Items fetched per underlying request
     * @param {number} [options.maxPages=10] - Safety bound on pages fetched
     * @returns {Promise<Screenshot[]>} MCC screenshots only
     */
    async getOwnMccScreenshots(options = {}) {
        return this._collectByTitle(
            (opts) => this.getOwnScreenshots(opts),
            'screenshots',
            options
        );
    }

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
    async getPlayerGameClips(xuid, options = {}) {
        const headers = await this._getHeaders();
        const params = {
            maxItems: options.maxItems || 25
        };
        if (options.continuationToken) {
            params.continuationToken = options.continuationToken;
        }

        const response = await this.client.http.get(
            `https://gameclipsmetadata.xboxlive.com/users/xuid(${encodeURIComponent(xuid)})/clips`,
            { headers, params }
        );

        if (response.data && Array.isArray(response.data.gameClips)) {
            response.data.gameClips = XboxGameClip.fromArray(response.data.gameClips);
        }

        return response.data;
    }

    /**
     * Get own game clips (authenticated user)
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum items to return
     * @param {string} [options.continuationToken] - Token for pagination
     * @returns {Promise<GameClipsResponse>} Game clips response
     */
    async getOwnGameClips(options = {}) {
        const headers = await this._getHeaders();
        const params = {
            maxItems: options.maxItems || 25
        };
        if (options.continuationToken) {
            params.continuationToken = options.continuationToken;
        }

        const response = await this.client.http.get(
            'https://gameclipsmetadata.xboxlive.com/users/me/clips',
            { headers, params }
        );

        if (response.data && Array.isArray(response.data.gameClips)) {
            response.data.gameClips = XboxGameClip.fromArray(response.data.gameClips);
        }

        return response.data;
    }

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
    async getPlayerMccGameClips(xuid, options = {}) {
        return this._collectByTitle(
            (opts) => this.getPlayerGameClips(xuid, opts),
            'gameClips',
            options
        );
    }

    /**
     * Get own MCC game clips
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum MCC clips to return
     * @param {number} [options.pageSize=100] - Items fetched per underlying request
     * @param {number} [options.maxPages=10] - Safety bound on pages fetched
     * @returns {Promise<GameClip[]>} MCC game clips only
     */
    async getOwnMccGameClips(options = {}) {
        return this._collectByTitle(
            (opts) => this.getOwnGameClips(opts),
            'gameClips',
            options
        );
    }

    /**
     * Get all Xbox media (screenshots + clips) for a player
     *
     * @param {string} xuid - Xbox User ID
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum items per type
     * @param {boolean} [options.mccOnly=false] - Only return MCC content
     * @returns {Promise<{screenshots: Screenshot[], gameClips: GameClip[]}>} Combined media
     */
    async getPlayerMedia(xuid, options = {}) {
        const [screenshotsRes, clipsRes] = await Promise.all([
            this.getPlayerScreenshots(xuid, options),
            this.getPlayerGameClips(xuid, options)
        ]);

        let screenshots = screenshotsRes.screenshots || [];
        let gameClips = clipsRes.gameClips || [];

        if (options.mccOnly) {
            screenshots = screenshots.filter(ss => ss.titleId === MCC_TITLE_ID);
            gameClips = gameClips.filter(clip => clip.titleId === MCC_TITLE_ID);
        }

        return { screenshots, gameClips };
    }

    /**
     * Get own Xbox media (screenshots + clips)
     *
     * @param {Object} [options] - Query options
     * @param {number} [options.maxItems=25] - Maximum items per type
     * @param {boolean} [options.mccOnly=false] - Only return MCC content
     * @returns {Promise<{screenshots: Screenshot[], gameClips: GameClip[]}>} Combined media
     */
    async getOwnMedia(options = {}) {
        const [screenshotsRes, clipsRes] = await Promise.all([
            this.getOwnScreenshots(options),
            this.getOwnGameClips(options)
        ]);

        let screenshots = screenshotsRes.screenshots || [];
        let gameClips = clipsRes.gameClips || [];

        if (options.mccOnly) {
            screenshots = screenshots.filter(ss => ss.titleId === MCC_TITLE_ID);
            gameClips = gameClips.filter(clip => clip.titleId === MCC_TITLE_ID);
        }

        return { screenshots, gameClips };
    }

    /**
     * Get thumbnail URL for a screenshot or game clip
     * Thumbnails are publicly accessible.
     *
     * @param {Screenshot|GameClip} item - Screenshot or game clip
     * @param {number} [type=1] - Thumbnail type (1=small, 2=large)
     * @returns {string|null} Thumbnail URL or null
     */
    getThumbnailUrl(item, type = 1) {
        const thumbnails = item.thumbnails || [];
        const thumb = thumbnails.find(t => t.thumbnailType === type);
        return thumb?.uri || thumbnails[0]?.uri || null;
    }

    /**
     * Get small thumbnail URL (Type 1)
     * @param {Screenshot|GameClip} item
     * @returns {string|null}
     */
    getSmallThumbnailUrl(item) {
        return this.getThumbnailUrl(item, 1);
    }

    /**
     * Get large thumbnail URL (Type 2)
     * @param {Screenshot|GameClip} item
     * @returns {string|null}
     */
    getLargeThumbnailUrl(item) {
        return this.getThumbnailUrl(item, 2);
    }

    /**
     * Get the full content URL from the type-2 media entry.
     * Returns null when no processed, accessible full-content entry is available.
     *
     * @param {Screenshot|GameClip} item
     * @returns {string|null} Full URL (with SAS token) or null
     */
    getFullContentUrl(item) {
        return item.url || null;
    }

    /**
     * Get full content URL for a screenshot
     * Note: URLs expire and include SAS tokens.
     *
     * @param {Screenshot} screenshot - Screenshot object
     * @returns {string|null} Full image URL or null
     */
    getScreenshotUrl(screenshot) {
        return this.getFullContentUrl(screenshot);
    }

    /**
     * Get video URL for a game clip
     * Note: URLs expire and include SAS tokens.
     *
     * @param {GameClip} gameClip - Game clip object
     * @returns {string|null} Video URL or null
     */
    getGameClipUrl(gameClip) {
        return this.getFullContentUrl(gameClip);
    }
}
