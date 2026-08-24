import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { contactsController } from "./contacts.controller.js";

export const contactsRouter = Router();
contactsRouter.use(authMiddleware);

contactsRouter.get("/", contactsController.list);
contactsRouter.post("/", contactsController.add);
