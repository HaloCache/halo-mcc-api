/**
 * Node.js client for Halo: The Master Chief Collection APIs.
 *
 * @module halo-mcc-api
 */

export { MccClient } from './client.js';
export { HttpClientError, createNodeHttpClient } from './http-client.js';
export {
    BUILD_ID,
    ENDPOINTS,
    RELYING_PARTIES,
    PLAYFAB_TITLE_ID,
    MCC_SCID,
    MCC_XBL_TITLE_ID,
    LEADERBOARD_CONTRACT,
    LEADERBOARD_METRICS,
    buildLeaderboardName
} from './constants.js';

export { CGBService } from './services/cgb.service.js';
export { PlayerService } from './services/player.service.js';
export { FileShareService, CONTENT_TYPES } from './services/fileshare.service.js';
export { WaypointService } from './services/waypoint.service.js';
export { StatsService } from './services/stats.service.js';
export { XboxMediaService, MCC_TITLE_ID } from './services/xbox-media.service.js';
export { CmsService } from './services/cms.service.js';
export { DumpService } from './services/dump.service.js';

export { LeaderboardService, DEFAULT_RETRY } from './services/leaderboard.service.js';
export { SocialService } from './services/social.service.js';
export { PresenceService } from './services/presence.service.js';
export {
    UserStatsService,
    buildUserStatName,
    buildMissionStatName,
    buildPlaylistStatName
} from './services/userstats.service.js';
export { PlayFabExtrasService } from './services/playfab-extras.service.js';
export { ModerationService } from './services/moderation.service.js';

export {
    MccApiError,
    PlayerNotFoundError,
    AuthExpiredError,
    RateLimitError,
    NetworkError,
    NotFoundError,
    PlayFabError,
    createApiError
} from './errors.js';

export {
    ContentType,
    GameEngine,
    GameEngineId,
    GameEngineNames,
    getGameEngineName,
    GameCategories,
    SourcePlatformId,
    getSourcePlatformById,
    ServerRegion,
    ServerRegionNames,
    getServerRegionName
} from './types/enums.js';

export {
    FileShareItem,
    XboxScreenshot,
    XboxGameClip,
    PlayerProfile,
    ServiceRecord
} from './models/index.js';

export {
    XBOX_PROFILE_RATE_LIMIT,
    PLAYFAB_INVENTORY_RATE_LIMIT,
    PLAYFAB_RATE_LIMIT,
    MCC_RATE_LIMIT,
    AZURE_BLOB_RATE_LIMIT,
    GAME_CMS_RATE_LIMIT
} from './utils/index.js';

export { ValidationError } from './validation.js';
