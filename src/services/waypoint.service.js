/**
 * Waypoint Service
 *
 * Provides access to Halo Waypoint APIs including Spartan tokens,
 * challenges, and message of the day.
 * @module services/waypoint
 */

import { ENDPOINTS, DEFAULT_HEADERS, RELYING_PARTIES } from '../constants.js';

/** @typedef {import('../types/waypoint.types.js').SpartanTokenResponse} SpartanTokenResponse */
/** @typedef {import('../types/waypoint.types.js').ChallengesDeck} ChallengesDeck */
/** @typedef {import('../types/waypoint.types.js').MOTDResponse} MOTDResponse */

/**
 * Waypoint Service - Halo Waypoint API operations
 *
 * @class WaypointService
 */
export class WaypointService {
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient instance
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Get Spartan token for Waypoint API authentication.
     *
     * @returns {Promise<string>} Spartan token string (format: v4=base64...)
     */
    async getSpartanToken() {
        return this.client.getSpartanToken();
    }

    /**
     * Get flight configuration (clearance) ID.
     * Required for some CMS API calls.
     *
     * @returns {Promise<string>} Flight configuration ID
     */
    async getClearance() {
        return this.client.getClearance();
    }

    /**
     * Get player challenges/decks.
     *
     * @returns {Promise<{AssignedDecks: ChallengesDeck[]}>} Challenge decks data
     */
    async getChallenges() {
        const spartanToken = await this.getSpartanToken();
        const xsts = await this.client.getXboxToken(RELYING_PARTIES.XBOX_LIVE);
        const xuid = xsts.userXUID;

        const response = await this.client.http.get(
            `${ENDPOINTS.WAYPOINT.CHALLENGES}/xuid(${encodeURIComponent(xuid)})/decks`,
            {
                headers: {
                    'Accept': 'application/json',
                    'X-343-Authorization-Spartan': spartanToken
                }
            }
        );

        return response.data;
    }

    /**
     * Get challenge details from CMS.
     *
     * @param {string} challengePath - CMS path to challenge definition
     * @returns {Promise<Object>} Challenge definition
     */
    async getChallengeDetails(challengePath) {
        if (typeof challengePath !== 'string' || !/^[\w.\-/]+$/.test(challengePath) || challengePath.includes('..')) {
            throw new Error(`Invalid challengePath: ${challengePath}`);
        }

        const clearance = await this.getClearance();
        const url = `${ENDPOINTS.GAME_CMS.BASE}/progression/file/${challengePath}?flight=${encodeURIComponent(clearance)}`;

        const response = await this.client.http.get(url, {
            headers: { 'Accept': 'application/json' }
        });

        return response.data;
    }

    /**
     * Get Message of the Day.
     *
     * @returns {Promise<MOTDResponse>} MOTD content
     */
    async getMOTD() {
        const [motdRes, versionRes] = await Promise.all([
            this.client.http.get(ENDPOINTS.GAME_CMS.MOTD, {
                headers: { 'Accept-Language': 'en-US' }
            }),
            this.client.http.get(ENDPOINTS.GAME_CMS.VERSION, {
                headers: { 'Accept-Language': 'en-US' }
            })
        ]);

        return {
            ...versionRes.data,
            motd_data: motdRes.data
        };
    }

    /**
     * Get available seasons info.
     *
     * @returns {Promise<{Seasons: Object[]}>} Seasons data
     */
    async getSeasons() {
        const clearance = await this.getClearance();
        const url = `${ENDPOINTS.GAME_CMS.BASE}/progression/file/game/seasons_v2.json?flight=${clearance}`;

        const response = await this.client.http.get(url, {
            headers: {
                'Accept': 'Application/json',
                'Accept-Language': 'en-US'
            }
        });

        return response.data;
    }
}
