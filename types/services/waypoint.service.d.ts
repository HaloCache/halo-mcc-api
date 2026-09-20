/**
 * Waypoint Service
 *
 * Provides access to Halo Waypoint APIs including Spartan tokens,
 * challenges, and message of the day.
 * @module services/waypoint
 */
export type SpartanTokenResponse = import('../types/waypoint.types.js').SpartanTokenResponse;
export type ChallengesDeck = import('../types/waypoint.types.js').ChallengesDeck;
export type MOTDResponse = import('../types/waypoint.types.js').MOTDResponse;
/** @typedef {import('../types/waypoint.types.js').SpartanTokenResponse} SpartanTokenResponse */
/** @typedef {import('../types/waypoint.types.js').ChallengesDeck} ChallengesDeck */
/** @typedef {import('../types/waypoint.types.js').MOTDResponse} MOTDResponse */
/**
 * Waypoint Service - Halo Waypoint API operations
 *
 * @class WaypointService
 */
export declare class WaypointService {
    client: import("../client.js").MccClient;
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient instance
     */
    constructor(client: import('../client.js').MccClient);
    /**
     * Get Spartan token for Waypoint API authentication.
     *
     * @returns {Promise<string>} Spartan token string (format: v4=base64...)
     */
    getSpartanToken(): Promise<string>;
    /**
     * Get flight configuration (clearance) ID.
     * Required for some CMS API calls.
     *
     * @returns {Promise<string>} Flight configuration ID
     */
    getClearance(): Promise<string>;
    /**
     * Get player challenges/decks.
     *
     * @returns {Promise<{AssignedDecks: ChallengesDeck[]}>} Challenge decks data
     */
    getChallenges(): Promise<{
        AssignedDecks: ChallengesDeck[];
    }>;
    /**
     * Get challenge details from CMS.
     *
     * @param {string} challengePath - CMS path to challenge definition
     * @returns {Promise<Object>} Challenge definition
     */
    getChallengeDetails(challengePath: string): Promise<Object>;
    /**
     * Get Message of the Day.
     *
     * @returns {Promise<MOTDResponse>} MOTD content
     */
    getMOTD(): Promise<MOTDResponse>;
    /**
     * Get available seasons info.
     *
     * @returns {Promise<{Seasons: Object[]}>} Seasons data
     */
    getSeasons(): Promise<{
        Seasons: Object[];
    }>;
}
