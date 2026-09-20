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
export declare class DumpService {
    client: import("../client.js").MccClient;
    player: PlayerService;
    stats: StatsService;
    cms: CmsService;
    fileshare: FileShareService;
    waypoint: WaypointService;
    media: XboxMediaService;
    cgb: CGBService;
    /**
     * @param {import('../client.js').MccClient} client - Authenticated MccClient
     */
    constructor(client: import('../client.js').MccClient);
    /**
     * Dump player data.
     *
     * Inventory and challenges are included only for the authenticated account.
     *
     * @param {string} gamertag
     * @returns {Promise<Object>}
     */
    dumpPlayer(gamertag: string): Promise<Object>;
    /**
     * Dump system/game data.
     * @returns {Promise<Object>}
     */
    dumpSystem(): Promise<Object>;
    /**
     * Dump everything for a player + system data.
     */
    dumpAll(gamertag: any): Promise<{
        timestamp: string;
        player: Object;
        system: Object;
    }>;
}
