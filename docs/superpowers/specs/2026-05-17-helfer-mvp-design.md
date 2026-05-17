# Helfer MVP Design Specification

## Goal
Build a minimal MVP for community-powered bus detection in Djerba, Tunisia. The primary hypothesis to validate is: "Can we infer moving buses from passive crowd GPS data?"

## Architecture: Minimalist Layered
We are using a simple, clean architecture that minimizes boilerplate to allow for rapid "vibe coding" and iteration.

### Backend (FastAPI)
- **Framework:** FastAPI
- **Database:** SQLite (local file)
- **Structure:**
  - `app/api/`: Request handlers (endpoints)
  - `app/services/`: Business logic (Clustering, Points)
  - `app/models/`: SQLAlchemy database models
  - `app/schemas/`: Pydantic models for request/response validation
  - `app/core/`: Configuration and settings

### Frontend (Flutter)
- **Framework:** Flutter
- **State Management:** Provider
- **Structure:**
  - `lib/screens/`: UI pages (Map, Rewards, Profile)
  - `lib/providers/`: State management (Location, Auth, Cluster)
  - `lib/services/`: External integrations (ApiService, LocationService)
  - `lib/models/`: Data classes
  - `lib/constants.dart`: Global constants (API URLs, colors)

## Key Features

### 1. User Authentication
- Simple Phone OTP login using Firebase Auth.
- Users have a `user_id`, `phone_hash`, `created_at`, and `points`.

### 2. Passive GPS Tracking
- Background GPS tracking using `geolocator` and `background_locator_2`.
- Adaptive frequency: 5s (moving fast) to 60s (stationary).
- Sends `userId, lat, lng, speed, accuracy, heading, timestamp` to `POST /location`.

### 3. Clustering Logic (Backend)
- Simple geometric heuristic:
  - 3+ users moving together within 40m for > 2 mins at > 15km/h.
- Clusters are exposed via `GET /clusters`.

### 4. Live Map Screen
- `flutter_map` with OpenStreetMap.
- Shows current location and inferred bus clusters.
- Auto-refresh every 10 seconds.

### 5. Bus Confirmation
- Popup if user is inside a cluster: "Are you currently on a bus?"
- Send feedback to `POST /cluster/confirm`.

### 6. Rewards
- Simple points system: 1 point/min of tracking, 10 points for confirmation.

## Cleanup Plan
- Remove old "Wassla" crypto/Neo4j code from `backend/`.
- Clear the current `Frontend/` boilerplate to match the new structure.

## Success Criteria
- Passive GPS data is successfully collected and stored.
- Bus clusters are correctly inferred from multiple user pings.
- Users can see their points and active buses on the map.
