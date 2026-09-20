/**
 * FileShare item wrappers with property getters and parsed metadata.
 *
 * @module models/fileshare
 */
/**
 * Property accessors for raw PlayFab map and game variants.
 */
export declare class FileShareItem {
    /** @type {Object} Raw API data */
    _raw: Object;
    /** @private @type {Object|null} */
    private _parsedMetadata;
    /**
     * @param {Object} raw - Raw item data from API
     */
    constructor(raw: Object);
    /** Item ID (UUID) */
    get id(): any;
    /** Content type: 'MapVariant' or 'GameVariant' */
    get contentType(): any;
    get isMapVariant(): boolean;
    get isGameVariant(): boolean;
    get title(): any;
    get description(): any;
    /** Creation date as Date object */
    get createdAt(): Date;
    /** Last modified date as Date object */
    get modifiedAt(): Date;
    /**
     * Alias for the item binary download URL.
     */
    get DownloadUrl(): string | null;
    /** Creator's Title Player Account ID */
    get creatorEntityId(): any;
    /** Creator's entity type. */
    get creatorEntityType(): any;
    /** @private */
    private get _dp();
    /**
     * Author's Xbox User ID (original creator).
     *
     * Not guaranteed to be a resolvable account - see {@link allXuids}.
     */
    get authorXuid(): any;
    /**
     * Last editor's Xbox User ID, independent of author attribution.
     */
    get editorXuid(): any;
    /** Author timestamp as Date */
    get authorTime(): Date | null;
    /** Editor timestamp as Date */
    get editorTime(): Date | null;
    /** File size in bytes */
    get fileSize(): number;
    /** File size formatted (KB/MB) */
    get fileSizeFormatted(): string;
    /** Game engine ID (raw string from API) */
    get gameEngineId(): any;
    /** GameEngine enum key. */
    get gameEngine(): import("@halocache/halo-mcc-data").GameEngine | null;
    /** Engine display name. */
    get gameEngineDisplayName(): string;
    /** Game category ID (GameVariants only, raw string from API) */
    get gameCategoryId(): any;
    /** Game category name (GameVariants only) */
    get gameCategory(): any;
    /** Built-in map ID (MapVariants only) */
    get builtInMapId(): any;
    /** Source platform ID (raw string from API) */
    get sourcePlatformId(): any;
    get sourcePlatform(): string | null;
    /** Legacy MCC Asset ID (for migrated content) */
    get legacyMccAssetId(): any;
    /** Legacy Halo 3 Asset ID path (for migrated content) */
    get legacyAssetId(): any;
    get fileName(): any;
    /** Creator ID (newer items) */
    get creatorId(): any;
    /**
     * Parent item GUID from `DisplayProperties.ParentPlayFabId`.
     *
     * This field contains a GUID rather than a PlayFab account ID.
     *
     * @returns {string|undefined} GUID of the parent item, when forked
     */
    get parentPlayFabId(): string | undefined;
    /** @private Parse and cache the FileAdditionalMetadata JSON */
    private get _metadata();
    /** Parent user XUID (from secure metadata) */
    get parentUserXuid(): string | null;
    /** Parent UGC item PlayFab ID */
    get parentUgcItemId(): any;
    /** Current (forked) user XUID */
    get currentUserXuid(): string | null;
    /** Current UGC item PlayFab ID */
    get currentUgcItemId(): any;
    /** Certificate thumbprint (for signature verification) */
    get certificateThumbprint(): any;
    get tags(): any;
    /** First tag with the Halo engine prefix, or null. */
    get gameTag(): any;
    /** First tag with the `_map_id_` prefix, or null. */
    get mapIdTag(): any;
    /** Game category tag (for GameVariants) */
    get gameCategoryTag(): any;
    /** Device type tag ('Durango' for Xbox One, 'Scarlett' for Series X/S) */
    get deviceTag(): any;
    /** Is this legacy UGC (migrated from Xbox 360)? */
    get isLegacyUgc(): any;
    get platforms(): any;
    get isXboxPlatform(): any;
    get isPcPlatform(): any;
    /**
     * Get all XUIDs associated with this item
     * @returns {Object} Object with author, editor, parent XUIDs
     */
    get xuids(): Object;
    /**
     * Get unique, unfiltered author XUID strings.
     *
     * Before profile lookup, validate each value and exclude the unattributable-author
     * sentinel `'1'`. Invalid accounts can cause an entire batch lookup to fail.
     *
     * @returns {string[]} Array of unique XUID strings, unfiltered
     */
    get allXuids(): string[];
    /**
     * Get download URL from Contents
     * @returns {string|null} Download URL or null
     */
    get downloadUrl(): string | null;
    get raw(): Object;
    /**
     * Convert to JSON object for serialization
     * Includes all computed properties and raw data
     */
    toJSON(): {
        id: any;
        contentType: any;
        title: any;
        description: any;
        fileName: any;
        fileSize: number;
        fileSizeFormatted: string;
        createdAt: Date;
        modifiedAt: Date;
        authorXuid: any;
        editorXuid: any;
        creatorEntityId: any;
        gameEngine: import("@halocache/halo-mcc-data").GameEngine | null;
        gameEngineDisplayName: string;
        mapIdTag: any;
        gameCategoryTag: any;
        tags: any;
        platforms: any;
        xuids: Object;
        raw: Object;
    };
    /**
     * Create FileShareItem wrappers from an array of raw items
     * @param {Object[]} items - Array of raw items
     * @returns {FileShareItem[]} Array of wrapped items
     */
    static fromArray(items: Object[]): FileShareItem[];
}
