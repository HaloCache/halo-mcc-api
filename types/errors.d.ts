/**
 * API error classes extending MccApiError.
 * Transport status, response headers, and error codes remain available to callers.
 *
 * @module errors
 */
/**
 * API error with status, cause, and operation context.
 */
export declare class MccApiError extends Error {
    code: string;
    statusCode: number | undefined;
    cause: Error | undefined;
    context: Object;
    timestamp: string;
    response: any;
    /**
     * @param {string} message - Error message
     * @param {Object} [options] - Additional options
     * @param {string} [options.code] - Error code
     * @param {number} [options.statusCode] - HTTP status code
     * @param {Error} [options.cause] - Original error
     * @param {Object} [options.context] - Additional context
     */
    constructor(message: string, options?: {
        code?: string;
        statusCode?: number;
        cause?: Error;
        context?: Object;
    });
    /**
     * Convert error to JSON-serializable object
     * @returns {Object}
     */
    toJSON(): Object;
}
/**
 * Thrown when a player/gamertag cannot be found.
 */
export declare class PlayerNotFoundError extends MccApiError {
    identifier: string;
    /**
     * @param {string} identifier - Gamertag or XUID that wasn't found
     * @param {Object} [options] - Additional options
     */
    constructor(identifier: string, options?: Object);
}
/**
 * Thrown when authentication has expired or is invalid.
 */
export declare class AuthExpiredError extends MccApiError {
    /**
     * @param {string} [message] - Optional custom message
     * @param {Object} [options] - Additional options
     */
    constructor(message?: string, options?: Object);
}
/**
 * Thrown when rate limit is exceeded.
 * Includes retry timing information.
 */
export declare class RateLimitError extends MccApiError {
    retryAfter: number;
    endpoint: string | undefined;
    /**
     * @param {Object} [options] - Options including retry timing
     * @param {number} [options.retryAfter] - Milliseconds until retry is allowed
     * @param {string} [options.endpoint] - Endpoint that was rate limited
     */
    constructor(options?: {
        retryAfter?: number;
        endpoint?: string;
    });
}
/**
 * Thrown when a network error occurs (connection timeout, DNS failure, etc.)
 */
export declare class NetworkError extends MccApiError {
    endpoint: string | undefined;
    /** Taxonomy code, since `code` carries the transport code. */
    errorCode: string;
    /**
     * @param {string} [message] - Error message
     * @param {Object} [options] - Additional options
     * @param {string} [options.endpoint] - Endpoint that failed
     */
    constructor(message?: string, options?: {
        endpoint?: string;
    });
}
/**
 * Thrown when an item or resource is not found.
 */
export declare class NotFoundError extends MccApiError {
    resourceType: string;
    identifier: string;
    /**
     * @param {string} resourceType - Type of resource (e.g., 'item', 'server')
     * @param {string} identifier - Resource identifier
     * @param {Object} [options] - Additional options
     */
    constructor(resourceType: string, identifier: string, options?: Object);
}
/**
 * Thrown when PlayFab API returns an error.
 */
export declare class PlayFabError extends MccApiError {
    playFabErrorCode: string | undefined;
    /**
     * @param {string} message - Error message from PlayFab
     * @param {Object} [options] - Additional options
     * @param {string} [options.errorCode] - PlayFab error code
     */
    constructor(message: string, options?: {
        errorCode?: string;
    });
}
/**
 * Create appropriate error from API response
 * @param {Error} error - Original transport error
 * @param {string} [context] - Additional context about the operation
 * @returns {MccApiError} Appropriate error type
 */
export declare function createApiError(error: Error, context?: string): MccApiError;
