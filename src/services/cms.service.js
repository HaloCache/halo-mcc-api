/**
 * Game CMS Service
 *
 * Provides access to Halo MCC Game Content Management System (CMS) data.
 * Includes Message of the Day (MOTD), Version info, and Playlists.
 * @module services/cms
 */

import { ENDPOINTS } from '../constants.js';

/**
 * @class CmsService
 */
export class CmsService {
    /**
     * @param {import('../client.js').MccClient} client - MccClient instance
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Get Message of the Day (MOTD) and global pivot data
     *
     * @returns {Promise<Object>} MOTD data including news sections
     */
    async getMotd() {
        const response = await this.client.http.get(ENDPOINTS.GAME_CMS.MOTD);
        return response.data;
    }

    /**
     * Get Game CMS Version information
     *
     * @returns {Promise<Object>} Version data
     */
    async getVersion() {
        const response = await this.client.http.get(ENDPOINTS.GAME_CMS.VERSION);
        return response.data;
    }
}
