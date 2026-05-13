import { Router, type IRouter } from "express";
import { store } from "../lib/store.js";
import { findClusterForUser } from "../services/clustering.js";
import { PostLocationBody, PostLocationResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/location", async (req, res): Promise<void> => {
  const parsed = PostLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { userId, lat, lng, speed, accuracy, heading, timestamp, batteryLevel } =
    parsed.data;

  store.upsertUser(userId, "");
  store.addPing({ userId, lat, lng, speed, accuracy, heading, timestamp, batteryLevel: batteryLevel ?? undefined });
  store.addPoints(userId, 1);

  const clusterId = findClusterForUser(userId);

  res.json(
    PostLocationResponse.parse({
      ok: true,
      points: store.users.get(userId)?.points ?? 0,
      inCluster: !!clusterId,
      clusterId: clusterId ?? null,
    }),
  );
});

export default router;
