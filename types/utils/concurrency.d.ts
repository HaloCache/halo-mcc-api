/**
 * Map values with a fixed worker count while preserving result order.
 *
 * @template T, R
 * @param {T[]} values
 * @param {number} concurrency
 * @param {(value: T, index: number) => Promise<R>} task
 * @returns {Promise<R[]>}
 */
export declare function mapWithConcurrency<T, R>(values: T[], concurrency: number, task: (value: T, index: number) => Promise<R>): Promise<R[]>;
