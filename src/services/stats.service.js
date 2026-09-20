/**
 * Stats Service
 *
 * Provides access to player progression, unlocks, and store data.
 * @module services/stats
 */

import { ENDPOINTS, DEFAULT_HEADERS } from '../constants.js';

/**
 * Stats Service - Player progression and store operations
 *
 * @class StatsService
 */
export class StatsService {
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient instance
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Get player's unlocked items inventory.
     *
     * @returns {Promise<Object>} Inventory data including virtual currency and items
     */
    async getUnlocks() {
        const pf = await this.client.getPlayFabToken();

        const response = await this.client.http.post(
            ENDPOINTS.PLAYFAB.GET_USER_INVENTORY,
            {},
            {
                headers: {
                    ...DEFAULT_HEADERS,
                    'X-Authentication': pf.SessionTicket
                }
            }
        );

        return response.data?.data || {};
    }

    /**
     * Get the full catalog of unlockable items.
     *
     * @param {string} [catalogVersion='SeasonCatalog'] - Catalog version to query
     * @returns {Promise<Object[]>} Array of catalog items
     */
    async getCatalog(catalogVersion = 'SeasonCatalog') {
        const pf = await this.client.getPlayFabToken();

        const response = await this.client.http.post(
            ENDPOINTS.PLAYFAB.GET_CATALOG_ITEMS,
            { "CatalogVersion": catalogVersion },
            {
                headers: {
                    ...DEFAULT_HEADERS,
                    'X-Authentication': pf.SessionTicket
                }
            }
        );

        return response.data?.data?.Catalog || [];
    }

    /**
     * Get store items for a specific season/store.
     *
     * @param {string} storeId - Store ID (e.g., "Season1", "Season8", "FreemiumStore")
     * @param {string} [catalogVersion='SeasonCatalog'] - Catalog version
     * @returns {Promise<Object>} Store data including items and prices
     */
    async getStore(storeId, catalogVersion = 'SeasonCatalog') {
        const pf = await this.client.getPlayFabToken();

        const response = await this.client.http.post(
            ENDPOINTS.PLAYFAB.GET_STORE_ITEMS,
            {
                "StoreId": storeId,
                "CatalogVersion": catalogVersion
            },
            {
                headers: {
                    ...DEFAULT_HEADERS,
                    'X-Authentication': pf.SessionTicket
                }
            }
        );

        return response.data?.data || {};
    }

    /**
     * Get available store IDs.
     *
     * @returns {Promise<string[]>} Array of store IDs
     */
    async getAvailableStores() {
        const pf = await this.client.getPlayFabToken();

        const response = await this.client.http.post(
            'https://mcc-production.azurefd.net/api/ProgressionGetUnlockableContainers',
            {},
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'text/plain; charset=utf-8',
                    'x-auth-token': pf.SessionTicket
                }
            }
        );

        return response.data?.PlayFabStoreIds || [];
    }
}
