import { Router, type IRouter } from "express";
import { store } from "../lib/store.js";
import { GetUserPointsResponse, GetAdminStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/user/points", async (req, res): Promise<void> => {
  const userId =
    typeof req.query["userId"] === "string" ? req.query["userId"] : undefined;
  if (!userId) {
    res.status(400).json({ error: "userId query param required" });
    return;
  }

  const user = store.users.get(userId);
  if (!user) {
    store.upsertUser(userId, "");
    res.json(
      GetUserPointsResponse.parse({
        userId,
        points: 0,
        tripsToday: 0,
        rank: 1,
      }),
    );
    return;
  }

  const sortedPoints = Array.from(store.users.values())
    .sort((a, b) => b.points - a.points)
    .map((u) => u.userId);
  const rank = sortedPoints.indexOf(userId) + 1;

  res.json(
    GetUserPointsResponse.parse({
      userId,
      points: user.points,
      tripsToday: user.tripsToday,
      rank: rank || 1,
    }),
  );
});

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const allConfidences = Array.from(store.clusters.values()).map(
    (c) => c.confidence,
  );
  const avgConfidence =
    allConfidences.length > 0
      ? allConfidences.reduce((s, c) => s + c, 0) / allConfidences.length
      : 0;

  res.json(
    GetAdminStatsResponse.parse({
      activeUsers: store.getActiveUserCount(),
      activeClusters: store.clusters.size,
      totalLocationPings: store.totalPings,
      avgConfidence: Math.round(avgConfidence),
    }),
  );
});

export default router;
