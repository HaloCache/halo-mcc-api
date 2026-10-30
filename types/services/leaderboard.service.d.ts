/**
 * Leaderboard Service
 *
 * Xbox Live leaderboards as MCC uses them, with continuation-token pagination
 * that walks a whole board without holding it in memory. A board name is either
 * composed from a spec by buildLeaderboardName or passed through verbatim.
 * @module services/leaderboard
 */
/** Default retry/backoff policy; overridable per call. */
export declare const DEFAULT_RETRY: Readonly<{
    maxRetries: 5;
    baseDelayMs: 500;
    maxDelayMs: 20000;
    retryOnStatus: readonly number[];
}>;
export type LeaderboardRetryPolicy = {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    /**
     * - Status codes worth another attempt.
     */
    retryOnStatus: readonly number[];
};
export type LeaderboardRow = {
    rank: number | null;
    xuid: string | null;
    gamertag: string | null;
    percentile: number | null;
    /**
     * - Stat column values, in column order.
     */
    values: (number | string)[];
    /**
     * - The untouched upstream row.
     */
    raw: Object;
};
export type LeaderboardPage = {
    rows: LeaderboardRow[];
    continuationToken: string | null;
    totalCount: number | null;
    /**
     * - The untouched upstream body.
     */
    raw: Object;
};
/**
 * @typedef {Object} LeaderboardRetryPolicy
 * @property {number} maxRetries
 * @property {number} baseDelayMs
 * @property {number} maxDelayMs
 * @property {readonly number[]} retryOnStatus - Status codes worth another attempt.
 */
/**
 * @typedef {Object} LeaderboardRow
 * @property {number|null} rank
 * @property {string|null} xuid
 * @property {string|null} gamertag
 * @property {number|null} percentile
 * @property {(number|string)[]} values - Stat column values, in column order.
 * @property {Object} raw - The untouched upstream row.
 */
/**
 * @typedef {Object} LeaderboardPage
 * @property {LeaderboardRow[]} rows
 * @property {string|null} continuationToken
 * @property {number|null} totalCount
 * @property {Object} raw - The untouched upstream body.
 */
export declare class LeaderboardService {
    client: import("../client.js").MccClient;
    scid: string;
    /** @type {LeaderboardRetryPolicy} */
    retry: LeaderboardRetryPolicy;
    /**
     * @param {import('../client.js').MccClient} client
     * @param {Object} [options]
     * @param {string} [options.scid] - Service config id. Defaults to MCC_SCID.
     * @param {Partial<LeaderboardRetryPolicy>} [options.retry] - Overrides for DEFAULT_RETRY.
     */
    constructor(client: import('../client.js').MccClient, options?: {
        scid?: string;
        retry?: Partial<LeaderboardRetryPolicy>;
    });
    /** @private */
    private _headers;
    /**
     * Build the full request URL for a query.
     *
     * @param {Object} q
     * @param {string} q.name - Board or stat name; required unless { board } is given.
     * @param {number} [q.maxItems=100]
     * @param {number} [q.skipToRank]
     * @param {string} [q.skipToUser]
     * @param {string} [q.continuationToken]
     * @param {'people'} [q.view] - Set to 'people' for the social view.
     * @param {'all'|'favorite'} [q.viewTarget] - Required when view==='people' (favorite = MCC rivals).
     * @param {string} [q.xuid] - Required when view==='people'.
     * @returns {string}
     */
    buildUrl(q: {
        name: string;
        maxItems?: number;
        skipToRank?: number;
        skipToUser?: string;
        continuationToken?: string;
        view?: 'people';
        viewTarget?: 'all' | 'favorite';
        xuid?: string;
    }): string;
    /**
     * Normalize either leaderboard contract shape into a {@link LeaderboardPage}:
     * the v3 `userList` form and the v4 `value.collection` form.
     *
     * @param {Object} body
     * @returns {LeaderboardPage}
     */
    static normalizePage(body: Object): LeaderboardPage;
    /**
     * Fetch a single page, with retry/backoff on throttle + transient errors.
     *
     * @param {Object} query - see buildUrl(); plus { contractVersion=3 }.
     * @returns {Promise<LeaderboardPage>}
     */
    getPage(query: Object): Promise<LeaderboardPage>;
    /**
     * Async generator over pages: yields one page at a time and follows the
     * continuation token until the board is exhausted.
     *
     * @param {Object} query - see getPage(). `maxItems` is the page size.
     * @param {Object} [opts]
     * @param {number} [opts.maxPages=Infinity] - Stop after this many pages.
     * @returns {AsyncGenerator<LeaderboardPage>}
     */
    pages(query: Object, opts?: {
        maxPages?: number;
    }): AsyncGenerator<LeaderboardPage>;
    /**
     * Async generator over individual rows across all pages. Never holds more
     * than one page in memory.
     *
     * @param {Object} query - see pages().
     * @param {Object} [opts]
     * @param {number} [opts.maxRows=Infinity]
     * @param {number} [opts.maxPages=Infinity]
     * @returns {AsyncGenerator<LeaderboardRow>}
     */
    rows(query: Object, opts?: {
        maxRows?: number;
        maxPages?: number;
    }): AsyncGenerator<LeaderboardRow>;
    /**
     * Collect a bounded number of rows into an array. Use it for small or known
     * ranges; use rows() or pages() for large walks.
     *
     * @param {Object} query
     * @param {Object} [opts] - { maxRows=1000, maxPages }
     * @returns {Promise<LeaderboardRow[]>}
     */
    collect(query: Object, opts?: Object): Promise<LeaderboardRow[]>;
}
