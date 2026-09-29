/**
 * FileShare Type Definitions
 *
 * @module types/fileshare
 */
export type FileShareResponse = {
    /**
     * - Total count of items
     */
    Count: number;
    /**
     * - Array of UGC items
     */
    Items: FileShareItem[];
};
export type FileShareItem = {
    /**
     * - Unique item ID (UUID format)
     */
    Id: string;
    /**
     * - Always "ugc"
     */
    Type: string;
    /**
     * - Item type
     */
    ContentType: "MapVariant" | "GameVariant";
    /**
     * - Localized title
     */
    Title: FileShareTitle;
    /**
     * - Localized description
     */
    Description: FileShareTitle;
    /**
     * - Creator identification
     */
    CreatorEntity: FileShareCreatorEntity;
    /**
     * - Game-specific metadata
     */
    DisplayProperties: FileShareDisplayProperties;
    /**
     * - ISO 8601 creation timestamp
     */
    CreationDate: string;
    /**
     * - ISO 8601 last modified timestamp
     */
    LastModifiedDate: string;
    /**
     * - Array of tags (e.g., "HaloReach", "GameCategory_Slayer")
     */
    Tags: string[];
    /**
     * - Platform IDs ("1" = Xbox, "2" = PC)
     */
    Platforms: string[];
    /**
     * - Array of image references
     */
    Images: any[];
    /**
     * - Content references
     */
    Contents: any[];
    /**
     * - Deep link references
     */
    DeepLinks: any[];
    /**
     * - Alternate IDs
     */
    AlternateIds: any[];
    /**
     * - Item references
     */
    ItemReferences: any[];
    /**
     * - Keyword map
     */
    Keywords: Object;
    /**
     * - Moderation status
     */
    Moderation: null;
    /**
     * - PlayFab field
     */
    AllowMultipleStacks: null;
    /**
     * - PlayFab field
     */
    BoostFactor: null;
    /**
     * - PlayFab field
     */
    DisplayVersion: null;
    /**
     * - PlayFab field
     */
    EndDate: null;
    /**
     * - PlayFab field
     */
    ETag: null;
    /**
     * - PlayFab field
     */
    IsConsumable: null;
    /**
     * - PlayFab field
     */
    IsHidden: null;
    /**
     * - PlayFab field
     */
    IsStackable: null;
    /**
     * - PlayFab field
     */
    IsTradeable: null;
    /**
     * - PlayFab field
     */
    PayoutDetails: null;
    /**
     * - PlayFab field
     */
    Price: null;
    /**
     * - PlayFab field
     */
    Rating: null;
    /**
     * - PlayFab field
     */
    SourceEntity: null;
    /**
     * - PlayFab field
     */
    StartDate: null;
    /**
     * - PlayFab field
     */
    Subscription: null;
};
export type FileShareTitle = {
    /**
     * - Neutral/default language text
     */
    NEUTRAL: string;
};
export type FileShareCreatorEntity = {
    /**
     * - PlayFab Title Player Account ID (16-char hex)
     */
    Id: string;
    /**
     * - Always "title_player_account"
     */
    Type: "title_player_account";
};
export type FileShareDisplayProperties = {
    /**
     * - ISO 8601 original author timestamp
     */
    AuthorTime: string;
    /**
     * - XUID of original author
     */
    AuthorXuid: string;
    /**
     * - ISO 8601 last editor timestamp
     */
    EditorTime?: string;
    /**
     * - XUID of last editor
     */
    EditorXuid?: string;
    /**
     * - XUID of current file owner
     */
    CreatorId?: string;
    /**
     * - Internal file name (UUID format)
     */
    FileName: string;
    /**
     * - File size in bytes (as string)
     */
    FileSize: string;
    /**
     * - Game engine ID ("2"=H3, "6"=Reach, etc.)
     */
    GameEngine: string;
    /**
     * - Built-in map ID for MapVariant
     */
    BuiltInMapId?: string;
    /**
     * - Game category ID for GameVariant
     */
    GameCategory?: string;
    /**
     * - JSON string with SecureData (see FileAdditionalMetadata type)
     */
    FileAdditionalMetadata?: string;
    /**
     * - Parent item ID if derived from another
     */
    ParentPlayFabId?: string;
    /**
     * - Original platform ID
     */
    SourcePlatform?: string;
};
export type FileAdditionalMetadata = {
    /**
     * - Secure chain-of-custody data
     */
    SecureData: SecureData;
    /**
     * - RSA signature (512+ hex chars)
     */
    SecureDataSignature: string;
};
export type SecureData = {
    /**
     * - Information about the original/parent item
     */
    ParentData: ParentData;
    /**
     * - Information about the current copy
     */
    CurrentData: ParentData;
    /**
     * - 343 Industries signing certificate (40 hex chars)
     */
    CertificateThumbprint: string;
};
export type ParentData = {
    /**
     * - XUID of parent owner (0 if original, >0 if copied)
     */
    ParentUserXuid: number;
    /**
     * - SHA-256 content hash (64 hex chars, empty if original)
     */
    ParentPayloadHash: string;
    /**
     * - Parent item UUID (empty if original)
     */
    ParentUgcItemPlayfabId: string;
};
export type FileShareItemDetails = {
    /**
     * - Full item details
     */
    Item: FileShareItem;
    /**
     * - Temporary Azure blob download URL (~1 hour validity)
     */
    DownloadUrl: string;
    /**
     * - URL expiration timestamp
     */
    DownloadExpiration: string;
};
/**
 * @typedef {Object} FileShareResponse
 * @property {number} Count - Total count of items
 * @property {FileShareItem[]} Items - Array of UGC items
 */
/**
 * FileShare item from GetPlayFabUgcItems endpoint.
 *
 * @typedef {Object} FileShareItem
 * @property {string} Id - Unique item ID (UUID format)
 * @property {string} Type - Always "ugc"
 * @property {"MapVariant"|"GameVariant"} ContentType - Item type
 * @property {FileShareTitle} Title - Localized title
 * @property {FileShareTitle} Description - Localized description
 * @property {FileShareCreatorEntity} CreatorEntity - Creator identification
 * @property {FileShareDisplayProperties} DisplayProperties - Game-specific metadata
 * @property {string} CreationDate - ISO 8601 creation timestamp
 * @property {string} LastModifiedDate - ISO 8601 last modified timestamp
 * @property {string[]} Tags - Array of tags (e.g., "HaloReach", "GameCategory_Slayer")
 * @property {string[]} Platforms - Platform IDs ("1" = Xbox, "2" = PC)
 * @property {any[]} Images - Array of image references
 * @property {any[]} Contents - Content references
 * @property {any[]} DeepLinks - Deep link references
 * @property {any[]} AlternateIds - Alternate IDs
 * @property {any[]} ItemReferences - Item references
 * @property {Object} Keywords - Keyword map
 * @property {null} Moderation - Moderation status
 * @property {null} AllowMultipleStacks - PlayFab field
 * @property {null} BoostFactor - PlayFab field
 * @property {null} DisplayVersion - PlayFab field
 * @property {null} EndDate - PlayFab field
 * @property {null} ETag - PlayFab field
 * @property {null} IsConsumable - PlayFab field
 * @property {null} IsHidden - PlayFab field
 * @property {null} IsStackable - PlayFab field
 * @property {null} IsTradeable - PlayFab field
 * @property {null} PayoutDetails - PlayFab field
 * @property {null} Price - PlayFab field
 * @property {null} Rating - PlayFab field
 * @property {null} SourceEntity - PlayFab field
 * @property {null} StartDate - PlayFab field
 * @property {null} Subscription - PlayFab field
 */
/**
 * Localized title/description with neutral language.
 *
 * @typedef {Object} FileShareTitle
 * @property {string} NEUTRAL - Neutral/default language text
 */
/**
 * Creator entity information.
 *
 * @typedef {Object} FileShareCreatorEntity
 * @property {string} Id - PlayFab Title Player Account ID (16-char hex)
 * @property {"title_player_account"} Type - Always "title_player_account"
 */
/**
 * Game-specific display properties for FileShare items.
 *
 * @typedef {Object} FileShareDisplayProperties
 * @property {string} AuthorTime - ISO 8601 original author timestamp
 * @property {string} AuthorXuid - XUID of original author
 * @property {string} [EditorTime] - ISO 8601 last editor timestamp
 * @property {string} [EditorXuid] - XUID of last editor
 * @property {string} [CreatorId] - XUID of current file owner
 * @property {string} FileName - Internal file name (UUID format)
 * @property {string} FileSize - File size in bytes (as string)
 * @property {string} GameEngine - Game engine ID ("2"=H3, "6"=Reach, etc.)
 * @property {string} [BuiltInMapId] - Built-in map ID for MapVariant
 * @property {string} [GameCategory] - Game category ID for GameVariant
 * @property {string} [FileAdditionalMetadata] - JSON string with SecureData (see FileAdditionalMetadata type)
 * @property {string} [ParentPlayFabId] - Parent item ID if derived from another
 * @property {string} [SourcePlatform] - Original platform ID
 */
/**
 * FileAdditionalMetadata structure (parsed from JSON string in DisplayProperties).
 * Contains chain-of-custody information for copied items.
 *
 * @typedef {Object} FileAdditionalMetadata
 * @property {SecureData} SecureData - Secure chain-of-custody data
 * @property {string} SecureDataSignature - RSA signature (512+ hex chars)
 */
/**
 * SecureData containing parent and current chain-of-custody info.
 *
 * @typedef {Object} SecureData
 * @property {ParentData} ParentData - Information about the original/parent item
 * @property {ParentData} CurrentData - Information about the current copy
 * @property {string} CertificateThumbprint - 343 Industries signing certificate (40 hex chars)
 */
/**
 * Chain-of-custody data for item lineage.
 *
 * @typedef {Object} ParentData
 * @property {number} ParentUserXuid - XUID of parent owner (0 if original, >0 if copied)
 * @property {string} ParentPayloadHash - SHA-256 content hash (64 hex chars, empty if original)
 * @property {string} ParentUgcItemPlayfabId - Parent item UUID (empty if original)
 */
/**
 * Full item details including download URL (from GetPlayFabUgcItem).
 *
 * @typedef {Object} FileShareItemDetails
 * @property {FileShareItem} Item - Full item details
 * @property {string} DownloadUrl - Temporary Azure blob download URL (~1 hour validity)
 * @property {string} DownloadExpiration - URL expiration timestamp
 */
declare const _default: {};
export default _default;
