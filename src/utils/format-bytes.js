/**
 * Format a byte count in bytes, kilobytes, or megabytes.
 *
 * @param {number} bytes
 * @returns {string} e.g. "512 B", "12.3 KB", "1.5 MB"
 */
export function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
