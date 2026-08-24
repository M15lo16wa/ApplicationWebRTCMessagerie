import { HttpError } from "../../lib/httpError.js";
import { usersService } from "../users/users.service.js";
import { contactsRepository } from "./contacts.repository.js";

export const contactsService = {
  async list(ownerId) {
    const contacts = await contactsRepository.listForOwner(ownerId);
    return contacts.map((c) => c.contact);
  },

  async add(ownerId, contactId) {
    if (ownerId === contactId) {
      throw new HttpError(400, "Impossible de s'ajouter soi-même comme contact");
    }
    const target = await usersService.findById(contactId);
    if (!target) {
      throw new HttpError(404, "Aucun utilisateur avec ce compte");
    }
    const alreadyAdded = await contactsRepository.exists(ownerId, contactId);
    if (alreadyAdded) {
      throw new HttpError(409, "Ce contact est déjà dans ta liste");
    }
    const created = await contactsRepository.create(ownerId, contactId);
    return created.contact;
  },
};
