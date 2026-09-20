/**
 * Stats Service
 *
 * Provides access to player progression, unlocks, and store data.
 * @module services/stats
 */
/**
 * Stats Service - Player progression and store operations
 *
 * @class StatsService
 */
export declare class StatsService {
    client: import("../client.js").MccClient;
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient instance
     */
    constructor(client: import('../client.js').MccClient);
    /**
     * Get player's unlocked items inventory.
     *
     * @returns {Promise<Object>} Inventory data including virtual currency and items
     */
    getUnlocks(): Promise<Object>;
    /**
     * Get the full catalog of unlockable items.
     *
     * @param {string} [catalogVersion='SeasonCatalog'] - Catalog version to query
     * @returns {Promise<Object[]>} Array of catalog items
     */
    getCatalog(catalogVersion?: string): Promise<Object[]>;
    /**
     * Get store items for a specific season/store.
     *
     * @param {string} storeId - Store ID (e.g., "Season1", "Season8", "FreemiumStore")
     * @param {string} [catalogVersion='SeasonCatalog'] - Catalog version
     * @returns {Promise<Object>} Store data including items and prices
     */
    getStore(storeId: string, catalogVersion?: string): Promise<Object>;
    /**
     * Get available store IDs.
     *
     * @returns {Promise<string[]>} Array of store IDs
     */
    getAvailableStores(): Promise<string[]>;
}
