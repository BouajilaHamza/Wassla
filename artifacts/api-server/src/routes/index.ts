import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import locationRouter from "./location.js";
import clustersRouter from "./clusters.js";
import userRouter from "./user.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(locationRouter);
router.use(clustersRouter);
router.use(userRouter);

export default router;
