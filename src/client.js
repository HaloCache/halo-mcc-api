/**
 * Authenticated HTTP requests and token caching for MCC services.
 *
 * @module client
 */

import { DEFAULT_HEADERS, RELYING_PARTIES, ENDPOINTS } from './constants.js';
import { createNodeHttpClient } from './http-client.js';

/**
 * Safety margin for cached token expiry to allow requests to finish before expiration.
 */
const TOKEN_EXPIRY_SKEW_MS = 60 * 1000;

const SPARTAN_TOKEN_AUDIENCE = 'urn:343:s3:services';
const SPARTAN_TOKEN_MIN_VERSION = 4;
const silentLogger = Object.freeze({
    debug() {},
    info() {},
    warn() {},
    error() {},
});

/**
 * @typedef {{
 *   debug?: (...args: unknown[]) => void,
 *   info?: (...args: unknown[]) => void,
 *   warn?: (...args: unknown[]) => void,
 *   error?: (...args: unknown[]) => void
 * }} Logger
 */

/**
 * @typedef {{
 *   onTelemetry?: (event: Record<string, unknown>) => void,
 *   logger?: Logger,
 *   httpClient?: (config: Record<string, unknown>) => Promise<{data: any}>,
 *   fetch?: typeof globalThis.fetch,
 *   timeoutMs?: number
 * }} MccClientOptions
 */

/** @param {Logger|null|undefined} logger */
function normalizeLogger(logger) {
    if (!logger) return silentLogger;
    return Object.fromEntries(
        Object.keys(silentLogger).map(level => [
            level,
            typeof logger[level] === 'function' ? logger[level].bind(logger) : silentLogger[level],
        ]),
    );
}

/**
 * Shared authentication state and HTTP transport for MCC services.
 *
 * @class MccClient
 */
export class MccClient {
    /** @private @type {import('./types/common.types.js').PlayFabLoginResult|null} */
    _playFabToken;
    /** @private @type {number|null} */
    _playFabTokenExpiry;
    /** @private @type {string|null} */
    _spartanToken;
    /** @private @type {number|null} */
    _spartanTokenExpiry;
    /** @private @type {Promise<string>|null} */
    _spartanRefresh;
    /** @private @type {string|null} */
    _clearance;
    /** @private @type {Promise<string>|null} */
    _clearanceRefresh;

    /**
     * @param {import('@halocache/halo-mcc-auth').XboxAuth} xboxAuth - Authenticated XboxAuth instance
     * @param {MccClientOptions} [options] - Client options
     * @throws {Error} If xboxAuth is not provided
     */
    constructor(xboxAuth, options = {}) {
        if (!xboxAuth) {
            throw new Error("MccClient requires a valid XboxAuth instance.");
        }
        this.auth = xboxAuth;
        this.onTelemetry = options.onTelemetry || (() => { });
        this.log = normalizeLogger(options.logger);

        this.http = options.httpClient || createNodeHttpClient({
            fetchImpl: options.fetch || globalThis.fetch,
            timeout: options.timeoutMs ?? 30_000
        });

        this._playFabToken = null;
        this._playFabTokenExpiry = null;
        this._spartanToken = null;
        this._spartanTokenExpiry = null;
        this._spartanRefresh = null;
        this._clearance = null;
        this._clearanceRefresh = null;
    }

    /**
     * Make an authenticated request to Xbox Live.
     *
     * @param {string} method - HTTP method
     * @param {string} url - Full API URL
     * @param {Object} [body] - Request body (for POST)
     * @returns {Promise<Object>} Response data
     */
    async xboxRequest(method, url, body = null) {
        const xsts = await this.getXboxToken(RELYING_PARTIES.XBOX_LIVE);

        const config = {
            method,
            url,
            headers: {
                ...DEFAULT_HEADERS,
                'Authorization': xsts.tokenString,
                'x-xbl-contract-version': '3'
            }
        };

        if (body) config.data = body;

        try {
            const response = await this.http(config);

            return response.data;
        } catch (err) {
            if (err.response?.status === 429 && this.onTelemetry) {
                const retryAfter = parseInt(err.response.headers?.['retry-after'], 10);
                const seconds = Number.isFinite(retryAfter) ? retryAfter : null;
                this.onTelemetry({
                    type: 'ratelimit',
                    source: 'xbox',
                    remaining: 0,
                    limit: null,
                    reset: seconds,
                    retryAfterSeconds: seconds
                });
            }
            throw err;
        }
    }

    /**
     * Get PlayFab session token for API calls.
     * Cached for 5 minutes.
     *
     * @returns {Promise<import('./types/common.types.js').PlayFabLoginResult>} PlayFab login result
     */
    async getPlayFabToken() {
        const now = Date.now();
        if (this._playFabToken && this._playFabTokenExpiry && now < this._playFabTokenExpiry) {
            return this._playFabToken;
        }

        this._playFabToken = await this.auth.getPlayFabToken();
        this._playFabTokenExpiry = Date.now() + (5 * 60 * 1000);
        return this._playFabToken;
    }

    /**
     * Get XSTS token for a specific relying party.
     *
     * @param {string} relyingParty - Relying party URL (use RELYING_PARTIES constants)
     * @returns {Promise<import('./types/common.types.js').XboxToken>} Xbox token
     */
    async getXboxToken(relyingParty) {
        return await this.auth.getXboxToken(relyingParty);
    }

    /**
     * Get Spartan token for Halo Waypoint APIs.
     * Cached until expiry.
     *
     * @returns {Promise<string>} Spartan token string (format: v4=base64...)
     */
    async getSpartanToken() {
        const usableUntil = Date.now() + TOKEN_EXPIRY_SKEW_MS;
        if (this._spartanToken && this._spartanTokenExpiry
            && new Date(this._spartanTokenExpiry).getTime() > usableUntil) {
            return this._spartanToken;
        }

        if (this._spartanRefresh) return this._spartanRefresh;

        this._spartanRefresh = (async () => {
            const xsts = await this.getXboxToken(RELYING_PARTIES.HALO_WAYPOINT);

            const response = await this.http.post(
                ENDPOINTS.WAYPOINT.SPARTAN_TOKEN,
                {
                    "Audience": SPARTAN_TOKEN_AUDIENCE,
                    "MinVersion": SPARTAN_TOKEN_MIN_VERSION,
                    "Proof": [{ "TokenType": "Xbox_XSTSv3", "Token": xsts.token }]
                },
                { headers: DEFAULT_HEADERS }
            );

            const token = response.data?.SpartanToken;
            const expiry = response.data?.ExpiresUtc?.ISO8601Date;
            if (!token || !expiry) {
                throw new Error('Spartan token response missing SpartanToken or ExpiresUtc.ISO8601Date');
            }

            this._spartanToken = token;
            this._spartanTokenExpiry = expiry;
            return token;
        })();

        try {
            return await this._spartanRefresh;
        } finally {
            this._spartanRefresh = null;
        }
    }

    /**
     * Get clearance (flight configuration) ID.
     * Cached for entire session.
     *
     * @returns {Promise<string>} Flight configuration ID
     */
    async getClearance() {
        if (this._clearance) return this._clearance;
        if (this._clearanceRefresh) return this._clearanceRefresh;

        this._clearanceRefresh = (async () => {
            const spartanToken = await this.getSpartanToken();
            const xsts = await this.getXboxToken(RELYING_PARTIES.XBOX_LIVE);
            const xuid = encodeURIComponent(xsts.userXUID);

            const response = await this.http.get(
                `${ENDPOINTS.WAYPOINT.CLEARANCE}/xuid(${xuid})/active`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'X-343-Authorization-Spartan': spartanToken
                    }
                }
            );

            const clearance = response.data?.FlightConfigurationId;
            if (!clearance) throw new Error('Clearance response missing FlightConfigurationId');

            this._clearance = clearance;
            return clearance;
        })();

        try {
            return await this._clearanceRefresh;
        } finally {
            this._clearanceRefresh = null;
        }
    }

    /**
     * Make an authenticated POST request to PlayFab.
     *
     * @param {string} url - Full API URL
     * @param {Object} body - Request body
     * @param {Object} [options] - Additional options
     * @param {boolean} [options.useEntityToken=false] - Use EntityToken instead of SessionTicket
     * @returns {Promise<Object>} Response data
     */
    async playFabPost(url, body, options = {}) {
        const pf = await this.getPlayFabToken();
        const headers = { ...DEFAULT_HEADERS };

        if (options.useEntityToken) {
            headers['X-EntityToken'] = pf.EntityToken.EntityToken;
        } else {
            headers['X-Authentication'] = pf.SessionTicket;
        }

        const response = await this.http.post(url, body, { headers });
        return response.data?.data ?? response.data;
    }

    /**
     * Make an authenticated POST request to MCC production API.
     *
     * @param {string} url - Full API URL
     * @param {Object} body - Request body
     * @param {Object} [extraHeaders] - Additional headers to include
     * @returns {Promise<Object>} Response data
     */
    async mccPost(url, body, extraHeaders = {}) {
        const pf = await this.getPlayFabToken();
        const headers = {
            ...DEFAULT_HEADERS,
            'x-auth-token': pf.SessionTicket,
            ...extraHeaders
        };

        const response = await this.http.post(url, body, { headers });
        return response.data?.data ?? response.data;
    }
}
