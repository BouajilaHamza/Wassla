export interface UserRecord {
  userId: string;
  phoneHash: string;
  points: number;
  createdAt: number;
  lastSeen: number;
  tripsToday: number;
  tripsDayKey: string;
}

export interface LocationPing {
  userId: string;
  lat: number;
  lng: number;
  speed: number;
  accuracy: number;
  heading: number;
  timestamp: number;
  batteryLevel?: number;
}

export interface BusCluster {
  clusterId: string;
  lat: number;
  lng: number;
  avgSpeed: number;
  confidence: number;
  estimatedPassengers: number;
  heading: number;
  memberIds: Set<string>;
  createdAt: number;
  updatedAt: number;
}

class Store {
  users = new Map<string, UserRecord>();
  recentPings = new Map<string, LocationPing[]>();
  clusters = new Map<string, BusCluster>();
  totalPings = 0;

  upsertUser(userId: string, phoneHash: string): UserRecord {
    const todayKey = new Date().toISOString().slice(0, 10);
    let user = this.users.get(userId);
    if (!user) {
      user = {
        userId,
        phoneHash,
        points: 0,
        createdAt: Date.now(),
        lastSeen: Date.now(),
        tripsToday: 0,
        tripsDayKey: todayKey,
      };
      this.users.set(userId, user);
    } else {
      user.lastSeen = Date.now();
      if (user.tripsDayKey !== todayKey) {
        user.tripsToday = 0;
        user.tripsDayKey = todayKey;
      }
    }
    return user;
  }

  addPing(ping: LocationPing): void {
    this.totalPings++;
    const pings = this.recentPings.get(ping.userId) ?? [];
    pings.push(ping);
    const cutoff = Date.now() - 5 * 60 * 1000;
    const recent = pings.filter((p) => p.timestamp > cutoff);
    this.recentPings.set(ping.userId, recent.slice(-30));
  }

  addPoints(userId: string, pts: number): void {
    const user = this.users.get(userId);
    if (user) user.points += pts;
  }

  getActiveUserCount(): number {
    const cutoff = Date.now() - 2 * 60 * 1000;
    let count = 0;
    for (const pings of this.recentPings.values()) {
      if (pings.some((p) => p.timestamp > cutoff)) count++;
    }
    return count;
  }
}

export const store = new Store();
