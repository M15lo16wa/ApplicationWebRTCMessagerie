import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { usersService } from "./users.service.js";

export const usersRouter = Router();
usersRouter.use(authMiddleware);

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await usersService.list(req.userId, req.query.search);
    res.json({ users });
  } catch (err) {
    next(err);
  }
});
