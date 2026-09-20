/**
 * Attach request and response metadata to API results.
 *
 * @module utils/response-enrichment
 */
export type EnrichedResponse = {
    /**
     * - The actual API response data
     */
    data: any;
    /**
     * - Request/response metadata
     */
    metadata: ResponseMetadata;
};
export type ResponseMetadata = {
    /**
     * - When the request was made
     */
    timestamp: Date;
    /**
     * - Request duration in milliseconds
     */
    durationMs: number;
    /**
     * - HTTP status code
     */
    statusCode: number;
    /**
     * - API endpoint URL
     */
    endpoint: string;
    /**
     * - HTTP method (GET, POST, etc.)
     */
    method: string;
    /**
     * - Sanitized request parameters
     */
    requestParams?: Object;
    /**
     * - Relevant response headers
     */
    responseHeaders?: Object;
};
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
export declare function enrichResponse(requestFn: Function, options?: {
    endpoint: string;
    method?: string;
    params?: Object;
}): Promise<EnrichedResponse>;
export default enrichResponse;
