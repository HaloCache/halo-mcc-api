/**
 * Leaderboard Service
 *
 * Xbox Live leaderboards as MCC uses them, with continuation-token pagination
 * that walks a whole board without holding it in memory. A board name is either
 * composed from a spec by buildLeaderboardName or passed through verbatim.
 * @module services/leaderboard
 */

import { ENDPOINTS, MCC_SCID, RELYING_PARTIES, buildLeaderboardName } from '../constants.js';

/** Default retry/backoff policy; overridable per call. */
export const DEFAULT_RETRY = Object.freeze({
    maxRetries: 5,
    baseDelayMs: 500,
    maxDelayMs: 20_000,
    retryOnStatus: Object.freeze([429, 500, 502, 503, 504]),
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

export class LeaderboardService {
    /**
     * @param {import('../client.js').MccClient} client
     * @param {Object} [options]
     * @param {string} [options.scid] - Service config id. Defaults to MCC_SCID.
     * @param {Partial<LeaderboardRetryPolicy>} [options.retry] - Overrides for DEFAULT_RETRY.
     */
    constructor(client, options = {}) {
        if (!client) throw new Error('LeaderboardService requires an MccClient');
        this.client = client;
        this.scid = options.scid || MCC_SCID;
        /** @type {LeaderboardRetryPolicy} */
        this.retry = { ...DEFAULT_RETRY, ...(options.retry || {}) };
    }

    /** @private */
    async _headers(contractVersion) {
        const xsts = await this.client.getXboxToken(RELYING_PARTIES.XBOX_LIVE);
        return {
            Authorization: xsts.tokenString,
            'x-xbl-contract-version': String(contractVersion),
            Accept: 'application/json',
        };
    }

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
    buildUrl(q) {
        if (!q) throw new Error('leaderboard query required');
        if (!q.name && q.board) q = { ...q, name: buildLeaderboardName(q.board) };
        if (!q.name) throw new Error('leaderboard query requires { name } or { board }');
        if (!this.scid) throw new Error('leaderboard query requires a scid');
        const p = new URLSearchParams();
        if (q.view === 'people') {
            if (!q.viewTarget || !q.xuid) throw new Error("people view requires { viewTarget, xuid }");
            p.set('view', 'people');
            p.set('viewtarget', q.viewTarget);
            p.set('xuid', String(q.xuid));
        }
        if (q.continuationToken) p.set('continuationToken', String(q.continuationToken));
        else if (q.skipToUser != null) p.set('skipToUser', String(q.skipToUser));
        else if (q.skipToRank != null) p.set('skipToRank', String(q.skipToRank));
        p.set('maxItems', String(q.maxItems ?? 100));
        return `${ENDPOINTS.XBOX_LIVE_SERVICES.LEADERBOARDS}/scids/${encodeURIComponent(this.scid)}/leaderboards/${encodeURIComponent(q.name)}?${p}`;
    }

    /**
     * Normalize either leaderboard contract shape into a {@link LeaderboardPage}:
     * the v3 `userList` form and the v4 `value.collection` form.
     *
     * @param {Object} body
     * @returns {LeaderboardPage}
     */
    static normalizePage(body) {
        const b = body || {};
        const upstreamRows =
            b.userList /* v3 */ ||
            b.value?.collection /* v4 */ ||
            b.leaderboard?.rows ||
            b.Rows ||
            [];
        const rows = upstreamRows.map((r) => {
            let valueMetadata = null;
            if (typeof r.valuemetadata === 'string' && r.valuemetadata) {
                try { valueMetadata = JSON.parse(r.valuemetadata); } catch { valueMetadata = r.valuemetadata; }
            } else if (r.valuemetadata && typeof r.valuemetadata === 'object') {
                valueMetadata = r.valuemetadata;
            }
            return {
                rank: r.rank ?? r.Rank ?? null,
                globalRank: r.globalrank ?? r.globalRank ?? r.rank ?? null,
                xuid: (r.xuid ?? r.Xuid ?? (Array.isArray(r.xuids) ? r.xuids[0] : null)) ?? null,
                gamertag: r.gamertag ?? r.Gamertag ?? r.value?.gamertag ?? null,
                percentile: r.percentile ?? null,
                // The board's stat value, kept as the wire sends it.
                value: r.value !== undefined && !Array.isArray(r.value) && typeof r.value !== 'object' ? r.value : (Array.isArray(r.values) ? r.values[0] : null),
                values: r.values ?? (r.value !== undefined ? [r.value] : undefined) ?? r.columns ?? [],
                valueMetadata,
                raw: r,
            };
        });
        const continuationToken =
            b.pagingInfo?.continuationToken ??
            b.continuationToken ??
            b.nextLinkToken ??
            null;
        const totalCount =
            b.leaderboardInfo?.totalCount ??
            b.pagingInfo?.totalItems ??
            b.totalCount ??
            null;
        const statName = b.leaderboardInfo?.columnDefinition?.statName ?? null;
        return { rows, continuationToken: continuationToken || null, totalCount, statName, raw: b };
    }

    /**
     * Fetch a single page, with retry/backoff on throttle + transient errors.
     *
     * @param {Object} query - see buildUrl(); plus { contractVersion=3 }.
     * @returns {Promise<LeaderboardPage>}
     */
    async getPage(query) {
        const contractVersion = query.contractVersion ?? 3;
        const url = this.buildUrl(query);
        const headers = await this._headers(contractVersion);
        let attempt = 0;
        for (;;) {
            try {
                const res = await this.client.http.get(url, { headers });
                return LeaderboardService.normalizePage(res.data);
            } catch (err) {
                const status = err?.response?.status;
                const retriable = this.retry.retryOnStatus.includes(status);
                if (!retriable || attempt >= this.retry.maxRetries) throw err;
                const retryAfter = Number.parseInt(err?.response?.headers?.['retry-after'], 10);
                const backoff = Math.min(this.retry.maxDelayMs, this.retry.baseDelayMs * 2 ** attempt);
                const waitMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : backoff;
                this.client.onTelemetry?.({ type: 'ratelimit', source: 'leaderboards', status, attempt, waitMs });
                await sleep(waitMs);
                attempt += 1;
            }
        }
    }

    /**
     * Async generator over pages: yields one page at a time and follows the
     * continuation token until the board is exhausted.
     *
     * @param {Object} query - see getPage(). `maxItems` is the page size.
     * @param {Object} [opts]
     * @param {number} [opts.maxPages=Infinity] - Stop after this many pages.
     * @returns {AsyncGenerator<LeaderboardPage>}
     */
    async *pages(query, opts = {}) {
        const maxPages = opts.maxPages ?? Infinity;
        let token = query.continuationToken ?? undefined;
        let pageCount = 0;
        for (;;) {
            const page = await this.getPage({ ...query, continuationToken: token });
            yield page;
            pageCount += 1;
            token = page.continuationToken || undefined;
            if (!token || pageCount >= maxPages || page.rows.length === 0) return;
        }
    }

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
    async *rows(query, opts = {}) {
        const maxRows = opts.maxRows ?? Infinity;
        let emitted = 0;
        for await (const page of this.pages(query, { maxPages: opts.maxPages })) {
            for (const row of page.rows) {
                yield row;
                emitted += 1;
                if (emitted >= maxRows) return;
            }
        }
    }

    /**
     * Collect a bounded number of rows into an array. Use it for small or known
     * ranges; use rows() or pages() for large walks.
     *
     * @param {Object} query
     * @param {Object} [opts] - { maxRows=1000, maxPages }
     * @returns {Promise<LeaderboardRow[]>}
     */
    async collect(query, opts = {}) {
        const limit = opts.maxRows ?? 1000;
        const out = [];
        for await (const row of this.rows(query, { maxRows: limit, maxPages: opts.maxPages })) {
            out.push(row);
        }
        return out;
    }
}
