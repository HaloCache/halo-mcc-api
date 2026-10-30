/**
 * Social Service
 *
 * The Xbox Live people graph behind MCC's friends and rivals features. A rival
 * is a person with `isFavorite === true`, and that is a flag on each people
 * entry rather than a separate subpath, so getFavorites (aliased as getRivals)
 * filters the list client-side. Needs an XSTS token for xboxlive.com.
 * @module services/social
 */

import { ENDPOINTS, RELYING_PARTIES } from '../constants.js';

const CONTRACT_VERSION = '1';

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

export class SocialService {
    /** @param {import('../client.js').MccClient} client */
    constructor(client) {
        if (!client) throw new Error('SocialService requires an MccClient');
        this.client = client;
    }

    /** @private */
    async _headers() {
        const xsts = await this.client.getXboxToken(RELYING_PARTIES.XBOX_LIVE);
        return { Authorization: xsts.tokenString, 'x-xbl-contract-version': CONTRACT_VERSION, Accept: 'application/json' };
    }

    /** @private */
    async _selfXuid(xuid) {
        if (xuid) return String(xuid);
        const xsts = await this.client.getXboxToken(RELYING_PARTIES.XBOX_LIVE);
        return String(xsts.userXUID);
    }

    /** @private Map one upstream person object to {@link PersonEntry}. */
    static _person(p) {
        return {
            xuid: p.xuid ?? null,
            addedDateTimeUtc: p.addedDateTimeUtc ?? null,
            isFavorite: Boolean(p.isFavorite),
            isFollowedByCaller: Boolean(p.isFollowedByCaller),
            isFollowingCaller: Boolean(p.isFollowingCaller),
            socialNetworks: p.socialNetworks ?? [],
            raw: p,
        };
    }

    /**
     * The people (friends) list for a player.
     *
     * @param {string} [xuid] - Target XUID; defaults to the authed account.
     * @returns {Promise<{ totalCount: number, incomingFriendRequestsCount: number, people: PersonEntry[] }>}
     */
    async getPeople(xuid) {
        const target = await this._selfXuid(xuid);
        const url = `${ENDPOINTS.XBOX_LIVE_SERVICES.SOCIAL}/users/xuid(${encodeURIComponent(target)})/people`;
        const res = await this.client.http.get(url, { headers: await this._headers() });
        const body = res.data || {};
        return {
            totalCount: body.totalCount ?? (body.people?.length ?? 0),
            incomingFriendRequestsCount: body.incomingFriendRequestsCount ?? 0,
            people: (body.people || []).map(SocialService._person),
        };
    }

    /**
     * The caller's favorites (= MCC rivals), filtered client-side on isFavorite.
     *
     * @param {string} [xuid]
     * @returns {Promise<PersonEntry[]>}
     */
    async getFavorites(xuid) {
        const { people } = await this.getPeople(xuid);
        return people.filter((p) => p.isFavorite);
    }

    /**
     * Alias for getFavorites: the MCC "rivals" set.
     *
     * @param {string} [xuid]
     * @returns {Promise<PersonEntry[]>}
     */
    async getRivals(xuid) {
        return this.getFavorites(xuid);
    }

    /**
     * The caller's relationship to one target person, if the target is in the
     * caller's people list. Returns null on 404 (not in the list).
     *
     * @param {string} targetXuid
     * @param {string} [viewerXuid] - defaults to the authed account.
     * @returns {Promise<PersonEntry|null>}
     */
    async getPerson(targetXuid, viewerXuid) {
        if (!targetXuid) throw new Error('getPerson requires targetXuid');
        const viewer = await this._selfXuid(viewerXuid);
        const url = `${ENDPOINTS.XBOX_LIVE_SERVICES.SOCIAL}/users/xuid(${encodeURIComponent(viewer)})/people/xuid(${encodeURIComponent(targetXuid)})`;
        try {
            const res = await this.client.http.get(url, { headers: await this._headers() });
            return SocialService._person(res.data || {});
        } catch (err) {
            if (err.response?.status === 404) return null;
            throw err;
        }
    }

    /**
     * Follow/favorite summary for a player (totalCount of followers/following,
     * favorite flags). Shape passed through as the real upstream summary.
     *
     * @param {string} [xuid]
     * @returns {Promise<Object>}
     */
    async getSummary(xuid) {
        const target = await this._selfXuid(xuid);
        const url = `${ENDPOINTS.XBOX_LIVE_SERVICES.SOCIAL}/users/xuid(${encodeURIComponent(target)})/summary`;
        const res = await this.client.http.get(url, { headers: await this._headers() });
        return res.data;
    }
}
