/**
 * Waypoint Type Definitions
 * @module types/waypoint
 */
export type SpartanTokenResponse = {
    /**
     * - JWT-like token for Halo Waypoint API calls (format: v4=base64...)
     */
    SpartanToken: string;
    /**
     * - Expiration timestamp
     */
    ExpiresUtc: SpartanExpiry;
    /**
     * - ISO 8601 duration string (e.g., "PT3H59M58S")
     */
    TokenDuration: string;
};
export type SpartanExpiry = {
    /**
     * - ISO 8601 formatted expiration timestamp
     */
    ISO8601Date: string;
};
export type ClearanceResponse = {
    /**
     * - Flight configuration ID for API calls
     */
    FlightConfigurationId: string;
};
export type ChallengesDeck = {
    /**
     * - Unique deck identifier
     */
    DeckId: string;
    /**
     * - Currently active challenges
     */
    ActiveChallenges: Challenge[];
    /**
     * - Completed challenges
     */
    CompletedChallenges: Challenge[];
    /**
     * - CMS path to deck definition
     */
    Path: Object;
};
export type Challenge = {
    /**
     * - Unique challenge identifier
     */
    ChallengeId: string;
    /**
     * - CMS path to challenge definition
     */
    Path: string;
    /**
     * - Current progress data
     */
    Progress: Object;
    /**
     * - Challenge details (populated after CMS fetch)
     */
    data: Object;
};
export type MOTDResponse = {
    /**
     * - Message of the day content
     */
    motd_data: Object;
    /**
     * - Current content version
     */
    Version: string;
};
/**
 * @typedef {Object} SpartanTokenResponse
 * @property {string} SpartanToken - JWT-like token for Halo Waypoint API calls (format: v4=base64...)
 * @property {SpartanExpiry} ExpiresUtc - Expiration timestamp
 * @property {string} TokenDuration - ISO 8601 duration string (e.g., "PT3H59M58S")
 */
/**
 * @typedef {Object} SpartanExpiry
 * @property {string} ISO8601Date - ISO 8601 formatted expiration timestamp
 */
/**
 * @typedef {Object} ClearanceResponse
 * @property {string} FlightConfigurationId - Flight configuration ID for API calls
 */
/**
 * @typedef {Object} ChallengesDeck
 * @property {string} DeckId - Unique deck identifier
 * @property {Challenge[]} ActiveChallenges - Currently active challenges
 * @property {Challenge[]} CompletedChallenges - Completed challenges
 * @property {Object} Path - CMS path to deck definition
 */
/**
 * @typedef {Object} Challenge
 * @property {string} ChallengeId - Unique challenge identifier
 * @property {string} Path - CMS path to challenge definition
 * @property {Object} Progress - Current progress data
 * @property {Object} data - Challenge details (populated after CMS fetch)
 */
/**
 * @typedef {Object} MOTDResponse
 * @property {Object} motd_data - Message of the day content
 * @property {string} Version - Current content version
 */
declare const _default: {};
export default _default;
