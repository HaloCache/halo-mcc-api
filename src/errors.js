/**
 * API error classes extending MccApiError.
 * Transport status, response headers, and error codes remain available to callers.
 *
 * @module errors
 */

/**
 * API error with status, cause, and operation context.
 */
export class MccApiError extends Error {
    /**
     * @param {string} message - Error message
     * @param {Object} [options] - Additional options
     * @param {string} [options.code] - Error code
     * @param {number} [options.statusCode] - HTTP status code
     * @param {Error} [options.cause] - Original error
     * @param {Object} [options.context] - Additional context
     */
    constructor(message, options = {}) {
        super(message);
        this.name = 'MccApiError';
        this.code = options.code || 'MCC_ERROR';
        this.statusCode = options.statusCode;
        this.cause = options.cause;
        this.context = options.context || {};
        this.timestamp = new Date().toISOString();

        const inherited = options.response ?? options.cause?.response;
        if (inherited) {
            this.response = inherited;
        } else if (options.statusCode !== undefined) {
            this.response = { status: options.statusCode, headers: {}, data: null };
        }

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Convert error to JSON-serializable object
     * @returns {Object}
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            context: this.context,
            timestamp: this.timestamp
        };
    }
}

/**
 * Thrown when a player/gamertag cannot be found.
 */
export class PlayerNotFoundError extends MccApiError {
    /**
     * @param {string} identifier - Gamertag or XUID that wasn't found
     * @param {Object} [options] - Additional options
     */
    constructor(identifier, options = {}) {
        super(`Player not found: ${identifier}`, {
            code: 'PLAYER_NOT_FOUND',
            statusCode: 404,
            ...options,
            context: { identifier, ...options.context }
        });
        this.name = 'PlayerNotFoundError';
        this.identifier = identifier;
    }
}

/**
 * Thrown when authentication has expired or is invalid.
 */
export class AuthExpiredError extends MccApiError {
    /**
     * @param {string} [message] - Optional custom message
     * @param {Object} [options] - Additional options
     */
    constructor(message = 'Authentication expired or invalid', options = {}) {
        super(message, {
            code: 'AUTH_EXPIRED',
            statusCode: 401,
            ...options
        });
        this.name = 'AuthExpiredError';
    }
}

/**
 * Thrown when rate limit is exceeded.
 * Includes retry timing information.
 */
export class RateLimitError extends MccApiError {
    /**
     * @param {Object} [options] - Options including retry timing
     * @param {number} [options.retryAfter] - Milliseconds until retry is allowed
     * @param {string} [options.endpoint] - Endpoint that was rate limited
     */
    constructor(options = {}) {
        const retryAfter = options.retryAfter || 1000;
        super(options.message ?? `Rate limit exceeded. Retry after ${retryAfter}ms`, {
            code: 'RATE_LIMITED',
            statusCode: 429,
            ...options,
            response: options.response ?? options.cause?.response ?? {
                status: 429,
                headers: { 'retry-after': String(Math.ceil(retryAfter / 1000)) },
                data: null
            },
            context: {
                retryAfter,
                endpoint: options.endpoint,
                ...options.context
            }
        });
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
        this.endpoint = options.endpoint;
    }
}

/**
 * Thrown when a network error occurs (connection timeout, DNS failure, etc.)
 */
export class NetworkError extends MccApiError {
    /**
     * @param {string} [message] - Error message
     * @param {Object} [options] - Additional options
     * @param {string} [options.endpoint] - Endpoint that failed
     */
    constructor(message = 'Network error occurred', options = {}) {
        super(message, {
            code: options.code ?? options.cause?.code ?? 'NETWORK_ERROR',
            ...options,
            context: {
                endpoint: options.endpoint,
                ...options.context
            }
        });
        this.name = 'NetworkError';
        this.endpoint = options.endpoint;
        /** Taxonomy code, since `code` carries the transport code. */
        this.errorCode = 'NETWORK_ERROR';
    }
}

/**
 * Thrown when an item or resource is not found.
 */
export class NotFoundError extends MccApiError {
    /**
     * @param {string} resourceType - Type of resource (e.g., 'item', 'server')
     * @param {string} identifier - Resource identifier
     * @param {Object} [options] - Additional options
     */
    constructor(resourceType, identifier, options = {}) {
        super(`${resourceType} not found: ${identifier}`, {
            code: 'NOT_FOUND',
            statusCode: 404,
            ...options,
            context: { resourceType, identifier, ...options.context }
        });
        this.name = 'NotFoundError';
        this.resourceType = resourceType;
        this.identifier = identifier;
    }
}

/**
 * Thrown when PlayFab API returns an error.
 */
export class PlayFabError extends MccApiError {
    /**
     * @param {string} message - Error message from PlayFab
     * @param {Object} [options] - Additional options
     * @param {string} [options.errorCode] - PlayFab error code
     */
    constructor(message, options = {}) {
        super(message, {
            code: options.errorCode || 'PLAYFAB_ERROR',
            ...options
        });
        this.name = 'PlayFabError';
        this.playFabErrorCode = options.errorCode;
    }
}

/**
 * Create appropriate error from API response
 * @param {Error} error - Original transport error
 * @param {string} [context] - Additional context about the operation
 * @returns {MccApiError} Appropriate error type
 */
export function createApiError(error, context = '') {
    const response = error.response;
    const statusCode = response?.status;
    const message = response?.data?.message || error.message;

    if (statusCode === 401) {
        return new AuthExpiredError(message, { cause: error });
    }

    if (statusCode === 404) {
        return new NotFoundError('resource', context, { cause: error });
    }

    if (statusCode === 429) {
        const retryAfter = parseInt(response?.headers?.['retry-after'] || '1') * 1000;
        return new RateLimitError({ retryAfter, endpoint: context, cause: error });
    }

    if (!response) {
        return new NetworkError(message, { endpoint: context, cause: error });
    }

    return new MccApiError(message, {
        statusCode,
        cause: error,
        context: { operation: context }
    });
}
