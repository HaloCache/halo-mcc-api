/**
 * Player profile and statistics wrappers.
 *
 * @module models/player
 */
export declare class ServiceRecord {
    _stats: Map<any, any>;
    _raw: Object[];
    /**
     * @param {Object[]} statistics - Array of PlayFab statistics objects
     */
    constructor(statistics?: Object[]);
    /**
     * @param {string} name - Statistic name
     * @returns {number} Value or 0 if not found
     */
    getStat(name: string): number;
    /** Total experience points. */
    get xp(): number;
    /** Current Rank (1-50) if available */
    get rank(): number;
    get gamesPlayed(): number;
    get kills(): number;
    get deaths(): number;
    get assists(): number;
    /**
     * Kill/death ratio, or the kill count when deaths are zero.
     *
     * @returns {number}
     */
    get kdRatio(): number;
    /** Kill/death ratio formatted to two decimal places. @returns {string} */
    get kdRatioFormatted(): string;
    get gamesWon(): number;
    /**
     * Win percentage, or zero when no games have been played.
     *
     * @returns {number}
     */
    get winRate(): number;
    /** Win percentage formatted to one decimal place. @returns {string} */
    get winRateFormatted(): string;
}
export declare class PlayerProfile {
    _raw: Object;
    /**
     * @param {Object} raw - Raw PlayFab GetPlayerProfile response
     */
    constructor(raw: Object);
    get playFabId(): any;
    get displayName(): any;
    get created(): Date;
    get lastLogin(): Date;
    /** @returns {ServiceRecord} Service Record from profile statistics */
    get serviceRecord(): ServiceRecord;
    /** @returns {Object} Linked accounts (Xbox, Steam, etc.) */
    get linkedAccounts(): Object;
    get xboxUserId(): any;
}
