/**
 * Player Service
 *
 * Provides access to Xbox Live profiles and PlayFab player data.
 * @module services/player
 */

import { ENDPOINTS, DEFAULT_HEADERS, RELYING_PARTIES, PLAYFAB_TITLE_ID, XBOX_PROFILE_SETTINGS_ALL } from '../constants.js';
import { validateGamertag, validateXuid, validatePlayFabId, validateXuidArray } from '../validation.js';
import { mapWithConcurrency } from '../utils/concurrency.js';

/** @typedef {import('../types/player.types.js').XboxProfile} XboxProfile */
/** @typedef {import('../types/player.types.js').PlayFabProfile} PlayFabProfile */
/** @typedef {import('../types/player.types.js').PlayFabIdMapping} PlayFabIdMapping */

/**
 * Player Service - Xbox and PlayFab profile operations
 *
 * @class PlayerService
 */
export class PlayerService {
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient instance
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Get XUID from Gamertag.
     *
     * @param {string} gamertag - Xbox Gamertag to look up
     * @returns {Promise<string|null>} XUID if found, null if player doesn't exist
     * @throws {Error} If the API request fails (network, auth issues)
     *
     * @rateLimit 10 requests per 15 seconds (Per Account). Returns 404/null if user not found, but throws on connectivity issues.
     */
    async getXuidFromGamertag(gamertag) {
        validateGamertag(gamertag, 'getXuidFromGamertag');

        try {
            const xsts = await this.client.getXboxToken(RELYING_PARTIES.XBOX_LIVE);

            const response = await this.client.http.get(
                `${ENDPOINTS.XBOX.PROFILE_SETTINGS}/gt(${encodeURIComponent(gamertag)})/profile/settings?settings=Gamertag`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': xsts.tokenString,
                        'x-xbl-client-type': 'Console',
                        'x-xbl-contract-version': '3'
                    }
                }
            );

            if (response.status !== 200) {
                this.client.log.warn(`[PlayerService] getXuidFromGamertag: status ${response.status}`, response.data);
                return null;
            }
            if (!response.data?.profileUsers?.length) {
                this.client.log.warn('[PlayerService] getXuidFromGamertag: empty result', response.data);
                return null;
            }

            return response.data.profileUsers[0].id;
        } catch (error) {
            if (error.response?.status === 404) {
                this.client.log.debug(`[PlayerService] getXuidFromGamertag: not found for ${gamertag}`);
                return null;
            }
            this.client.log.warn(`[PlayerService] getXuidFromGamertag failed for ${gamertag}:`, error.message, error.response?.status, error.response?.data);
            throw error;
        }
    }

    /**
     * Get PlayFab Master ID from XUID.
     *
     * @param {string} xuid - Xbox User ID
     * @returns {Promise<string|null>} PlayFab ID if found, null otherwise
     */
    async getPlayFabIdFromXuid(xuid) {
        validateXuid(xuid, 'getPlayFabIdFromXuid');
        try {
            const pf = await this.client.getPlayFabToken();

            const response = await this.client.http.post(
                ENDPOINTS.PLAYFAB.GET_PLAYFAB_IDS,
                {
                    "Sandbox": "RETAIL",
                    "XboxLiveAccountIDs": [String(xuid)]
                },
                {
                    headers: {
                        ...DEFAULT_HEADERS,
                        'X-Authentication': pf.SessionTicket
                    }
                }
            );

            if (response.status !== 200) {
                this.client.log.warn(`[PlayerService] getPlayFabIdFromXuid: status ${response.status}`, response.data);
                return null;
            }

            const mapping = response.data?.data?.Data?.[0];
            if (!mapping?.PlayFabId) {
                this.client.log.warn(`[PlayerService] getPlayFabIdFromXuid: no PlayFabId for XUID ${xuid}`, response.data);
                return null;
            }
            return mapping.PlayFabId;
        } catch (error) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Get Title Player Account ID from PlayFab Master ID.
     * This ID is used for entity-level operations like profiles.
     *
     * @param {string} playFabMasterId - PlayFab Master Player Account ID
     * @returns {Promise<string|null>} Title Player Account ID
     */
    async getTitlePlayerAccountId(playFabMasterId) {
        validatePlayFabId(playFabMasterId, 'getTitlePlayerAccountId');
        try {
            const pf = await this.client.getPlayFabToken();

            const response = await this.client.http.post(
                ENDPOINTS.PLAYFAB.GET_TITLE_PLAYERS,
                {
                    "TitleId": PLAYFAB_TITLE_ID,
                    "MasterPlayerAccountIds": [playFabMasterId]
                },
                {
                    headers: {
                        ...DEFAULT_HEADERS,
                        'X-EntityToken': pf.EntityToken.EntityToken
                    }
                }
            );

            if (response.status !== 200) {
                this.client.log.warn(`[PlayerService] getTitlePlayerAccountId: status ${response.status}`, response.data);
                return null;
            }

            const titleAccount = response.data?.data?.TitlePlayerAccounts?.[playFabMasterId];
            if (!titleAccount?.Id) {
                this.client.log.warn(`[PlayerService] getTitlePlayerAccountId: no title ID for ${playFabMasterId}`, response.data);
                return null;
            }
            return titleAccount.Id;
        } catch (error) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Get Xbox Live profile by XUID.
     *
     * @param {string} xuid - Xbox User ID
     * @returns {Promise<XboxProfile|null>} Profile data if found
     */
    async getProfile(xuid) {
        validateXuid(xuid, 'getProfile');
        try {
            const xsts = await this.client.getXboxToken(RELYING_PARTIES.XBOX_LIVE);

            const response = await this.client.http.post(
                ENDPOINTS.XBOX.PROFILE_BATCH,
                {
                    "userIds": [String(xuid)],
                    "settings": XBOX_PROFILE_SETTINGS_ALL
                },
                {
                    headers: {
                        'Accept-Language': 'en-US,en',
                        'Content-Type': 'application/json; charset=utf-8',
                        'x-xbl-contract-version': '2',
                        'Authorization': xsts.tokenString
                    }
                }
            );

            return response.data?.profileUsers?.[0] || null;
        } catch (error) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Get multiple Xbox Live profiles by XUIDs.
     *
     * @param {string[]} xuids - Array of Xbox User IDs
     * @returns {Promise<XboxProfile[]>} Array of profile data
     */
    async getProfiles(xuids) {
        validateXuidArray(xuids, 'getProfiles');
        try {
            const xsts = await this.client.getXboxToken(RELYING_PARTIES.XBOX_LIVE);

            const response = await this.client.http.post(
                ENDPOINTS.XBOX.PROFILE_BATCH,
                {
                    "userIds": xuids.map(String),
                    "settings": XBOX_PROFILE_SETTINGS_ALL
                },
                {
                    headers: {
                        'Accept-Language': 'en-US,en',
                        'Content-Type': 'application/json; charset=utf-8',
                        'x-xbl-contract-version': '2',
                        'Authorization': xsts.tokenString
                    }
                }
            );

            return response.data?.profileUsers || [];
        } catch (error) {
            if (error.response?.status === 404) return [];
            throw error;
        }
    }

    /**
     * Get PlayFab player profile.
     *
     * @param {string} titlePlayerAccountId - Title Player Account ID (from getTitlePlayerAccountId)
     * @returns {Promise<PlayFabProfile|null>} PlayFab profile if found
     */
    async getPlayFabProfile(titlePlayerAccountId) {
        try {
            const pf = await this.client.getPlayFabToken();

            const response = await this.client.http.post(
                ENDPOINTS.PLAYFAB.GET_PROFILES,
                {
                    "Entities": [{
                        "Id": titlePlayerAccountId,
                        "Type": "title_player_account"
                    }]
                },
                {
                    headers: {
                        ...DEFAULT_HEADERS,
                        'X-EntityToken': pf.EntityToken.EntityToken
                    }
                }
            );

            return response.data?.data?.Profiles?.[0] || null;
        } catch (error) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Resolve player identifiers and profile data from a gamertag.
     *
     * @param {string} gamertag - Xbox Gamertag
     * @returns {Promise<{xuid: string, playFabId: string, titlePlayerId: string, xboxProfile: XboxProfile}|null>}
     */
    async getPlayerByGamertag(gamertag) {
        validateGamertag(gamertag, 'getPlayerByGamertag');
        const xuid = await this.getXuidFromGamertag(gamertag);
        if (!xuid) return null;

        const [playFabId, xboxProfile] = await Promise.all([
            this.getPlayFabIdFromXuid(xuid),
            this.getProfile(xuid)
        ]);

        let titlePlayerId = null;
        if (playFabId) {
            titlePlayerId = await this.getTitlePlayerAccountId(playFabId);
        }

        return { xuid, playFabId, titlePlayerId, xboxProfile };
    }

    /**
     * Resolve a gamertag to XUID, PlayFab ID, and Title Player ID without fetching
     * the full Xbox profile.
     *
     * @param {string} gamertag - Xbox Gamertag
     * @returns {Promise<{xuid: string, playFabId: string|null, titlePlayerId: string|null}|null>}
     *          Player IDs or null if gamertag not found
     */
    async resolvePlayer(gamertag) {
        validateGamertag(gamertag, 'resolvePlayer');
        const xuid = await this.getXuidFromGamertag(gamertag);
        if (!xuid) return null;

        const playFabId = await this.getPlayFabIdFromXuid(xuid);
        if (!playFabId) {
            return { xuid, playFabId: null, titlePlayerId: null };
        }

        const titlePlayerId = await this.getTitlePlayerAccountId(playFabId);
        return { xuid, playFabId, titlePlayerId };
    }

    /**
     * Batch resolve multiple gamertags to XUIDs.
     *
     * @param {string[]} gamertags - Array of gamertags
     * @param {Object} [options]
     * @param {number} [options.concurrency=5] - Maximum simultaneous Xbox lookups
     * @returns {Promise<Map<string, string>>} Map of gamertag -> XUID
     */
    async resolveGamertags(gamertags, options = {}) {
        if (!Array.isArray(gamertags)) throw new TypeError('gamertags must be an array');
        const results = new Map();

        await mapWithConcurrency(gamertags, options.concurrency ?? 5, async (gamertag) => {
            const xuid = await this.getXuidFromGamertag(gamertag);
            if (xuid) {
                results.set(gamertag, xuid);
            }
        });
        return results;
    }
}
