/**
 * Common Type Definitions
 *
 * Shared types used across all services.
 * @module types/common
 */

/**
 * @typedef {Object} ApiError
 * @property {number} code - HTTP status code
 * @property {string} status - Status text (e.g., "Forbidden", "NotFound")
 * @property {string} error - Error type identifier
 * @property {number} errorCode - PlayFab/API-specific error code
 * @property {string} errorMessage - Human-readable error message
 */

/**
 * @typedef {Object} PlayFabResponse
 * @property {number} code - Response code (200 for success)
 * @property {string} status - Status text
 * @property {Object} data - Response payload
 */

/**
 * @typedef {Object} PlayFabLoginResult
 * @property {string} SessionTicket - Session authentication ticket
 * @property {PlayFabEntityToken} EntityToken - Entity token object for API calls
 * @property {string} PlayFabId - Unique PlayFab identifier for this player (16-char hex)
 * @property {boolean} NewlyCreated - Whether this account was just created
 */

/**
 * @typedef {Object} PlayFabEntityToken
 * @property {string} EntityToken - Base64-encoded entity token (JWT-like)
 * @property {string} TokenExpiration - ISO 8601 expiration timestamp
 * @property {PlayFabEntity} Entity - Entity identification
 */

/**
 * @typedef {Object} PlayFabEntity
 * @property {string} Id - Entity ID (16-char hex, matches last segment of PlayFabId)
 * @property {string} Type - Entity type (usually "title_player_account")
 * @property {string} TypeString - Same as Type
 */

/**
 * @typedef {Object} XboxToken
 * @property {string} userHash - User hash (19-digit numeric string)
 * @property {string} token - Encrypted JWT token
 * @property {string} tokenString - Formatted token string "XBL3.0 x=<userHash>;<token>"
 * @property {string} userXUID - Xbox User ID (16-digit decimal)
 */

export default {};
