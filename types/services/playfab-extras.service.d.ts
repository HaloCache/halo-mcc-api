/**
 * PlayFab Extras Service
 *
 * The PlayFab and MCC progression calls StatsService does not cover: CloudScript
 * execution, UGC reporting and the two progression writes. The three that mutate
 * state are gated behind an explicit `confirm: true`. PlayFab exposes no client
 * API for listing CloudScript functions, so `functionName` is a caller argument.
 * @module services/playfab-extras
 */
export declare class PlayFabExtrasService {
    client: import("../client.js").MccClient;
    /** @param {import('../client.js').MccClient} client */
    constructor(client: import('../client.js').MccClient);
    /**
     * Execute an MCC CloudScript function. Reachable read-only when the function
     * itself is read-only; `functionName` is required (names not enumerable).
     *
     * Modeled response (PlayFab ExecuteCloudScript result):
     *   { FunctionName, FunctionResult, Logs:[{Level,Message,Data}],
     *     ExecutionTimeSeconds, MemoryConsumedBytes, APIRequestsIssued,
     *     HttpRequestsIssued, Error? }
     *
     * @param {string} functionName
     * @param {Object} [functionParameter={}]
     * @param {Object} [opts]
     * @param {boolean} [opts.generatePlayStreamEvent=false]
     * @returns {Promise<Object>} The ExecuteCloudScript result.
     */
    executeCloudScript(functionName: string, functionParameter?: Object, opts?: {
        generatePlayStreamEvent?: boolean;
    }): Promise<Object>;
    /**
     * Report a UGC (fileshare) item. WRITE: gated behind confirm:true.
     * Modeled request (PlayFab ReportUgcItem): { ItemId, ReportReason, ConcernCategory? }.
     *
     * @param {{ItemId:string, ReportReason?:string, ConcernCategory?:string}} body
     * @param {{confirm?:boolean}} [opts]
     * @returns {Promise<Object>}
     */
    reportUgcItem(body: {
        ItemId: string;
        ReportReason?: string;
        ConcernCategory?: string;
    }, opts?: {
        confirm?: boolean;
    }): Promise<Object>;
    /**
     * MCC progression writes (authed account only), via the MCC production
     * transport (x-auth-token = PlayFab SessionTicket). WRITE: gated behind
     * confirm:true. The body shape is not publicly documented, so pass it
     * through as the game sends it.
     *
     * @param {Object} body
     * @param {{confirm?:boolean}} [opts]
     * @returns {Promise<Object>}
     */
    cachePlayerXpToPlayFab(body: Object, opts?: {
        confirm?: boolean;
    }): Promise<Object>;
    /**
     * @param {Object} body
     * @param {{confirm?:boolean}} [opts]
     * @returns {Promise<Object>}
     */
    writeProgressionEntityObjects(body: Object, opts?: {
        confirm?: boolean;
    }): Promise<Object>;
}
