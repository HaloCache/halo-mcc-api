/**
 * Fetch-backed transport that normalizes the package's response and error
 * contract while Node owns connection pooling, decompression, redirects, and
 * TLS verification.
 */
export declare class HttpClientError extends Error {
    code: any;
    config: any;
    response: any;
    constructor(message: any, { code, cause, config, response }?: {
        cause?: null | undefined;
        code?: null | undefined;
        config?: null | undefined;
        response?: null | undefined;
    });
}
export declare function createNodeHttpClient({ fetchImpl, timeout }?: {
    fetchImpl?: typeof fetch | undefined;
    timeout?: number | undefined;
}): {
    (config?: {}): Promise<{
        data: any;
        status: number;
        statusText: string;
        headers: {
            [k: string]: any;
        };
        config: {
            method: string;
            url: any;
            headers: {
                [k: string]: string;
            };
        };
        request: null;
    }>;
    get: (url: any, config?: {}) => Promise<{
        data: any;
        status: number;
        statusText: string;
        headers: {
            [k: string]: any;
        };
        config: {
            method: string;
            url: any;
            headers: {
                [k: string]: string;
            };
        };
        request: null;
    }>;
    post: (url: any, data: any, config?: {}) => Promise<{
        data: any;
        status: number;
        statusText: string;
        headers: {
            [k: string]: any;
        };
        config: {
            method: string;
            url: any;
            headers: {
                [k: string]: string;
            };
        };
        request: null;
    }>;
    defaults: Readonly<{
        timeout: number;
    }>;
};
