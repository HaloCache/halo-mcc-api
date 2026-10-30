/**
 * Moderation Service
 *
 * MCC's string-validation and player-reporting Azure Functions, over the MCC
 * production transport (x-auth-token). Their request and response bodies are not
 * publicly documented, so each method sends a caller-supplied body, and the two
 * reporting writes are gated behind `confirm: true`.
 * @module services/moderation
 */
export declare class ModerationService {
    client: import("../client.js").MccClient;
    /** @param {import('../client.js').MccClient} client */
    constructor(client: import('../client.js').MccClient);
    /**
     * Validate a display/chat string against MCC's profanity filter.
     * The body shape is undocumented; pass what the game sends (likely
     * { string } or { strings:[...] }).
     *
     * @param {Object} body
     * @param {{chat?:boolean}} [opts] - chat:true uses ValidateChatString.
     * @returns {Promise<Object>}
     */
    validateString(body: Object, opts?: {
        chat?: boolean;
    }): Promise<Object>;
    /**
     * Fetch the profanity filter string list. Body and response are undocumented.
     * @param {Object} [body]
     * @returns {Promise<Object>}
     */
    getProfanityFilterList(body?: Object): Promise<Object>;
    /**
     * Fetch the chat-string public key. Body and response are undocumented.
     * @param {Object} [body]
     * @returns {Promise<Object>}
     */
    getChatStringPublicKey(body?: Object): Promise<Object>;
    /**
     * Report a player. A write, gated behind confirm:true; body undocumented.
     * @param {Object} body @param {{confirm?:boolean}} [opts]
     * @returns {Promise<Object>}
     */
    reportPlayer(body: Object, opts?: {
        confirm?: boolean;
    }): Promise<Object>;
    /**
     * Report malicious content (UGC/user). WRITE: gated behind confirm:true.
     * @param {Object} body @param {{confirm?:boolean}} [opts]
     * @returns {Promise<Object>}
     */
    reportMaliciousContent(body: Object, opts?: {
        confirm?: boolean;
    }): Promise<Object>;
}
