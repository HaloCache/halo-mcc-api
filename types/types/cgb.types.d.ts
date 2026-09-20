/**
 * CGB (Custom Game Browser) Type Definitions
 *
 * @module types/cgb
 */
export type CGBListResponse = {
    /**
     * - Wrapper object containing game data
     */
    data: CGBData;
};
export type CGBData = {
    /**
     * - Total number of games in this response page
     */
    GameCount: number;
    /**
     * - Array of active game sessions
     */
    Games: CGBGame[];
    /**
     * - Token for pagination (empty if no more pages)
     */
    ContinuationToken: string;
    /**
     * - Internal Azure CosmosDB activity tracking ID
     */
    CosmosActivityId: string;
};
export type CGBGame = {
    /**
     * - Base64-encoded deflate-compressed JSON containing detailed game info
     */
    GameServerData: string;
    /**
     * - Additional server data
     */
    ExtendedGameServerData: string;
    /**
     * - Unique lobby identifier (UUID format)
     */
    LobbyId: string;
    /**
     * - Game build version (format: YYYY.MM.DD.BuildNumber.Patch-Release)
     */
    BuildId: string;
    /**
     * - Network session identifier (numeric string, up to 19 digits)
     */
    NetworkSessionId: string;
    /**
     * - Server hostname identifier (numeric string, up to 20 digits)
     */
    ServerHostname: string;
    /**
     * - Environment type (always "RETAIL" for production)
     */
    Sandbox: string;
    /**
     * - Normalized lobby identifier
     */
    id: string;
};
export type DecodedGameServerData = {
    /**
     * - XUID of the session host
     */
    session_creator: string;
    /**
     * - Array of players in the session
     */
    players: DecodedPlayer[];
    /**
     * - Array of banned players
     */
    banned: DecodedPlayer[];
    /**
     * - Internal map identifier
     */
    map_id: number;
    /**
     * - Game type enum value
     */
    game_type: number;
    /**
     * - Game mode string (e.g., "_game_mode_multiplayer")
     */
    game_mode: string;
    /**
     * - Campaign difficulty (e.g., "_campaign_difficulty_level_normal")
     */
    difficulty_level: string;
    /**
     * - Display name of the session
     */
    session_name: string;
    /**
     * - Session description
     */
    session_description: string;
    /**
     * - Maximum allowed players
     */
    max_players: number;
    /**
     * - Minimum required players
     */
    min_players: number;
    /**
     * - Server region enum value
     */
    server_region: number;
    /**
     * - Whether the playlist loops
     */
    endless_loop: boolean;
    /**
     * - Playlist configuration
     */
    playlistVariants: PlaylistVariants;
    /**
     * - Current match ID
     */
    match_id: number;
    /**
     * - Internal PlayFab build ID (UUID)
     */
    playfab_build_id: string;
    /**
     * - PlayFab region (e.g., "SouthCentralUs")
     */
    playfab_region_id: string;
    /**
     * - PlayFab session ID (UUID)
     */
    playfab_session_id: string;
    /**
     * - Unix timestamp of server start
     */
    server_start_time: number;
    /**
     * - Unix timestamp of session start
     */
    session_start_time: number;
    /**
     * - Time limit in seconds (-1 for unlimited)
     */
    session_time_limit: number;
    /**
     * - Team change policy enum
     */
    team_changing_policy: number;
};
export type DecodedPlayer = {
    /**
     * - Xbox User ID
     */
    xuid: string;
};
export type PlaylistVariants = {
    /**
     * - Game variant definitions
     */
    gameVariants: GameVariant[];
    /**
     * - Map variant definitions
     */
    mapVariants: MapVariant[];
    /**
     * - Playlist definitions
     */
    playlists: Playlist[];
};
export type GameVariant = {
    /**
     * - Display name of the game variant
     */
    name: string;
    /**
     * - Description text
     */
    description: string;
    /**
     * - Game category enum
     */
    gameCategoryId: number;
    /**
     * - Whether teams are enabled
     */
    areTeamsEnabled: boolean;
};
export type MapVariant = {
    /**
     * - Display name of the map variant
     */
    name: string;
    /**
     * - Description text
     */
    description: string;
    /**
     * - Internal map ID reference
     */
    builtinMapId: number;
    /**
     * - Insertion point for campaign
     */
    insertionPoint: number;
};
export type Playlist = {
    /**
     * - Playlist name
     */
    name: string;
    /**
     * - Tag identifier
     */
    tagId: number;
    /**
     * - Reference to gameVariants array
     */
    gameVariantId: number;
    /**
     * - References to mapVariants array
     */
    mapVariantIds: number[];
};
/**
 * @typedef {Object} CGBListResponse
 * @property {CGBData} data - Wrapper object containing game data
 */
/**
 * @typedef {Object} CGBData
 * @property {number} GameCount - Total number of games in this response page
 * @property {CGBGame[]} Games - Array of active game sessions
 * @property {string} ContinuationToken - Token for pagination (empty if no more pages)
 * @property {string} CosmosActivityId - Internal Azure CosmosDB activity tracking ID
 */
/**
 * @typedef {Object} CGBGame
 * @property {string} GameServerData - Base64-encoded deflate-compressed JSON containing detailed game info
 * @property {string} ExtendedGameServerData - Additional server data
 * @property {string} LobbyId - Unique lobby identifier (UUID format)
 * @property {string} BuildId - Game build version (format: YYYY.MM.DD.BuildNumber.Patch-Release)
 * @property {string} NetworkSessionId - Network session identifier (numeric string, up to 19 digits)
 * @property {string} ServerHostname - Server hostname identifier (numeric string, up to 20 digits)
 * @property {string} Sandbox - Environment type (always "RETAIL" for production)
 * @property {string} id - Normalized lobby identifier
 */
/**
 * Decoded GameServerData structure (after base64 + deflate decompression).
 *
 * @typedef {Object} DecodedGameServerData
 * @property {string} session_creator - XUID of the session host
 * @property {DecodedPlayer[]} players - Array of players in the session
 * @property {DecodedPlayer[]} banned - Array of banned players
 * @property {number} map_id - Internal map identifier
 * @property {number} game_type - Game type enum value
 * @property {string} game_mode - Game mode string (e.g., "_game_mode_multiplayer")
 * @property {string} difficulty_level - Campaign difficulty (e.g., "_campaign_difficulty_level_normal")
 * @property {string} session_name - Display name of the session
 * @property {string} session_description - Session description
 * @property {number} max_players - Maximum allowed players
 * @property {number} min_players - Minimum required players
 * @property {number} server_region - Server region enum value
 * @property {boolean} endless_loop - Whether the playlist loops
 * @property {PlaylistVariants} playlistVariants - Playlist configuration
 * @property {number} match_id - Current match ID
 * @property {string} playfab_build_id - Internal PlayFab build ID (UUID)
 * @property {string} playfab_region_id - PlayFab region (e.g., "SouthCentralUs")
 * @property {string} playfab_session_id - PlayFab session ID (UUID)
 * @property {number} server_start_time - Unix timestamp of server start
 * @property {number} session_start_time - Unix timestamp of session start
 * @property {number} session_time_limit - Time limit in seconds (-1 for unlimited)
 * @property {number} team_changing_policy - Team change policy enum
 */
/**
 * @typedef {Object} DecodedPlayer
 * @property {string} xuid - Xbox User ID
 */
/**
 * @typedef {Object} PlaylistVariants
 * @property {GameVariant[]} gameVariants - Game variant definitions
 * @property {MapVariant[]} mapVariants - Map variant definitions
 * @property {Playlist[]} playlists - Playlist definitions
 */
/**
 * @typedef {Object} GameVariant
 * @property {string} name - Display name of the game variant
 * @property {string} description - Description text
 * @property {number} gameCategoryId - Game category enum
 * @property {boolean} areTeamsEnabled - Whether teams are enabled
 */
/**
 * @typedef {Object} MapVariant
 * @property {string} name - Display name of the map variant
 * @property {string} description - Description text
 * @property {number} builtinMapId - Internal map ID reference
 * @property {number} insertionPoint - Insertion point for campaign
 */
/**
 * @typedef {Object} Playlist
 * @property {string} name - Playlist name
 * @property {number} tagId - Tag identifier
 * @property {number} gameVariantId - Reference to gameVariants array
 * @property {number[]} mapVariantIds - References to mapVariants array
 */
declare const _default: {};
export default _default;
