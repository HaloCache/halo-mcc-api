/**
 * FileShare item wrappers with property getters and parsed metadata.
 *
 * @module models/fileshare
 */

import { formatBytes } from '../utils/format-bytes.js';

import {
    GameEngineId,
    SourcePlatformId,
    getGameEngineKey,
    getGameEngineName,
    getSourcePlatformById,
    getGlobalGameVariantById
} from '../types/enums.js';



/**
 * Property accessors for raw PlayFab map and game variants.
 */
export class FileShareItem {
    /** @private @type {Object|null} */
    _parsedMetadata;

    /**
     * @param {Object} raw - Raw item data from API
     */
    constructor(raw) {
        /** @type {Object} Raw API data */
        this._raw = raw;
        this._parsedMetadata = null;
    }

    /** Item ID (UUID) */
    get id() { return this._raw.Id; }

    /** Content type: 'MapVariant' or 'GameVariant' */
    get contentType() { return this._raw.ContentType; }

    get isMapVariant() { return this._raw.ContentType === 'MapVariant'; }

    get isGameVariant() { return this._raw.ContentType === 'GameVariant'; }

    get title() { return this._raw.Title?.NEUTRAL || ''; }

    get description() { return this._raw.Description?.NEUTRAL || ''; }

    /** Creation date as Date object */
    get createdAt() { return new Date(this._raw.CreationDate); }

    /** Last modified date as Date object */
    get modifiedAt() { return new Date(this._raw.LastModifiedDate); }

    /**
     * Alias for the item binary download URL.
     */
    get DownloadUrl() { return this.downloadUrl; }

    /** Creator's Title Player Account ID */
    get creatorEntityId() { return this._raw.CreatorEntity?.Id; }

    /** Creator's entity type. */
    get creatorEntityType() { return this._raw.CreatorEntity?.Type; }

    /** @private */
    get _dp() { return this._raw.DisplayProperties || {}; }

    /**
     * Author's Xbox User ID (original creator).
     *
     * Not guaranteed to be a resolvable account - see {@link allXuids}.
     */
    get authorXuid() { return this._dp.AuthorXuid; }

    /**
     * Last editor's Xbox User ID, independent of author attribution.
     */
    get editorXuid() { return this._dp.EditorXuid; }

    /** Author timestamp as Date */
    get authorTime() { return this._dp.AuthorTime ? new Date(this._dp.AuthorTime) : null; }

    /** Editor timestamp as Date */
    get editorTime() { return this._dp.EditorTime ? new Date(this._dp.EditorTime) : null; }

    /** File size in bytes */
    get fileSize() { return parseInt(this._dp.FileSize || '0', 10); }

    /** File size formatted (KB/MB) */
    get fileSizeFormatted() {
        return formatBytes(this.fileSize);
    }

    /** Game engine ID (raw string from API) */
    get gameEngineId() { return this._dp.GameEngine; }

    /** GameEngine enum key. */
    get gameEngine() { return getGameEngineKey(this._dp.GameEngine); }

    /** Engine display name. */
    get gameEngineDisplayName() { return getGameEngineName(this._dp.GameEngine); }

    /** Game category ID (GameVariants only, raw string from API) */
    get gameCategoryId() { return this._dp.GameCategory; }

    /** Game category name (GameVariants only) */
    get gameCategory() {
        const variant = getGlobalGameVariantById(this._dp.GameCategory);
        return variant ? variant.name : this._dp.GameCategory;
    }

    /** Built-in map ID (MapVariants only) */
    get builtInMapId() { return this._dp.BuiltInMapId; }

    /** Source platform ID (raw string from API) */
    get sourcePlatformId() { return this._dp.SourcePlatform; }

    get sourcePlatform() { return getSourcePlatformById(this._dp.SourcePlatform); }

    /** Legacy MCC Asset ID (for migrated content) */
    get legacyMccAssetId() { return this._dp.LegacyMccAssetId; }

    /** Legacy Halo 3 Asset ID path (for migrated content) */
    get legacyAssetId() { return this._dp.LegacyAssetId; }

    get fileName() { return this._dp.FileName; }

    /** Creator ID (newer items) */
    get creatorId() { return this._dp.CreatorId; }

    /**
     * Parent item GUID from `DisplayProperties.ParentPlayFabId`.
     *
     * This field contains a GUID rather than a PlayFab account ID.
     *
     * @returns {string|undefined} GUID of the parent item, when forked
     */
    get parentPlayFabId() { return this._dp.ParentPlayFabId; }

    /** @private Parse and cache the FileAdditionalMetadata JSON */
    get _metadata() {
        if (this._parsedMetadata === null) {
            try {
                const raw = this._dp.FileAdditionalMetadata;
                this._parsedMetadata = raw ? JSON.parse(raw) : {};
            } catch {
                this._parsedMetadata = {};
            }
        }
        return this._parsedMetadata;
    }

    /** Parent user XUID (from secure metadata) */
    get parentUserXuid() {
        const xuid = this._metadata.SecureData?.ParentData?.ParentUserXuid;
        return xuid && xuid !== 0 ? String(xuid) : null;
    }

    /** Parent UGC item PlayFab ID */
    get parentUgcItemId() {
        return this._metadata.SecureData?.ParentData?.ParentUgcItemPlayfabId || null;
    }

    /** Current (forked) user XUID */
    get currentUserXuid() {
        const xuid = this._metadata.SecureData?.CurrentData?.ParentUserXuid;
        return xuid && xuid !== 0 ? String(xuid) : null;
    }

    /** Current UGC item PlayFab ID */
    get currentUgcItemId() {
        return this._metadata.SecureData?.CurrentData?.ParentUgcItemPlayfabId || null;
    }

    /** Certificate thumbprint (for signature verification) */
    get certificateThumbprint() {
        return this._metadata.SecureData?.CertificateThumbprint || null;
    }

    get tags() { return this._raw.Tags || []; }

    /** First tag with the Halo engine prefix, or null. */
    get gameTag() { return this.tags.find(t => t.startsWith('Halo')) || null; }

    /** First tag with the `_map_id_` prefix, or null. */
    get mapIdTag() { return this.tags.find(t => t.startsWith('_map_id_')) || null; }

    /** Game category tag (for GameVariants) */
    get gameCategoryTag() { return this.tags.find(t => t.startsWith('GameCategory_')) || null; }

    /** Device type tag ('Durango' for Xbox One, 'Scarlett' for Series X/S) */
    get deviceTag() { return this.tags.find(t => ['Durango', 'Scarlett', 'PC'].includes(t)) || null; }

    /** Is this legacy UGC (migrated from Xbox 360)? */
    get isLegacyUgc() { return this.tags.includes('LegacyUgc'); }

    get platforms() { return this._raw.Platforms || []; }

    get isXboxPlatform() { return this.platforms.includes('1'); }

    get isPcPlatform() { return this.platforms.includes('2'); }

    /**
     * Get all XUIDs associated with this item
     * @returns {Object} Object with author, editor, parent XUIDs
     */
    get xuids() {
        return {
            author: this.authorXuid,
            editor: this.editorXuid,
            parent: this.parentUserXuid,
            current: this.currentUserXuid,
            creator: this.creatorId
        };
    }

    /**
     * Get unique, unfiltered author XUID strings.
     *
     * Before profile lookup, validate each value and exclude the unattributable-author
     * sentinel `'1'`. Invalid accounts can cause an entire batch lookup to fail.
     *
     * @returns {string[]} Array of unique XUID strings, unfiltered
     */
    get allXuids() {
        const xuids = new Set();
        if (this.authorXuid) xuids.add(this.authorXuid);
        if (this.editorXuid) xuids.add(this.editorXuid);
        if (this.parentUserXuid) xuids.add(this.parentUserXuid);
        if (this.currentUserXuid) xuids.add(this.currentUserXuid);
        if (this.creatorId) xuids.add(this.creatorId);
        return Array.from(xuids);
    }

    /**
     * Get download URL from Contents
     * @returns {string|null} Download URL or null
     */
    get downloadUrl() {
        const dataContent = this._raw.Contents?.find(c => c.Type === 'data');
        if (dataContent?.Url) return dataContent.Url;

        const anyContent = this._raw.Contents?.find(c => c.Url);
        return anyContent?.Url || null;
    }

    get raw() { return this._raw; }

    /**
     * Convert to JSON object for serialization
     * Includes all computed properties and raw data
     */
    toJSON() {
        return {
            id: this.id,
            contentType: this.contentType,
            title: this.title,
            description: this.description,
            fileName: this.fileName,
            fileSize: this.fileSize,
            fileSizeFormatted: this.fileSizeFormatted,
            createdAt: this.createdAt,
            modifiedAt: this.modifiedAt,
            authorXuid: this.authorXuid,
            editorXuid: this.editorXuid,
            creatorEntityId: this.creatorEntityId,
            gameEngine: this.gameEngine,
            gameEngineDisplayName: this.gameEngineDisplayName,
            mapIdTag: this.mapIdTag,
            gameCategoryTag: this.gameCategoryTag,
            tags: this.tags,
            platforms: this.platforms,
            xuids: this.xuids,
            raw: this._raw
        };
    }

    /**
     * Create FileShareItem wrappers from an array of raw items
     * @param {Object[]} items - Array of raw items
     * @returns {FileShareItem[]} Array of wrapped items
     */
    static fromArray(items) {
        return items.map(item => new FileShareItem(item));
    }
}
