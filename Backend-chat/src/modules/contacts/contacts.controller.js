import { contactsService } from "./contacts.service.js";
import { addContactSchema } from "./contacts.validation.js";

export const contactsController = {
  async list(req, res, next) {
    try {
      const contacts = await contactsService.list(req.userId);
      res.json({ contacts });
    } catch (err) {
      next(err);
    }
  },

  async add(req, res, next) {
    try {
      const { contactId } = addContactSchema.parse(req.body);
      const contact = await contactsService.add(req.userId, contactId);
      res.status(201).json({ contact });
    } catch (err) {
      next(err);
    }
  },
};
