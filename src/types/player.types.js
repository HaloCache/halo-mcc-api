/**
 * Player Type Definitions
 * @module types/player
 */

/**
 * @typedef {Object} XboxProfile
 * @property {string} id - Xbox User ID (XUID) as string
 * @property {string} hostId - Host ID (same as XUID)
 * @property {XboxProfileSetting[]} settings - Array of profile settings
 * @property {boolean} isSponsoredUser - Whether this is a sponsored account
 */

/**
 * @typedef {Object} XboxProfileSetting
 * @property {string} id - Setting name (e.g., "Gamertag", "GameDisplayPicRaw")
 * @property {string} value - Setting value
 */

/**
 * @typedef {Object} XboxProfileBatchResponse
 * @property {XboxProfile[]} profileUsers - Array of profile results
 */

/**
 * @typedef {Object} PlayFabEntity
 * @property {string} Id - Entity identifier
 * @property {string} Type - Entity type
 * @property {string} [TypeString] - Human-readable entity type
 */

/**
 * @typedef {Object} PlayFabProfile
 * @property {PlayFabEntity} Entity - Entity identification
 * @property {string} TitleId - Title ID (e.g., "EE38")
 * @property {Object} Objects - Entity objects (player customization data)
 * @property {Object} Files - Entity files
 * @property {Object} Language - Language settings
 * @property {Object} Statistics - Player statistics
 */

/**
 * @typedef {Object} PlayFabIdMapping
 * @property {string} XboxLiveAccountId - Original XUID
 * @property {string} PlayFabId - Corresponding PlayFab Master Account ID
 */

/**
 * @typedef {Object} TitlePlayerAccount
 * @property {string} Id - Title Player Account ID (used for entity operations)
 * @property {string} Type - Always "title_player_account"
 * @property {string} TypeString - Always "title_player_account"
 */

export default {};
