import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { callsService } from "./calls.service.js";

export const callsRouter = Router();
callsRouter.use(authMiddleware);

callsRouter.get("/", async (req, res, next) => {
  try {
    const calls = await callsService.history(req.userId);
    res.json({ calls });
  } catch (err) {
    next(err);
  }
});

callsRouter.delete("/all", async (req, res, next) => {
  try {
    const result = await callsService.clearHistory({ userId: req.userId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

callsRouter.delete("/bulk", async (req, res, next) => {
  try {
    const result = await callsService.deleteMany({
      callIds: Array.isArray(req.body?.callIds) ? req.body.callIds : [],
      userId: req.userId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

callsRouter.delete("/:callId", async (req, res, next) => {
  try {
    const result = await callsService.deleteOne({ callId: req.params.callId, userId: req.userId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});
