/**
 * Game CMS Service
 *
 * Provides access to Halo MCC Game Content Management System (CMS) data.
 * Includes Message of the Day (MOTD), Version info, and Playlists.
 * @module services/cms
 */
/**
 * @class CmsService
 */
export declare class CmsService {
    client: import("../client.js").MccClient;
    /**
     * @param {import('../client.js').MccClient} client - MccClient instance
     */
    constructor(client: import('../client.js').MccClient);
    /**
     * Get Message of the Day (MOTD) and global pivot data
     *
     * @returns {Promise<Object>} MOTD data including news sections
     */
    getMotd(): Promise<Object>;
    /**
     * Get Game CMS Version information
     *
     * @returns {Promise<Object>} Version data
     */
    getVersion(): Promise<Object>;
}
