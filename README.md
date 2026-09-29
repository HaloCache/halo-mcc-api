# @halocache/halo-mcc-api

A Node.js client for Halo: The Master Chief Collection APIs.

## Features

- **CGB Service** - Custom Game Browser server list
- **Player Service** - Xbox profiles, XUIDs, PlayFab IDs
- **FileShare Service** - UGC items (MapVariant, GameVariant)
- **Xbox Media Service** - Screenshots and Game Clips from Xbox Game DVR
- **Waypoint Service** - Spartan tokens, challenges, MOTD
- **Stats Service** - Unlocks, inventory, store items
- **Models** - Clean wrapper classes with property getters

## Quick Start

```javascript
import { XboxAuth } from '@halocache/halo-mcc-api';
import { MccClient, CGBService, PlayerService, FileShareItem } from '@halocache/halo-mcc-api';

// 1. Authenticate
const auth = new XboxAuth({ sessionName: 'user', cacheDir: './cache' });
await auth.ensureAuthenticated();

// 2. Create client and services
const client = new MccClient(auth);
const cgb = new CGBService(client);
const player = new PlayerService(client);

// 3. Use APIs
const servers = await cgb.getServerList({ maxResults: 100 });
console.log(`Found ${servers.GameCount} games`);

const profile = await player.getPlayerByGamertag('ExamplePlayer');
console.log(`XUID: ${profile.xuid}`);
```

## Services

### CGBService

```javascript
const cgb = new CGBService(client);

cgb.getBuildId()                           // Current build ID
cgb.getServerList({ maxResults: 2000 })    // Fetch server list
cgb.getAllServers()                        // Fetch all pages
cgb.getServerById(lobbyId)                 // Find specific server
cgb.decodeGameServerData(base64)           // Decode compressed game data
cgb.getServersWithDetails()                // Servers with decoded data
```

### PlayerService

```javascript
const player = new PlayerService(client);

player.getXuidFromGamertag(gamertag)       // Lookup XUID
player.getPlayFabIdFromXuid(xuid)          // Get PlayFab ID
player.getTitlePlayerAccountId(masterId)   // Get entity ID
player.getProfile(xuid)                    // Xbox profile
player.getProfiles(xuids[])                // Batch profiles
player.getPlayerByGamertag(gamertag)       // Complete player info
```

### FileShareService

```javascript
const fileshare = new FileShareService(client);

fileshare.getPlayerItems(entityId)         // Player's UGC items
fileshare.getOwnItems()                    // Own items
fileshare.getPlayerMaps(entityId)          // MapVariants only
fileshare.getPlayerGameVariants(entityId)  // GameVariants only
fileshare.getItemDetails(itemId)           // Item download URL
fileshare.downloadItem(itemId, path)       // Download file
```

Player-list responses require HTTP 200, an explicit `Items` array, a matching
nonnegative integer `Count`, valid item identifiers/types, and no reported
continuation. Missing or partial data throws `MCC_FILESHARE_UNVERIFIED`; it is not
converted into an empty fileshare. Resolved XUID/gamertag results include
`completeness: 'complete'` and `count`. An unresolved player still returns `null`,
which must not authorize deletion of previously observed ownership.

### XboxMediaService

Screenshots and Game Clips from Xbox Game DVR (separate from PlayFab UGC).

```javascript
const media = new XboxMediaService(client);

// Screenshots
media.getPlayerScreenshots(xuid)           // All player screenshots
media.getPlayerMccScreenshots(xuid)        // MCC screenshots only
media.getOwnScreenshots()                  // Own screenshots

// Game Clips
media.getPlayerGameClips(xuid)             // All player clips
media.getPlayerMccGameClips(xuid)          // MCC clips only
media.getOwnGameClips()                    // Own clips

// Combined
media.getPlayerMedia(xuid, { mccOnly: true })  // All media

// URLs (thumbnails are public, full content expires)
media.getThumbnailUrl(item)                // Public thumbnail
media.getScreenshotUrl(screenshot)         // Signed URL (expires)
media.getGameClipUrl(clip)                 // Signed URL (expires)
```

### WaypointService

```javascript
const waypoint = new WaypointService(client);

waypoint.getSpartanToken()                 // Auth token
waypoint.getClearance()                    // Flight config ID
waypoint.getChallenges()                   // Player challenges
waypoint.getMOTD()                         // Message of the day
waypoint.getSeasons()                      // Season info
```

### StatsService

```javascript
const stats = new StatsService(client);

stats.getUnlocks()                         // Unlocked items
stats.getCatalog()                         // Item catalog
stats.getStore(storeId)                    // Store items
stats.getAvailableStores()                 // Store IDs
```

## API Rate Limits (Verified)

Empirical limits discovered through stress testing (Dec 2025). These limits are enforced by the upstream APIs (Xbox Live / PlayFab).

| Service | Operation | Limit | Scope | Recovery |
| :--- | :--- | :--- | :--- | :--- |
| **PlayerService** | `getXuidFromGamertag` | **10 req / 15s** | Per Account | Auto-reset (15s) |
| **FileShareService** | `getPlayerItems` (Scan) | **Unlimited** (>1.5k/min) | N/A | N/A |
| **FileShareService** | `getItemDetails` (Metadata) | **100 req / minute** | Per Account | 60s wait |
| **FileShareService** | `downloadItem` (Binary) | **100 req / minute** | Per Account | 60s wait |

> **Note:** `getItemDetails` and `downloadItem` share the same 100 req/min budget per account. When this budget is exhausted, the API returns a 200 OK with an error body containing `HttpStatus: 'TooManyRequests'`, and further requests will effectively be blocked for ~60 seconds.

## Models

Wrapper classes with clean property getters for API data.

### FileShareItem

```javascript
import { FileShareItem } from '@halocache/halo-mcc-api';

const rawItems = await fileshare.getPlayerItems(entityId);
// getPlayerItems() returns { data, metadata } and already wraps items:
const items = rawItems.data.Items;

for (const item of items) {
    console.log(item.title);               // Item title
    console.log(item.description);         // Description
    console.log(item.isMapVariant);        // true/false
    console.log(item.gameEngine);          // 'Halo3', 'HaloReach', etc.
    console.log(item.gameCategory);        // 'Infection', 'Slayer', etc.
    console.log(item.fileSizeFormatted);   // '58.5 KB'
    console.log(item.authorXuid);          // Original creator XUID
    console.log(item.allXuids);            // All associated XUIDs
    console.log(item.isLegacyUgc);         // Migrated from Xbox 360?
}
```

### XboxScreenshot / XboxGameClip

```javascript
import { XboxScreenshot, XboxGameClip } from '@halocache/halo-mcc-api';

const screenshots = XboxScreenshot.fromArray(rawData.screenshots);
for (const ss of screenshots) {
    console.log(ss.resolution);            // '1920x1080'
    console.log(ss.isMcc);                 // true if from MCC
    console.log(ss.thumbnail);             // Public thumbnail URL
    console.log(ss.url);                   // Signed full image URL
    console.log(ss.isUrlValid);            // Check if URL expired
}

const clips = XboxGameClip.fromArray(rawData.gameClips);
for (const clip of clips) {
    console.log(clip.durationFormatted);   // '0:29'
    console.log(clip.isMcc);               // true if from MCC
    console.log(clip.thumbnail);           // Public thumbnail URL
    console.log(clip.url);                 // Signed video URL
    console.log(clip.views);               // View count
    console.log(clip.likeCount);           // Like count
}
```

## HTTP transport

`MccClient` uses the Node runtime's native `fetch` implementation. The client
applies a 30-second request timeout and preserves the response surface consumed
by the service classes (`data`, `status`, and normalized headers). HTTP errors
retain `error.response.status`, `error.response.headers`, and parsed response
data so scanner retry and rate-limit classification remains stable.

Rate limiting is coordinated by the calling application. `MccClient` reports
an observed Xbox 429 through `onTelemetry`, including the real `Retry-After`
value when supplied; it does not invent quota totals or automatically replay a
request that may not be safe to repeat.

## File Structure

```
src/
├── index.js           # Main exports
├── client.js          # Base MccClient
├── http-client.js     # Native-fetch transport boundary
├── constants.js       # URLs, Build ID
├── services/
│   ├── cgb.service.js
│   ├── player.service.js
│   ├── fileshare.service.js
│   ├── xbox-media.service.js
│   ├── waypoint.service.js
│   └── stats.service.js
├── models/
│   ├── fileshare.model.js
│   └── xbox-media.model.js
├── utils/
│   ├── index.js
│   └── rate-limiter.js
└── types/
    ├── common.types.js
    ├── cgb.types.js
    ├── player.types.js
    ├── fileshare.types.js
    ├── waypoint.types.js
    └── xbox-media.types.js
```

## Build ID Maintenance

The `BUILD_ID` constant in `src/constants.js` must match the game's current version.
Format: `YYYY.MM.DD.BuildNumber.Patch-Release`

Current: `2025.08.16.178512.1-Release`

## Documentation

See `docs/API_CONTRACTS.md` for detailed API schemas.

## Testing

```bash
npm test
```

## License

MIT
