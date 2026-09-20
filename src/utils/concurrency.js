/**
 * Map values with a fixed worker count while preserving result order.
 *
 * @template T, R
 * @param {T[]} values
 * @param {number} concurrency
 * @param {(value: T, index: number) => Promise<R>} task
 * @returns {Promise<R[]>}
 */
export async function mapWithConcurrency(values, concurrency, task) {
    if (!Array.isArray(values)) throw new TypeError('values must be an array');
    if (!Number.isInteger(concurrency) || concurrency < 1) {
        throw new RangeError('concurrency must be a positive integer');
    }
    if (typeof task !== 'function') throw new TypeError('task must be a function');
    if (values.length === 0) return [];

    const results = new Array(values.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < values.length) {
            const index = nextIndex++;
            results[index] = await task(values[index], index);
        }
    }

    const workerCount = Math.min(concurrency, values.length);
    await Promise.all(Array.from({ length: workerCount }, worker));
    return results;
}
