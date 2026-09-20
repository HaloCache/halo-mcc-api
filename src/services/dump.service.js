/**
 * Aggregate player data from API services into a JSON dump.
 *
 * @module services/dump
 */

import { PlayerService } from './player.service.js';
import { StatsService } from './stats.service.js';
import { CmsService } from './cms.service.js';
import { FileShareService } from './fileshare.service.js';
import { WaypointService } from './waypoint.service.js';
import { XboxMediaService } from './xbox-media.service.js';
import { CGBService } from './cgb.service.js';
import { RELYING_PARTIES } from '../constants.js';

export class DumpService {
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient
     */
    constructor(client) {
        this.client = client;

        this.player = new PlayerService(client);
        this.stats = new StatsService(client);
        this.cms = new CmsService(client);
        this.fileshare = new FileShareService(client);
        this.waypoint = new WaypointService(client);
        this.media = new XboxMediaService(client);
        this.cgb = new CGBService(client);
    }

    /**
     * Dump player data.
     *
     * Inventory and challenges are included only for the authenticated account.
     *
     * @param {string} gamertag
     * @returns {Promise<Object>}
     */
    async dumpPlayer(gamertag) {
        const playerIds = await this.player.getPlayerByGamertag(gamertag);
        if (!playerIds) {
            return { error: `Player ${gamertag} not found` };
        }

        const { xuid, titlePlayerId } = playerIds;

        const selfXsts = await this.client.getXboxToken(RELYING_PARTIES.XBOX_LIVE).catch(() => null);
        const isSelf = Boolean(selfXsts?.userXUID) && String(selfXsts.userXUID) === String(xuid);

        const [profile, fileshare, media, ownInventory, ownChallenges] = await Promise.all([
            this.player.getPlayFabProfile(titlePlayerId).catch(e => ({ error: e.message })),
            this.fileshare.getItemsByGamertag(gamertag).catch(e => ({ error: e.message })),
            this.media.getPlayerMedia(xuid, { mccOnly: true }).catch(e => ({ error: e.message })),
            isSelf ? this.stats.getUnlocks().catch(e => ({ error: e.message })) : Promise.resolve(undefined),
            isSelf ? this.waypoint.getChallenges().catch(e => ({ error: e.message })) : Promise.resolve(undefined),
        ]);

        const result = {
            identity: playerIds,
            isAuthenticatedUser: isSelf,
            profile,
            fileshare,
            media,
        };

        if (isSelf) {
            result.ownInventory = ownInventory;
            result.ownChallenges = ownChallenges;
        }

        return result;
    }

    /**
     * Dump system/game data.
     * @returns {Promise<Object>}
     */
    async dumpSystem() {
        const [
            motd,
            seasons,
            catalog,
            serverList
        ] = await Promise.all([
            this.waypoint.getMOTD().catch(e => ({ error: e.message })),
            this.waypoint.getSeasons().catch(e => ({ error: e.message })),
            this.stats.getCatalog().catch(e => ({ error: e.message })),
            this.cgb.getServersWithDetails().catch(e => ({ error: e.message }))
        ]);

        return {
            motd,
            seasons,
            catalog,
            serverList
        };
    }

    /**
     * Dump everything for a player + system data.
     */
    async dumpAll(gamertag) {
        const [player, system] = await Promise.all([
            this.dumpPlayer(gamertag),
            this.dumpSystem()
        ]);

        return {
            timestamp: new Date().toISOString(),
            player,
            system
        };
    }
}
