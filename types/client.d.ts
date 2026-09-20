/**
 * Authenticated HTTP requests and token caching for MCC services.
 *
 * @module client
 */
export type Logger = {
    debug?: (...args: unknown[]) => void;
    info?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
};
export type MccClientOptions = {
    onTelemetry?: (event: Record<string, unknown>) => void;
    logger?: Logger;
    httpClient?: (config: Record<string, unknown>) => Promise<{
        data: any;
    }>;
    fetch?: typeof globalThis.fetch;
    timeoutMs?: number;
};
/**
 * Shared authentication state and HTTP transport for MCC services.
 *
 * @class MccClient
 */
export declare class MccClient {
    auth: import("@halocache/halo-mcc-auth").XboxAuth;
    onTelemetry: (event: Record<string, unknown>) => void;
    log: Readonly<{
        debug(): void;
        info(): void;
        warn(): void;
        error(): void;
    }> | {
        [k: string]: any;
    };
    http: (config: Record<string, unknown>) => Promise<{
        data: any;
    }>;
    /** @private @type {import('./types/common.types.js').PlayFabLoginResult|null} */
    private _playFabToken;
    /** @private @type {number|null} */
    private _playFabTokenExpiry;
    /** @private @type {string|null} */
    private _spartanToken;
    /** @private @type {number|null} */
    private _spartanTokenExpiry;
    /** @private @type {Promise<string>|null} */
    private _spartanRefresh;
    /** @private @type {string|null} */
    private _clearance;
    /** @private @type {Promise<string>|null} */
    private _clearanceRefresh;
    /**
     * @param {import('@halocache/halo-mcc-auth').XboxAuth} xboxAuth - Authenticated XboxAuth instance
     * @param {MccClientOptions} [options] - Client options
     * @throws {Error} If xboxAuth is not provided
     */
    constructor(xboxAuth: import('@halocache/halo-mcc-auth').XboxAuth, options?: MccClientOptions);
    /**
     * Make an authenticated request to Xbox Live.
     *
     * @param {string} method - HTTP method
     * @param {string} url - Full API URL
     * @param {Object} [body] - Request body (for POST)
     * @returns {Promise<Object>} Response data
     */
    xboxRequest(method: string, url: string, body?: Object): Promise<Object>;
    /**
     * Get PlayFab session token for API calls.
     * Cached for 5 minutes.
     *
     * @returns {Promise<import('./types/common.types.js').PlayFabLoginResult>} PlayFab login result
     */
    getPlayFabToken(): Promise<import('./types/common.types.js').PlayFabLoginResult>;
    /**
     * Get XSTS token for a specific relying party.
     *
     * @param {string} relyingParty - Relying party URL (use RELYING_PARTIES constants)
     * @returns {Promise<import('./types/common.types.js').XboxToken>} Xbox token
     */
    getXboxToken(relyingParty: string): Promise<import('./types/common.types.js').XboxToken>;
    /**
     * Get Spartan token for Halo Waypoint APIs.
     * Cached until expiry.
     *
     * @returns {Promise<string>} Spartan token string (format: v4=base64...)
     */
    getSpartanToken(): Promise<string>;
    /**
     * Get clearance (flight configuration) ID.
     * Cached for entire session.
     *
     * @returns {Promise<string>} Flight configuration ID
     */
    getClearance(): Promise<string>;
    /**
     * Make an authenticated POST request to PlayFab.
     *
     * @param {string} url - Full API URL
     * @param {Object} body - Request body
     * @param {Object} [options] - Additional options
     * @param {boolean} [options.useEntityToken=false] - Use EntityToken instead of SessionTicket
     * @returns {Promise<Object>} Response data
     */
    playFabPost(url: string, body: Object, options?: {
        useEntityToken?: boolean;
    }): Promise<Object>;
    /**
     * Make an authenticated POST request to MCC production API.
     *
     * @param {string} url - Full API URL
     * @param {Object} body - Request body
     * @param {Object} [extraHeaders] - Additional headers to include
     * @returns {Promise<Object>} Response data
     */
    mccPost(url: string, body: Object, extraHeaders?: Object): Promise<Object>;
}
