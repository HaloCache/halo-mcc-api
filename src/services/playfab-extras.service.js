/**
 * PlayFab Extras Service
 *
 * The PlayFab and MCC progression calls StatsService does not cover: CloudScript
 * execution, UGC reporting and the two progression writes. The three that mutate
 * state are gated behind an explicit `confirm: true`. PlayFab exposes no client
 * API for listing CloudScript functions, so `functionName` is a caller argument.
 * @module services/playfab-extras
 */

import { ENDPOINTS } from '../constants.js';

export class PlayFabExtrasService {
    /** @param {import('../client.js').MccClient} client */
    constructor(client) {
        if (!client) throw new Error('PlayFabExtrasService requires an MccClient');
        this.client = client;
    }

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
    async executeCloudScript(functionName, functionParameter = {}, opts = {}) {
        if (!functionName) throw new Error('executeCloudScript requires functionName (MCC CloudScript names are not enumerable; supply a real one)');
        const pf = await this.client.getPlayFabToken();
        const res = await this.client.http.post(
            ENDPOINTS.PLAYFAB.EXECUTE_CLOUD_SCRIPT,
            { FunctionName: functionName, FunctionParameter: functionParameter, GeneratePlayStreamEvent: Boolean(opts.generatePlayStreamEvent) },
            { headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Authentication': pf.SessionTicket } },
        );
        const data = res.data?.data ?? res.data;
        return {
            functionName: data?.FunctionName ?? functionName,
            functionResult: data?.FunctionResult ?? null,
            logs: data?.Logs ?? [],
            executionTimeSeconds: data?.ExecutionTimeSeconds ?? null,
            error: data?.Error ?? null,
            raw: data,
        };
    }

    /**
     * Report a UGC (fileshare) item. WRITE: gated behind confirm:true.
     * Modeled request (PlayFab ReportUgcItem): { ItemId, ReportReason, ConcernCategory? }.
     *
     * @param {{ItemId:string, ReportReason?:string, ConcernCategory?:string}} body
     * @param {{confirm?:boolean}} [opts]
     * @returns {Promise<Object>}
     */
    async reportUgcItem(body, opts = {}) {
        if (!opts.confirm) throw new Error('reportUgcItem mutates state; pass { confirm: true } to proceed');
        if (!body?.ItemId) throw new Error('reportUgcItem requires { ItemId }');
        const pf = await this.client.getPlayFabToken();
        const res = await this.client.http.post(
            ENDPOINTS.PLAYFAB.REPORT_UGC_ITEM, body,
            { headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Authentication': pf.SessionTicket } },
        );
        return res.data?.data ?? res.data;
    }

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
    async cachePlayerXpToPlayFab(body, opts = {}) {
        if (!opts.confirm) throw new Error('cachePlayerXpToPlayFab mutates state; pass { confirm: true } to proceed');
        return this.client.mccPost(ENDPOINTS.MCC.PROGRESSION_CACHE_XP, body ?? {});
    }

    /**
     * @param {Object} body
     * @param {{confirm?:boolean}} [opts]
     * @returns {Promise<Object>}
     */
    async writeProgressionEntityObjects(body, opts = {}) {
        if (!opts.confirm) throw new Error('writeProgressionEntityObjects mutates state; pass { confirm: true } to proceed');
        return this.client.mccPost(ENDPOINTS.MCC.PROGRESSION_WRITE_ENTITY_OBJECTS, body ?? {});
    }
}
