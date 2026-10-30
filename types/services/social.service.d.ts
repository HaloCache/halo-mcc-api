/**
 * Social Service
 *
 * The Xbox Live people graph behind MCC's friends and rivals features. A rival
 * is a person with `isFavorite === true`, and that is a flag on each people
 * entry rather than a separate subpath, so getFavorites (aliased as getRivals)
 * filters the list client-side. Needs an XSTS token for xboxlive.com.
 * @module services/social
 */
export type PersonEntry = {
    xuid: string;
    addedDateTimeUtc: string | null;
    /**
     * - true = an MCC "rival".
     */
    isFavorite: boolean;
    isFollowedByCaller: boolean;
    isFollowingCaller: boolean;
    socialNetworks: unknown[];
    raw: Object;
};
/**
 * @typedef {Object} PersonEntry
 * @property {string} xuid
 * @property {string|null} addedDateTimeUtc
 * @property {boolean} isFavorite - true = an MCC "rival".
 * @property {boolean} isFollowedByCaller
 * @property {boolean} isFollowingCaller
 * @property {unknown[]} socialNetworks
 * @property {Object} raw
 */
export declare class SocialService {
    client: import("../client.js").MccClient;
    /** @param {import('../client.js').MccClient} client */
    constructor(client: import('../client.js').MccClient);
    /** @private */
    private _headers;
    /** @private */
    private _selfXuid;
    /** @private Map one upstream person object to {@link PersonEntry}. */
    private static _person;
    /**
     * The people (friends) list for a player.
     *
     * @param {string} [xuid] - Target XUID; defaults to the authed account.
     * @returns {Promise<{ totalCount: number, incomingFriendRequestsCount: number, people: PersonEntry[] }>}
     */
    getPeople(xuid?: string): Promise<{
        totalCount: number;
        incomingFriendRequestsCount: number;
        people: PersonEntry[];
    }>;
    /**
     * The caller's favorites (= MCC rivals), filtered client-side on isFavorite.
     *
     * @param {string} [xuid]
     * @returns {Promise<PersonEntry[]>}
     */
    getFavorites(xuid?: string): Promise<PersonEntry[]>;
    /**
     * Alias for getFavorites: the MCC "rivals" set.
     *
     * @param {string} [xuid]
     * @returns {Promise<PersonEntry[]>}
     */
    getRivals(xuid?: string): Promise<PersonEntry[]>;
    /**
     * The caller's relationship to one target person, if the target is in the
     * caller's people list. Returns null on 404 (not in the list).
     *
     * @param {string} targetXuid
     * @param {string} [viewerXuid] - defaults to the authed account.
     * @returns {Promise<PersonEntry|null>}
     */
    getPerson(targetXuid: string, viewerXuid?: string): Promise<PersonEntry | null>;
    /**
     * Follow/favorite summary for a player (totalCount of followers/following,
     * favorite flags). Shape passed through as the real upstream summary.
     *
     * @param {string} [xuid]
     * @returns {Promise<Object>}
     */
    getSummary(xuid?: string): Promise<Object>;
}
