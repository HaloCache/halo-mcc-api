/**
 * Waypoint Type Definitions
 * @module types/waypoint
 */

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

export default {};
