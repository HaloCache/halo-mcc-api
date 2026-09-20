/**
 * Xbox Media Types (Game DVR)
 *
 * Type definitions for Xbox Screenshots and Game Clips API.
 * @module types/xbox-media
 */
export type ScreenshotThumbnail = {
    /**
     * - Public URL to thumbnail image
     */
    uri: string;
    /**
     * - File size (often 0 for thumbnails)
     */
    fileSize: number;
    /**
     * - Thumbnail type (1=small, 2=large)
     */
    thumbnailType: number;
};
export type ScreenshotUri = {
    /**
     * - Signed URL to full screenshot (expires)
     */
    uri: string;
    /**
     * - File size in bytes
     */
    fileSize: number;
    /**
     * - URI type (2=private with SAS token)
     */
    uriType: number;
    /**
     * - ISO date when URL expires
     */
    expiration: string;
};
export type Screenshot = {
    /**
     * - Unique screenshot ID (UUID)
     */
    screenshotId: string;
    /**
     * - Image height in pixels
     */
    resolutionHeight: number;
    /**
     * - Image width in pixels
     */
    resolutionWidth: number;
    /**
     * - Screenshot state (6=published)
     */
    state: number;
    /**
     * - ISO date when published
     */
    datePublished: string;
    /**
     * - ISO date when captured
     */
    dateTaken: string;
    /**
     * - ISO date of last modification
     */
    lastModified: string;
    /**
     * - User-provided caption
     */
    userCaption: string;
    /**
     * - Screenshot type
     */
    type: number;
    /**
     * - Service Configuration ID
     */
    scid: string;
    /**
     * - Xbox Title ID of the game
     */
    titleId: number;
    /**
     * - User rating (0-5)
     */
    rating: number;
    /**
     * - Number of ratings
     */
    ratingCount: number;
    /**
     * - View count
     */
    views: number;
    /**
     * - Title-specific metadata
     */
    titleData: string;
    /**
     * - System-assigned properties
     */
    systemProperties: string;
    /**
     * - Whether user explicitly saved it
     */
    savedByUser: boolean;
    /**
     * - Associated achievement ID
     */
    achievementId: string;
    /**
     * - Greatest moment ID
     */
    greatestMomentId: string | null;
    /**
     * - Array of thumbnail URLs
     */
    thumbnails: ScreenshotThumbnail[];
    /**
     * - Array of full image URLs
     */
    screenshotUris: ScreenshotUri[];
    /**
     * - Xbox User ID of owner
     */
    xuid: string;
    /**
     * - Screenshot name
     */
    screenshotName: string;
    /**
     * - Game title name
     */
    titleName: string;
    /**
     * - Locale code (e.g., 'en-GB')
     */
    screenshotLocale: string;
    /**
     * - Content attributes
     */
    screenshotContentAttributes: number;
    /**
     * - Device type (e.g., 'Durango' for Xbox One)
     */
    deviceType: string;
};
export type GameClipThumbnail = {
    /**
     * - Public URL to thumbnail image
     */
    uri: string;
    /**
     * - File size (often 0 for thumbnails)
     */
    fileSize: number;
    /**
     * - Thumbnail type (1=small, 2=large)
     */
    thumbnailType: number;
};
export type GameClipUri = {
    /**
     * - Signed URL to video file (expires)
     */
    uri: string;
    /**
     * - File size in bytes
     */
    fileSize: number;
    /**
     * - URI type (2=private with SAS token)
     */
    uriType: number;
    /**
     * - ISO date when URL expires
     */
    expiration: string;
};
export type GameClip = {
    /**
     * - Unique game clip ID (UUID)
     */
    gameClipId: string;
    /**
     * - Clip state (6=published)
     */
    state: number;
    /**
     * - ISO date when published
     */
    datePublished: string;
    /**
     * - ISO date when recorded
     */
    dateRecorded: string;
    /**
     * - ISO date of last modification
     */
    lastModified: string;
    /**
     * - User-provided caption
     */
    userCaption: string;
    /**
     * - Clip type
     */
    type: number;
    /**
     * - Video duration in seconds
     */
    durationInSeconds: number;
    /**
     * - Service Configuration ID
     */
    scid: string;
    /**
     * - Xbox Title ID of the game
     */
    titleId: number;
    /**
     * - User rating (0-5)
     */
    rating: number;
    /**
     * - Number of ratings
     */
    ratingCount: number;
    /**
     * - View count
     */
    views: number;
    /**
     * - Title-specific metadata
     */
    titleData: string;
    /**
     * - System-assigned properties
     */
    systemProperties: string;
    /**
     * - Whether user explicitly saved it
     */
    savedByUser: boolean;
    /**
     * - Associated achievement ID
     */
    achievementId: string;
    /**
     * - Greatest moment ID
     */
    greatestMomentId: string;
    /**
     * - Array of thumbnail URLs
     */
    thumbnails: GameClipThumbnail[];
    /**
     * - Array of video URLs
     */
    gameClipUris: GameClipUri[];
    /**
     * - Xbox User ID of owner
     */
    xuid: string;
    /**
     * - Clip name
     */
    clipName: string;
    /**
     * - Game title name
     */
    titleName: string;
    /**
     * - Locale code (e.g., 'en-GB')
     */
    gameClipLocale: string;
    /**
     * - Content attributes
     */
    clipContentAttributes: number;
    /**
     * - Device type (e.g., 'Durango' for Xbox One)
     */
    deviceType: string;
    /**
     * - Number of comments
     */
    commentCount: number;
    /**
     * - Number of likes
     */
    likeCount: number;
    /**
     * - Number of shares
     */
    shareCount: number;
    /**
     * - Number of partial views
     */
    partialViews: number;
};
export type ScreenshotsResponse = {
    /**
     * - Array of screenshots
     */
    screenshots: Screenshot[];
    /**
     * - Pagination info
     */
    pagingInfo: {
        continuationToken: string;
    };
};
export type GameClipsResponse = {
    /**
     * - Array of game clips
     */
    gameClips: GameClip[];
    /**
     * - Pagination info
     */
    pagingInfo: {
        continuationToken: string;
    };
};
/**
 * Screenshot thumbnail
 * @typedef {Object} ScreenshotThumbnail
 * @property {string} uri - Public URL to thumbnail image
 * @property {number} fileSize - File size (often 0 for thumbnails)
 * @property {number} thumbnailType - Thumbnail type (1=small, 2=large)
 */
/**
 * Screenshot URI with download info
 * @typedef {Object} ScreenshotUri
 * @property {string} uri - Signed URL to full screenshot (expires)
 * @property {number} fileSize - File size in bytes
 * @property {number} uriType - URI type (2=private with SAS token)
 * @property {string} expiration - ISO date when URL expires
 */
/**
 * Xbox Screenshot
 * @typedef {Object} Screenshot
 * @property {string} screenshotId - Unique screenshot ID (UUID)
 * @property {number} resolutionHeight - Image height in pixels
 * @property {number} resolutionWidth - Image width in pixels
 * @property {number} state - Screenshot state (6=published)
 * @property {string} datePublished - ISO date when published
 * @property {string} dateTaken - ISO date when captured
 * @property {string} lastModified - ISO date of last modification
 * @property {string} userCaption - User-provided caption
 * @property {number} type - Screenshot type
 * @property {string} scid - Service Configuration ID
 * @property {number} titleId - Xbox Title ID of the game
 * @property {number} rating - User rating (0-5)
 * @property {number} ratingCount - Number of ratings
 * @property {number} views - View count
 * @property {string} titleData - Title-specific metadata
 * @property {string} systemProperties - System-assigned properties
 * @property {boolean} savedByUser - Whether user explicitly saved it
 * @property {string} achievementId - Associated achievement ID
 * @property {string|null} greatestMomentId - Greatest moment ID
 * @property {ScreenshotThumbnail[]} thumbnails - Array of thumbnail URLs
 * @property {ScreenshotUri[]} screenshotUris - Array of full image URLs
 * @property {string} xuid - Xbox User ID of owner
 * @property {string} screenshotName - Screenshot name
 * @property {string} titleName - Game title name
 * @property {string} screenshotLocale - Locale code (e.g., 'en-GB')
 * @property {number} screenshotContentAttributes - Content attributes
 * @property {string} deviceType - Device type (e.g., 'Durango' for Xbox One)
 */
/**
 * Game clip thumbnail
 * @typedef {Object} GameClipThumbnail
 * @property {string} uri - Public URL to thumbnail image
 * @property {number} fileSize - File size (often 0 for thumbnails)
 * @property {number} thumbnailType - Thumbnail type (1=small, 2=large)
 */
/**
 * Game clip URI with download info
 * @typedef {Object} GameClipUri
 * @property {string} uri - Signed URL to video file (expires)
 * @property {number} fileSize - File size in bytes
 * @property {number} uriType - URI type (2=private with SAS token)
 * @property {string} expiration - ISO date when URL expires
 */
/**
 * Xbox Game Clip
 * @typedef {Object} GameClip
 * @property {string} gameClipId - Unique game clip ID (UUID)
 * @property {number} state - Clip state (6=published)
 * @property {string} datePublished - ISO date when published
 * @property {string} dateRecorded - ISO date when recorded
 * @property {string} lastModified - ISO date of last modification
 * @property {string} userCaption - User-provided caption
 * @property {number} type - Clip type
 * @property {number} durationInSeconds - Video duration in seconds
 * @property {string} scid - Service Configuration ID
 * @property {number} titleId - Xbox Title ID of the game
 * @property {number} rating - User rating (0-5)
 * @property {number} ratingCount - Number of ratings
 * @property {number} views - View count
 * @property {string} titleData - Title-specific metadata
 * @property {string} systemProperties - System-assigned properties
 * @property {boolean} savedByUser - Whether user explicitly saved it
 * @property {string} achievementId - Associated achievement ID
 * @property {string} greatestMomentId - Greatest moment ID
 * @property {GameClipThumbnail[]} thumbnails - Array of thumbnail URLs
 * @property {GameClipUri[]} gameClipUris - Array of video URLs
 * @property {string} xuid - Xbox User ID of owner
 * @property {string} clipName - Clip name
 * @property {string} titleName - Game title name
 * @property {string} gameClipLocale - Locale code (e.g., 'en-GB')
 * @property {number} clipContentAttributes - Content attributes
 * @property {string} deviceType - Device type (e.g., 'Durango' for Xbox One)
 * @property {number} commentCount - Number of comments
 * @property {number} likeCount - Number of likes
 * @property {number} shareCount - Number of shares
 * @property {number} partialViews - Number of partial views
 */
/**
 * Screenshots response
 * @typedef {Object} ScreenshotsResponse
 * @property {Screenshot[]} screenshots - Array of screenshots
 * @property {Object} pagingInfo - Pagination info
 * @property {string} pagingInfo.continuationToken - Token for next page
 */
/**
 * Game clips response
 * @typedef {Object} GameClipsResponse
 * @property {GameClip[]} gameClips - Array of game clips
 * @property {Object} pagingInfo - Pagination info
 * @property {string} pagingInfo.continuationToken - Token for next page
 */
export {};
