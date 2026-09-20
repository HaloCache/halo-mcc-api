/**
 * Player Type Definitions
 * @module types/player
 */
export type XboxProfile = {
    /**
     * - Xbox User ID (XUID) as string
     */
    id: string;
    /**
     * - Host ID (same as XUID)
     */
    hostId: string;
    /**
     * - Array of profile settings
     */
    settings: XboxProfileSetting[];
    /**
     * - Whether this is a sponsored account
     */
    isSponsoredUser: boolean;
};
export type XboxProfileSetting = {
    /**
     * - Setting name (e.g., "Gamertag", "GameDisplayPicRaw")
     */
    id: string;
    /**
     * - Setting value
     */
    value: string;
};
export type XboxProfileBatchResponse = {
    /**
     * - Array of profile results
     */
    profileUsers: XboxProfile[];
};
export type PlayFabEntity = {
    /**
     * - Entity identifier
     */
    Id: string;
    /**
     * - Entity type
     */
    Type: string;
    /**
     * - Human-readable entity type
     */
    TypeString?: string;
};
export type PlayFabProfile = {
    /**
     * - Entity identification
     */
    Entity: PlayFabEntity;
    /**
     * - Title ID (e.g., "EE38")
     */
    TitleId: string;
    /**
     * - Entity objects (player customization data)
     */
    Objects: Object;
    /**
     * - Entity files
     */
    Files: Object;
    /**
     * - Language settings
     */
    Language: Object;
    /**
     * - Player statistics
     */
    Statistics: Object;
};
export type PlayFabIdMapping = {
    /**
     * - Original XUID
     */
    XboxLiveAccountId: string;
    /**
     * - Corresponding PlayFab Master Account ID
     */
    PlayFabId: string;
};
export type TitlePlayerAccount = {
    /**
     * - Title Player Account ID (used for entity operations)
     */
    Id: string;
    /**
     * - Always "title_player_account"
     */
    Type: string;
    /**
     * - Always "title_player_account"
     */
    TypeString: string;
};
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
declare const _default: {};
export default _default;
