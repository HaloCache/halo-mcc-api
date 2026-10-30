/**
 * Moderation Service
 *
 * MCC's string-validation and player-reporting Azure Functions, over the MCC
 * production transport (x-auth-token). Their request and response bodies are not
 * publicly documented, so each method sends a caller-supplied body, and the two
 * reporting writes are gated behind `confirm: true`.
 * @module services/moderation
 */

import { ENDPOINTS } from '../constants.js';

export class ModerationService {
    /** @param {import('../client.js').MccClient} client */
    constructor(client) {
        if (!client) throw new Error('ModerationService requires an MccClient');
        this.client = client;
    }

    /**
     * Validate a display/chat string against MCC's profanity filter.
     * The body shape is undocumented; pass what the game sends (likely
     * { string } or { strings:[...] }).
     *
     * @param {Object} body
     * @param {{chat?:boolean}} [opts] - chat:true uses ValidateChatString.
     * @returns {Promise<Object>}
     */
    async validateString(body, opts = {}) {
        const url = opts.chat ? ENDPOINTS.MCC.VALIDATE_CHAT_STRING : ENDPOINTS.MCC.VALIDATE_STRING;
        return this.client.mccPost(url, body ?? {});
    }

    /**
     * Fetch the profanity filter string list. Body and response are undocumented.
     * @param {Object} [body]
     * @returns {Promise<Object>}
     */
    async getProfanityFilterList(body = {}) {
        return this.client.mccPost(ENDPOINTS.MCC.PROFANITY_FILTER_STRING_LIST, body);
    }

    /**
     * Fetch the chat-string public key. Body and response are undocumented.
     * @param {Object} [body]
     * @returns {Promise<Object>}
     */
    async getChatStringPublicKey(body = {}) {
        return this.client.mccPost(ENDPOINTS.MCC.CHAT_STRING_PUBLIC_KEY, body);
    }

    /**
     * Report a player. A write, gated behind confirm:true; body undocumented.
     * @param {Object} body @param {{confirm?:boolean}} [opts]
     * @returns {Promise<Object>}
     */
    async reportPlayer(body, opts = {}) {
        if (!opts.confirm) throw new Error('reportPlayer mutates state; pass { confirm: true } to proceed');
        return this.client.mccPost(ENDPOINTS.MCC.REPORT_PLAYER, body ?? {});
    }

    /**
     * Report malicious content (UGC/user). WRITE: gated behind confirm:true.
     * @param {Object} body @param {{confirm?:boolean}} [opts]
     * @returns {Promise<Object>}
     */
    async reportMaliciousContent(body, opts = {}) {
        if (!opts.confirm) throw new Error('reportMaliciousContent mutates state; pass { confirm: true } to proceed');
        return this.client.mccPost(ENDPOINTS.MCC.USER_REPORT_ABOUT_MALICIOUS_CONTENT, body ?? {});
    }
}
