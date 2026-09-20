/**
 * FileShare Type Definitions
 *
 * @module types/fileshare
 */

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

export default {};
