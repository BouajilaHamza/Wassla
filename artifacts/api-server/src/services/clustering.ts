import { store, type LocationPing, type BusCluster } from "../lib/store.js";
import { logger } from "../lib/logger.js";

const CLUSTER_RADIUS_M = 40;
const MIN_SPEED_MS = 5 / 3.6;
const MIN_CLUSTER_SIZE = 3;
const MAX_AGE_MS = 2 * 60 * 1000;
const STALE_CLUSTER_MS = 3 * 60 * 1000;

function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findClusterForUser(userId: string): string | undefined {
  for (const cluster of store.clusters.values()) {
    if (cluster.memberIds.has(userId)) return cluster.clusterId;
  }
  return undefined;
}

export function runClustering(): void {
  const now = Date.now();
  const movingPoints: { userId: string; ping: LocationPing }[] = [];

  for (const [userId, pings] of store.recentPings.entries()) {
    const recent = pings.filter((p) => now - p.timestamp < MAX_AGE_MS);
    if (recent.length === 0) continue;
    const latest = recent[recent.length - 1];
    if ((latest.speed ?? 0) >= MIN_SPEED_MS) {
      movingPoints.push({ userId, ping: latest });
    }
  }

  const visited = new Set<number>();
  const groups: { userId: string; ping: LocationPing }[][] = [];

  for (let i = 0; i < movingPoints.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);
    const group = [movingPoints[i]];

    for (let j = i + 1; j < movingPoints.length; j++) {
      if (visited.has(j)) continue;
      const dist = haversine(
        movingPoints[i].ping.lat,
        movingPoints[i].ping.lng,
        movingPoints[j].ping.lat,
        movingPoints[j].ping.lng,
      );
      if (dist <= CLUSTER_RADIUS_M) {
        group.push(movingPoints[j]);
        visited.add(j);
      }
    }

    groups.push(group);
  }

  const updatedIds = new Set<string>();

  for (const group of groups) {
    if (group.length < MIN_CLUSTER_SIZE) continue;

    const lat = group.reduce((s, m) => s + m.ping.lat, 0) / group.length;
    const lng = group.reduce((s, m) => s + m.ping.lng, 0) / group.length;
    const avgSpeedMs = group.reduce((s, m) => s + m.ping.speed, 0) / group.length;
    const heading = group.reduce((s, m) => s + m.ping.heading, 0) / group.length;
    const confidence = Math.min(100, Math.round((group.length / 8) * 100 + 25));
    const memberIds = new Set(group.map((m) => m.userId));

    let existing: BusCluster | undefined;
    for (const c of store.clusters.values()) {
      if (haversine(lat, lng, c.lat, c.lng) < CLUSTER_RADIUS_M * 3) {
        existing = c;
        break;
      }
    }

    if (existing) {
      existing.lat = lat;
      existing.lng = lng;
      existing.avgSpeed = avgSpeedMs * 3.6;
      existing.confidence = confidence;
      existing.estimatedPassengers = group.length;
      existing.heading = heading;
      existing.memberIds = memberIds;
      existing.updatedAt = now;
      updatedIds.add(existing.clusterId);
    } else {
      const clusterId = `bus_${now}_${Math.random().toString(36).slice(2, 7)}`;
      store.clusters.set(clusterId, {
        clusterId,
        lat,
        lng,
        avgSpeed: avgSpeedMs * 3.6,
        confidence,
        estimatedPassengers: group.length,
        heading,
        memberIds,
        createdAt: now,
        updatedAt: now,
      });
      updatedIds.add(clusterId);
      logger.info({ clusterId, members: group.length }, "New bus cluster detected");
    }
  }

  for (const [id, cluster] of store.clusters.entries()) {
    if (now - cluster.updatedAt > STALE_CLUSTER_MS) {
      store.clusters.delete(id);
      logger.info({ clusterId: id }, "Cluster expired");
    }
  }
}

export function startClusteringLoop(): void {
  setInterval(() => {
    try {
      runClustering();
    } catch (err) {
      logger.error({ err }, "Clustering error");
    }
  }, 10_000);
  logger.info("Clustering loop started (10s interval)");
}
