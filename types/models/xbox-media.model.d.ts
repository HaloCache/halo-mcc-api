/**
 * Xbox Game DVR screenshot and clip wrappers with URLs, dates, and metadata.
 *
 * @module models/xbox-media
 */
/**
 * @type {number}
 */
export declare const MCC_TITLE_ID: number;
/**
 * Base class for Xbox Media items (Screenshots and Game Clips)
 */
declare class XboxMediaItemBase {
    /** @type {Object} Raw API data */
    _raw: Object;
    /**
     * @param {Object} raw - Raw API data
     */
    constructor(raw: Object);
    /** Xbox User ID of owner */
    get xuid(): any;
    /** State code (6 = published) */
    get state(): any;
    get isPublished(): boolean;
    get publishedAt(): Date;
    get modifiedAt(): Date;
    get caption(): any;
    get type(): any;
    /** Service Configuration ID */
    get scid(): any;
    /** Xbox Title ID (numeric) */
    get titleId(): any;
    get isMcc(): boolean;
    get titleName(): any;
    /** User rating (0-5) */
    get rating(): any;
    get ratingCount(): any;
    get views(): any;
    get titleData(): any;
    get systemProperties(): any;
    get savedByUser(): any;
    /** Associated achievement ID (if auto-captured) */
    get achievementId(): any;
    get greatestMomentId(): any;
    /** Locale code (e.g., 'en-GB') */
    get locale(): any;
    get contentAttributes(): any;
    /** Device type (e.g., 'Durango' for Xbox One) */
    get deviceType(): any;
    get isXboxOne(): boolean;
    get isXboxSeriesXS(): boolean;
    get thumbnails(): any;
    get thumbnailSmall(): any;
    get thumbnailLarge(): any;
    /** Best available thumbnail URL */
    get thumbnail(): any;
    toJSON(): {
        xuid: any;
        state: any;
        publishedAt: Date;
        modifiedAt: Date;
        caption: any;
        type: any;
        titleId: any;
        titleName: any;
        isMcc: boolean;
        deviceType: any;
        thumbnail: any;
        raw: Object;
    };
    get raw(): Object;
}
export declare class XboxScreenshot extends XboxMediaItemBase {
    /**
     * @param {Object} raw - Raw screenshot data from API
     */
    constructor(raw: Object);
    /** Screenshot ID (UUID) */
    get id(): any;
    get name(): any;
    get takenAt(): Date;
    /** Image width in pixels */
    get width(): any;
    /** Image height in pixels */
    get height(): any;
    /** Resolution formatted as width x height. */
    get resolution(): string;
    get is1080p(): boolean;
    get is4k(): boolean;
    get uris(): any;
    /** Expiring signed screenshot URL from a type-2 URI entry. */
    get url(): any;
    /** File size in bytes */
    get fileSize(): any;
    get fileSizeFormatted(): string;
    /** URL expiration date */
    get urlExpires(): Date | null;
    get isUrlValid(): boolean;
    toJSON(): {
        xuid: any;
        state: any;
        publishedAt: Date;
        modifiedAt: Date;
        caption: any;
        type: any;
        titleId: any;
        titleName: any;
        isMcc: boolean;
        deviceType: any;
        thumbnail: any;
        raw: Object;
        id: any;
        name: any;
        takenAt: Date;
        width: any;
        height: any;
        resolution: string;
        is4k: boolean;
        url: any;
        urlExpires: Date | null;
        fileSize: any;
        fileSizeFormatted: string;
    };
    /**
     * Create XboxScreenshot wrappers from an array of raw screenshots
     * @param {Object[]} screenshots - Array of raw screenshots
     * @returns {XboxScreenshot[]} Array of wrapped screenshots
     */
    static fromArray(screenshots: Object[]): XboxScreenshot[];
}
export declare class XboxGameClip extends XboxMediaItemBase {
    /**
     * @param {Object} raw - Raw game clip data from API
     */
    constructor(raw: Object);
    /** Game clip ID (UUID) */
    get id(): any;
    get name(): any;
    get recordedAt(): Date;
    /** Duration in seconds */
    get durationSeconds(): any;
    /** Duration formatted as m:ss, or h:mm:ss for clips of at least one hour. */
    get durationFormatted(): string;
    get commentCount(): any;
    get likeCount(): any;
    get shareCount(): any;
    get partialViews(): any;
    get uris(): any;
    /** Expiring signed video URL from a type-2 URI entry. */
    get url(): any;
    /** File size in bytes */
    get fileSize(): any;
    get fileSizeFormatted(): string;
    /** URL expiration date */
    get urlExpires(): Date | null;
    get isUrlValid(): boolean;
    toJSON(): {
        xuid: any;
        state: any;
        publishedAt: Date;
        modifiedAt: Date;
        caption: any;
        type: any;
        titleId: any;
        titleName: any;
        isMcc: boolean;
        deviceType: any;
        thumbnail: any;
        raw: Object;
        id: any;
        name: any;
        recordedAt: Date;
        durationSeconds: any;
        durationFormatted: string;
        views: any;
        likeCount: any;
        url: any;
        urlExpires: Date | null;
        fileSize: any;
        fileSizeFormatted: string;
    };
    /**
     * Create XboxGameClip wrappers from an array of raw clips
     * @param {Object[]} clips - Array of raw clips
     * @returns {XboxGameClip[]} Array of wrapped clips
     */
    static fromArray(clips: Object[]): XboxGameClip[];
}
export {};
