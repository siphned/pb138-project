export { usersRoutes } from "./users.routes";

import { userRolesRepository } from "./user-roles.repository";
import { usersRepository } from "./users.repository";
import { UsersService } from "./users.service";

export const usersService = new UsersService(usersRepository, userRolesRepository);
