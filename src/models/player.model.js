/**
 * Player profile and statistics wrappers.
 *
 * @module models/player
 */

export class ServiceRecord {
    /**
     * @param {Object[]} statistics - Array of PlayFab statistics objects
     */
    constructor(statistics = []) {
        this._stats = new Map();

        if (Array.isArray(statistics)) {
            statistics.forEach(s => this._stats.set(s.StatisticName, s.Value));
        } else if (statistics && typeof statistics === 'object') {
            Object.entries(statistics).forEach(([key, val]) => {
                const value = (val && typeof val === 'object' && 'Value' in val) ? val.Value : val;
                this._stats.set(key, value);
            });
        }
        this._raw = statistics;
    }

    /**
     * @param {string} name - Statistic name
     * @returns {number} Value or 0 if not found
     */
    getStat(name) {
        return this._stats.get(name) || 0;
    }

    /** Total experience points. */
    get xp() { return this.getStat('mcc_xp') || this.getStat('HaloStatsPlayerXP') || this.getStat('xp'); }

    /** Current Rank (1-50) if available */
    get rank() { return this.getStat('mcc_rank'); }

    get gamesPlayed() { return this.getStat('mcc_total_games') || this.getStat('TotalRatedGamesPlayed'); }

    get kills() { return this.getStat('mcc_total_kills'); }

    get deaths() { return this.getStat('mcc_total_deaths'); }

    get assists() { return this.getStat('mcc_total_assists'); }

    /**
     * Kill/death ratio, or the kill count when deaths are zero.
     *
     * @returns {number}
     */
    get kdRatio() {
        const deaths = this.deaths;
        return deaths > 0 ? this.kills / deaths : this.kills;
    }

    /** Kill/death ratio formatted to two decimal places. @returns {string} */
    get kdRatioFormatted() { return this.kdRatio.toFixed(2); }

    get gamesWon() { return this.getStat('mcc_total_wins'); }

    /**
     * Win percentage, or zero when no games have been played.
     *
     * @returns {number}
     */
    get winRate() {
        const played = this.gamesPlayed;
        return played > 0 ? (this.gamesWon / played) * 100 : 0;
    }

    /** Win percentage formatted to one decimal place. @returns {string} */
    get winRateFormatted() { return `${this.winRate.toFixed(1)}%`; }
}

export class PlayerProfile {
    /**
     * @param {Object} raw - Raw PlayFab GetPlayerProfile response
     */
    constructor(raw) {
        this._raw = raw;
    }

    get playFabId() { return this._raw.PlayerId; }
    get displayName() { return this._raw.DisplayName; }
    get created() { return new Date(this._raw.Created); }
    get lastLogin() { return new Date(this._raw.LastLogin); }

    /** @returns {ServiceRecord} Service Record from profile statistics */
    get serviceRecord() {
        return new ServiceRecord(this._raw.Statistics || []);
    }

    /** @returns {Object} Linked accounts (Xbox, Steam, etc.) */
    get linkedAccounts() { return this._raw.LinkedAccounts || []; }

    get xboxUserId() {
        const xbox = this.linkedAccounts.find(a => a.Platform === 'XboxLive');
        return xbox ? xbox.PlatformUserId : null;
    }
}
