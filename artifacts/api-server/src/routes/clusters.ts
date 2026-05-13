import { Router, type IRouter } from "express";
import { store } from "../lib/store.js";
import { GetClustersResponse, ConfirmClusterBody, ConfirmClusterResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/clusters", async (_req, res): Promise<void> => {
  const clusters = Array.from(store.clusters.values()).map((c) => ({
    clusterId: c.clusterId,
    lat: c.lat,
    lng: c.lng,
    avgSpeed: c.avgSpeed,
    confidence: c.confidence,
    estimatedPassengers: c.estimatedPassengers,
    heading: c.heading,
    updatedAt: c.updatedAt,
  }));
  res.json(GetClustersResponse.parse({ clusters }));
});

router.post("/cluster/confirm", async (req, res): Promise<void> => {
  const parsed = ConfirmClusterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { userId, clusterId, isBus } = parsed.data;

  let points = 0;
  if (isBus) {
    store.addPoints(userId, 10);
    points = 10;
    const user = store.users.get(userId);
    if (user) user.tripsToday++;
  }

  req.log.info({ userId, clusterId, isBus }, "Cluster confirmation received");

  res.json(
    ConfirmClusterResponse.parse({
      ok: true,
      points,
    }),
  );
});

export default router;
