import { Readable } from 'node:stream';

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Fetch-backed transport that normalizes the package's response and error
 * contract while Node owns connection pooling, decompression, redirects, and
 * TLS verification.
 */
export class HttpClientError extends Error {
    constructor(message, { code = null, cause = null, config = null, response = null } = {}) {
        super(message, cause ? { cause } : undefined);
        this.name = 'HttpClientError';
        this.code = code;
        this.config = config;
        if (response) this.response = response;
    }
}

function appendParams(url, params) {
    if (!params || typeof params !== 'object') return url;
    const parsed = new URL(url);
    for (const [key, rawValue] of Object.entries(params)) {
        if (rawValue === null || rawValue === undefined) continue;
        const values = Array.isArray(rawValue) ? rawValue : [rawValue];
        const parameterName = Array.isArray(rawValue) ? `${key}[]` : key;
        for (const value of values) {
            if (value === null || value === undefined) continue;
            parsed.searchParams.append(parameterName, value instanceof Date ? value.toISOString() : String(value));
        }
    }
    return parsed.toString();
}

function plainHeaders(headers) {
    return Object.fromEntries(headers.entries());
}

function isNativeBody(value) {
    return typeof value === 'string'
        || value instanceof ArrayBuffer
        || ArrayBuffer.isView(value)
        || value instanceof URLSearchParams
        || (typeof FormData !== 'undefined' && value instanceof FormData)
        || (typeof Blob !== 'undefined' && value instanceof Blob)
        || (typeof ReadableStream !== 'undefined' && value instanceof ReadableStream)
        || value instanceof Readable;
}

function prepareBody(data, headers) {
    if (data === undefined || data === null) return undefined;
    if (isNativeBody(data)) return data;
    if (!headers.has('content-type')) headers.set('content-type', 'application/json');
    return JSON.stringify(data);
}

async function readResponseData(response, responseType) {
    if (responseType === 'stream') {
        return response.body ? Readable.fromWeb(response.body) : Readable.from([]);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (responseType === 'arraybuffer') return bytes;
    if (bytes.length === 0) return '';

    const text = bytes.toString('utf8');
    if (responseType === 'text') return text;
    if (responseType === 'json') return JSON.parse(text);

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function transportCode(error, timedOut, externallyAborted) {
    if (timedOut) return 'ECONNABORTED';
    if (externallyAborted) return 'ERR_CANCELED';
    return error?.code || error?.cause?.code || 'NETWORK_ERROR';
}

export function createNodeHttpClient({ fetchImpl = globalThis.fetch, timeout = DEFAULT_TIMEOUT_MS } = {}) {
    if (typeof fetchImpl !== 'function') throw new TypeError('A fetch implementation is required');
    if (!Number.isFinite(timeout) || timeout <= 0) throw new TypeError('timeout must be a positive number');

    const request = async (config = {}) => {
        const method = String(config.method || 'GET').toUpperCase();
        const requestTimeout = config.timeout ?? timeout;
        if (!Number.isFinite(requestTimeout) || requestTimeout <= 0) {
            throw new TypeError('request timeout must be a positive number');
        }

        const url = appendParams(config.url, config.params);
        const headers = new Headers(config.headers || {});
        const body = method === 'GET' || method === 'HEAD'
            ? undefined
            : prepareBody(config.data, headers);
        const timeoutSignal = AbortSignal.timeout(requestTimeout);
        const signal = config.signal
            ? AbortSignal.any([config.signal, timeoutSignal])
            : timeoutSignal;
        const normalizedConfig = { ...config, method, url, headers: Object.fromEntries(headers.entries()) };

        let raw;
        try {
            raw = await fetchImpl(url, {
                method,
                headers,
                body,
                signal,
                redirect: config.redirect || 'follow',
                ...(body instanceof Readable ? { duplex: 'half' } : {})
            });
        } catch (error) {
            const timedOut = timeoutSignal.aborted && !config.signal?.aborted;
            throw new HttpClientError(
                timedOut ? `timeout of ${requestTimeout}ms exceeded` : error.message,
                {
                    code: transportCode(error, timedOut, config.signal?.aborted),
                    cause: error,
                    config: normalizedConfig
                }
            );
        }

        const response = {
            data: await readResponseData(raw, config.responseType),
            status: raw.status,
            statusText: raw.statusText,
            headers: plainHeaders(raw.headers),
            config: normalizedConfig,
            request: null
        };
        const validateStatus = config.validateStatus || (status => status >= 200 && status < 300);
        if (!validateStatus(response.status)) {
            throw new HttpClientError(`Request failed with status code ${response.status}`, {
                code: response.status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST',
                config: normalizedConfig,
                response
            });
        }
        return response;
    };

    request.get = (url, config = {}) => request({ ...config, method: 'GET', url });
    request.post = (url, data, config = {}) => request({ ...config, method: 'POST', url, data });
    request.defaults = Object.freeze({ timeout });
    return request;
}
