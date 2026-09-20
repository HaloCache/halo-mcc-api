/**
 * Attach request and response metadata to API results.
 *
 * @module utils/response-enrichment
 */

/**
 * @typedef {Object} EnrichedResponse
 * @property {any} data - The actual API response data
 * @property {ResponseMetadata} metadata - Request/response metadata
 */

/**
 * @typedef {Object} ResponseMetadata
 * @property {Date} timestamp - When the request was made
 * @property {number} durationMs - Request duration in milliseconds
 * @property {number} statusCode - HTTP status code
 * @property {string} endpoint - API endpoint URL
 * @property {string} method - HTTP method (GET, POST, etc.)
 * @property {Object} [requestParams] - Sanitized request parameters
 * @property {Object} [responseHeaders] - Relevant response headers
 */

/**
 * Wrap an HTTP request with metadata tracking
 *
 * @param {Function} requestFn - Async function that makes the HTTP request
 * @param {Object} options - Enrichment options
 * @param {string} options.endpoint - Endpoint identifier
 * @param {string} [options.method='POST'] - HTTP method
 * @param {Object} [options.params] - Request parameters to include
 * @returns {Promise<EnrichedResponse>} Enriched response with metadata
 */
export async function enrichResponse(requestFn, options = {}) {
    const {
        endpoint = 'unknown',
        method = 'POST',
        params = {}
    } = options;

    const startTime = Date.now();
    const timestamp = new Date(startTime);

    try {
        const response = await requestFn();
        const durationMs = Date.now() - startTime;

        return {
            data: response.data?.data ?? response.data,
            metadata: {
                timestamp,
                durationMs,
                statusCode: response.status,
                endpoint,
                method,
                requestParams: sanitizeParams(params),
                responseHeaders: filterHeaders(response.headers),
                success: true
            }
        };
    } catch (error) {
        const durationMs = Date.now() - startTime;

        if (error && typeof error === 'object' && !error.metadata) {
            error.metadata = {
                timestamp,
                durationMs,
                statusCode: error.response?.status ?? 0,
                endpoint,
                method,
                requestParams: sanitizeParams(params),
                responseHeaders: filterHeaders(error.response?.headers),
                success: false,
                error: error.message
            };
        }

        throw error;
    }
}

/**
 * Remove credential fields from request metadata.
 * @private
 */
const SENSITIVE_KEY = /token|ticket|auth|secret|password|credential|signature|\bkey\b/i;

function sanitizeParams(params) {
    if (!params || typeof params !== 'object') return {};

    const sanitized = {};
    for (const [key, value] of Object.entries(params)) {
        sanitized[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : value;
    }

    return sanitized;
}

/**
 * Select response headers for diagnostic metadata.
 * @private
 */
function filterHeaders(headers) {
    if (!headers) return {};

    const keepHeaders = [
        'content-type',
        'content-length',
        'date',
        'retry-after',
        'x-cache',
        'ms-cv',
        'x-requestid',
        'x-request-id',
        'x-ms-request-id',
        'x-azure-ref',
        'x-tracecontext-traceid',
        'e2eactivity',
        'x-httpstatus',
        'server-timing',
        'x-envoy-upstream-service-time'
    ];

    const filtered = {};
    for (const key of Object.keys(headers)) {
        if (keepHeaders.includes(key.toLowerCase())) {
            filtered[key] = headers[key];
        }
    }

    return filtered;
}

export default enrichResponse;
