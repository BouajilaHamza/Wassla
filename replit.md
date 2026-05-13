# Helfer

A community-powered MVP for passive bus detection in Djerba, Tunisia — validates the hypothesis: "Can we infer moving buses from passive crowd GPS data?"

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (in-memory store — no DB for MVP)
- Mobile: Expo / React Native (expo-location, react-native-maps@1.18.0)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/api-server/src/lib/store.ts` — in-memory data store
- `artifacts/api-server/src/services/clustering.ts` — cluster detection algorithm
- `artifacts/mobile/context/AuthContext.tsx` — phone-based auth state
- `artifacts/mobile/context/TrackingContext.tsx` — GPS tracking + ping queue
- `artifacts/mobile/components/HelferMap.native.tsx` — native map (react-native-maps)
- `artifacts/mobile/components/HelferMap.tsx` — web fallback (cluster list)

## Architecture decisions

- **In-memory store** for MVP: No database dependency, zero setup. Resets on restart — intentional for a validation prototype.
- **Platform-specific map component**: `HelferMap.native.tsx` uses react-native-maps; `HelferMap.tsx` is the web fallback (cluster card list). Avoids web bundling errors with react-native-maps.
- **Adaptive GPS polling** in `TrackingContext`: fast (5s) when moving > 5 km/h, medium (10s) walking, slow (60s) stationary. Saves battery.
- **Offline queue** in `TrackingContext`: failed pings stored in AsyncStorage and flushed on reconnect.
- **Simple DBSCAN-like clustering**: Groups users within 40m radius moving > 5 km/h together. 3+ users = bus cluster. Runs every 10s server-side.

## Product

- **Auth**: Phone entry → local hash → anonymous userId stored in AsyncStorage. No OTP for MVP.
- **Map**: Live bus cluster overlay (native) or cluster card list (web). Toggle GPS sharing.
- **Confirmation popup**: Appears when you're detected inside a cluster. "Are you on a bus?" — labels data for future ML.
- **Rewards**: Points for tracking (1/min) and confirmed bus rides (+10). Leaderboard rank.
- **Admin debug**: Tap version string 5x in Profile to unlock the live stats panel.

## User preferences

- Flutter was the original spec, but Expo/React Native was selected as the artifact type — this implementation uses that.
- Keep everything simple and lightweight — free Replit credits.
- No AI models, no Kafka, no Redis, no microservices.

## Gotchas

- react-native-maps must stay pinned to 1.18.0 for Expo Go compatibility. Do NOT add it to app.json plugins array.
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml` before using new hooks.
- The clustering loop runs server-side every 10s. It only detects clusters when 3+ users are moving together within 40m.
- expo-location has no web support — the TrackingContext uses `navigator.geolocation` on web automatically.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
