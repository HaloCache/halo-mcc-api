/**
 * Xbox Game DVR screenshot and clip wrappers with URLs, dates, and metadata.
 *
 * @module models/xbox-media
 */

import { formatBytes } from '../utils/format-bytes.js';

/**
 * @type {number}
 */
export const MCC_TITLE_ID = 1144039928;

/**
 * Base class for Xbox Media items (Screenshots and Game Clips)
 */
class XboxMediaItemBase {
    /**
     * @param {Object} raw - Raw API data
     */
    constructor(raw) {
        /** @type {Object} Raw API data */
        this._raw = raw;
    }

    /** Xbox User ID of owner */
    get xuid() { return this._raw.xuid; }

    /** State code (6 = published) */
    get state() { return this._raw.state; }

    get isPublished() { return this._raw.state === 6; }

    get publishedAt() { return new Date(this._raw.datePublished); }

    get modifiedAt() { return new Date(this._raw.lastModified); }

    get caption() { return this._raw.userCaption || ''; }

    get type() { return this._raw.type; }

    /** Service Configuration ID */
    get scid() { return this._raw.scid; }

    /** Xbox Title ID (numeric) */
    get titleId() { return this._raw.titleId; }

    get isMcc() { return this._raw.titleId === MCC_TITLE_ID; }

    get titleName() { return this._raw.titleName || ''; }

    /** User rating (0-5) */
    get rating() { return this._raw.rating || 0; }

    get ratingCount() { return this._raw.ratingCount || 0; }

    get views() { return this._raw.views || 0; }

    get titleData() { return this._raw.titleData || ''; }

    get systemProperties() { return this._raw.systemProperties || ''; }

    get savedByUser() { return this._raw.savedByUser || false; }

    /** Associated achievement ID (if auto-captured) */
    get achievementId() { return this._raw.achievementId || null; }

    get greatestMomentId() { return this._raw.greatestMomentId || null; }

    /** Locale code (e.g., 'en-GB') */
    get locale() { return this._raw.screenshotLocale || this._raw.gameClipLocale || ''; }

    get contentAttributes() { return this._raw.screenshotContentAttributes ?? this._raw.clipContentAttributes ?? 0; }

    /** Device type (e.g., 'Durango' for Xbox One) */
    get deviceType() { return this._raw.deviceType || ''; }

    get isXboxOne() { return this._raw.deviceType === 'Durango'; }

    get isXboxSeriesXS() { return this._raw.deviceType === 'Scarlett'; }

    get thumbnails() { return this._raw.thumbnails || []; }

    get thumbnailSmall() {
        const thumb = this.thumbnails.find(t => t.thumbnailType === 1);
        return thumb?.uri || null;
    }

    get thumbnailLarge() {
        const thumb = this.thumbnails.find(t => t.thumbnailType === 2);
        return thumb?.uri || null;
    }

    /** Best available thumbnail URL */
    get thumbnail() {
        return this.thumbnailLarge || this.thumbnailSmall || null;
    }

    toJSON() {
        return {
            xuid: this.xuid,
            state: this.state,
            publishedAt: this.publishedAt,
            modifiedAt: this.modifiedAt,
            caption: this.caption,
            type: this.type,
            titleId: this.titleId,
            titleName: this.titleName,
            isMcc: this.isMcc,
            deviceType: this.deviceType,
            thumbnail: this.thumbnail,
            raw: this._raw
        };
    }

    get raw() { return this._raw; }
}

export class XboxScreenshot extends XboxMediaItemBase {
    /**
     * @param {Object} raw - Raw screenshot data from API
     */
    constructor(raw) {
        super(raw);
    }

    /** Screenshot ID (UUID) */
    get id() { return this._raw.screenshotId; }

    get name() { return this._raw.screenshotName || ''; }

    get takenAt() { return new Date(this._raw.dateTaken); }

    /** Image width in pixels */
    get width() { return this._raw.resolutionWidth || 0; }

    /** Image height in pixels */
    get height() { return this._raw.resolutionHeight || 0; }

    /** Resolution formatted as width x height. */
    get resolution() { return `${this.width}x${this.height}`; }

    get is1080p() { return this.width === 1920 && this.height === 1080; }

    get is4k() { return this.width >= 3840 && this.height >= 2160; }

    get uris() { return this._raw.screenshotUris || []; }

    /** Expiring signed screenshot URL from a type-2 URI entry. */
    get url() {
        const uri = this.uris.find(u => u.uriType === 2);
        return uri?.uri || null;
    }

    /** File size in bytes */
    get fileSize() {
        const uri = this.uris[0];
        return uri?.fileSize || 0;
    }

    get fileSizeFormatted() {
        return formatBytes(this.fileSize);
    }

    /** URL expiration date */
    get urlExpires() {
        const uri = this.uris[0];
        return uri?.expiration ? new Date(uri.expiration) : null;
    }

    get isUrlValid() {
        const expires = this.urlExpires;
        return expires ? expires > new Date() : false;
    }

    toJSON() {
        const base = super.toJSON();
        return {
            ...base,
            id: this.id,
            name: this.name,
            takenAt: this.takenAt,
            width: this.width,
            height: this.height,
            resolution: this.resolution,
            is4k: this.is4k,
            url: this.url,
            urlExpires: this.urlExpires,
            fileSize: this.fileSize,
            fileSizeFormatted: this.fileSizeFormatted
        };
    }

    /**
     * Create XboxScreenshot wrappers from an array of raw screenshots
     * @param {Object[]} screenshots - Array of raw screenshots
     * @returns {XboxScreenshot[]} Array of wrapped screenshots
     */
    static fromArray(screenshots) {
        return screenshots.map(ss => new XboxScreenshot(ss));
    }
}

export class XboxGameClip extends XboxMediaItemBase {
    /**
     * @param {Object} raw - Raw game clip data from API
     */
    constructor(raw) {
        super(raw);
    }

    /** Game clip ID (UUID) */
    get id() { return this._raw.gameClipId; }

    get name() { return this._raw.clipName || ''; }

    get recordedAt() { return new Date(this._raw.dateRecorded); }

    /** Duration in seconds */
    get durationSeconds() { return this._raw.durationInSeconds || 0; }

    /** Duration formatted as m:ss, or h:mm:ss for clips of at least one hour. */
    get durationFormatted() {
        const secs = Math.max(0, Math.floor(this.durationSeconds));
        const hours = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        const remainingSecs = secs % 60;
        const pad = (n) => String(n).padStart(2, '0');

        return hours > 0
            ? `${hours}:${pad(mins)}:${pad(remainingSecs)}`
            : `${mins}:${pad(remainingSecs)}`;
    }

    get commentCount() { return this._raw.commentCount || 0; }

    get likeCount() { return this._raw.likeCount || 0; }

    get shareCount() { return this._raw.shareCount || 0; }

    get partialViews() { return this._raw.partialViews || 0; }

    get uris() { return this._raw.gameClipUris || []; }

    /** Expiring signed video URL from a type-2 URI entry. */
    get url() {
        const uri = this.uris.find(u => u.uriType === 2);
        return uri?.uri || null;
    }

    /** File size in bytes */
    get fileSize() {
        const uri = this.uris[0];
        return uri?.fileSize || 0;
    }

    get fileSizeFormatted() {
        return formatBytes(this.fileSize);
    }

    /** URL expiration date */
    get urlExpires() {
        const uri = this.uris[0];
        return uri?.expiration ? new Date(uri.expiration) : null;
    }

    get isUrlValid() {
        const expires = this.urlExpires;
        return expires ? expires > new Date() : false;
    }

    toJSON() {
        const base = super.toJSON();
        return {
            ...base,
            id: this.id,
            name: this.name,
            recordedAt: this.recordedAt,
            durationSeconds: this.durationSeconds,
            durationFormatted: this.durationFormatted,
            views: this.views,
            likeCount: this.likeCount,
            url: this.url,
            urlExpires: this.urlExpires,
            fileSize: this.fileSize,
            fileSizeFormatted: this.fileSizeFormatted
        };
    }

    /**
     * Create XboxGameClip wrappers from an array of raw clips
     * @param {Object[]} clips - Array of raw clips
     * @returns {XboxGameClip[]} Array of wrapped clips
     */
    static fromArray(clips) {
        return clips.map(clip => new XboxGameClip(clip));
    }
}
