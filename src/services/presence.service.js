/**
 * Presence Service
 *
 * Xbox Live presence for one player or a batch of them, including the per-title
 * rich presence string MCC publishes. Needs an XSTS token for xboxlive.com.
 * @module services/presence
 */

import { ENDPOINTS, RELYING_PARTIES } from '../constants.js';

const CONTRACT_VERSION = '3';

/**
 * @typedef {Object} PresenceRecord
 * @property {string} xuid
 * @property {'Online'|'Offline'|string} state
 * @property {{deviceType?:string,titleId?:string,titleName?:string,timestamp?:string}|null} lastSeen
 * @property {Array<{type:string,titles:Array<{id:string,name?:string,activity?:{richPresence?:string}}>}>} devices
 * @property {Object} raw
 */

/** @param {Object} r @returns {PresenceRecord} */
function model(r) {
    return {
        xuid: r.xuid ?? null,
        state: r.state ?? 'Offline',
        lastSeen: r.lastSeen ?? null,
        devices: r.devices ?? [],
        raw: r,
    };
}

export class PresenceService {
    /** @param {import('../client.js').MccClient} client */
    constructor(client) {
        if (!client) throw new Error('PresenceService requires an MccClient');
        this.client = client;
    }

    /** @private */
    async _headers() {
        const xsts = await this.client.getXboxToken(RELYING_PARTIES.XBOX_LIVE);
        return { Authorization: xsts.tokenString, 'x-xbl-contract-version': CONTRACT_VERSION, 'Content-Type': 'application/json', Accept: 'application/json' };
    }

    /**
     * Presence for one player.
     *
     * @param {string} xuid
     * @returns {Promise<PresenceRecord>}
     */
    async getPresence(xuid) {
        if (!xuid) throw new Error('getPresence requires xuid');
        const url = `${ENDPOINTS.XBOX_LIVE_SERVICES.PRESENCE}/users/xuid(${encodeURIComponent(xuid)})`;
        const res = await this.client.http.get(url, { headers: await this._headers() });
        return model(res.data || {});
    }

    /**
     * Batch presence for many players. The request body field is `users`;
     * `requestedUsers` is rejected with 400 ArgumentError.
     *
     * @param {string[]} xuids
     * @param {Object} [options]
     * @param {'all'|'title'|'device'|'user'} [options.level='all']
     * @returns {Promise<PresenceRecord[]>}
     */
    async getPresenceBatch(xuids, options = {}) {
        if (!Array.isArray(xuids) || xuids.length === 0) throw new Error('getPresenceBatch requires a non-empty xuids array');
        const url = `${ENDPOINTS.XBOX_LIVE_SERVICES.PRESENCE}/users/batch`;
        const body = { users: xuids.map(String), level: options.level || 'all' };
        const res = await this.client.http.post(url, body, { headers: await this._headers() });
        const arr = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
        return arr.map(model);
    }
}
