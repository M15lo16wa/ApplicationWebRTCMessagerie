import { usersRepository } from "./users.repository.js";

export const usersService = {
  list(userId, search) {
    return usersRepository.listExcept(userId, search);
  },

  findById(id) {
    return usersRepository.findById(id);
  },
};
