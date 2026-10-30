/**
 * Presence Service
 *
 * Xbox Live presence for one player or a batch of them, including the per-title
 * rich presence string MCC publishes. Needs an XSTS token for xboxlive.com.
 * @module services/presence
 */
export type PresenceRecord = {
    xuid: string;
    state: 'Online' | 'Offline' | string;
    lastSeen: {
        deviceType?: string;
        titleId?: string;
        titleName?: string;
        timestamp?: string;
    } | null;
    devices: Array<{
        type: string;
        titles: Array<{
            id: string;
            name?: string;
            activity?: {
                richPresence?: string;
            };
        }>;
    }>;
    raw: Object;
};
export declare class PresenceService {
    client: import("../client.js").MccClient;
    /** @param {import('../client.js').MccClient} client */
    constructor(client: import('../client.js').MccClient);
    /** @private */
    private _headers;
    /**
     * Presence for one player.
     *
     * @param {string} xuid
     * @returns {Promise<PresenceRecord>}
     */
    getPresence(xuid: string): Promise<PresenceRecord>;
    /**
     * Batch presence for many players. The request body field is `users`;
     * `requestedUsers` is rejected with 400 ArgumentError.
     *
     * @param {string[]} xuids
     * @param {Object} [options]
     * @param {'all'|'title'|'device'|'user'} [options.level='all']
     * @returns {Promise<PresenceRecord[]>}
     */
    getPresenceBatch(xuids: string[], options?: {
        level?: 'all' | 'title' | 'device' | 'user';
    }): Promise<PresenceRecord[]>;
}
