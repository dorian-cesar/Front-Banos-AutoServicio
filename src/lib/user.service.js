import { ApiClient } from './apiClient';

const api = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_USER });

export const userService = {
  addUser: (token) => {
    const body = { pin: token, idNo: token };
    // usamos noAuth porque este endpoint no usa tu token central
    return api.post('/addUser.php', body, null, { noAuth: true });
  },

  addUserAccessLevel: (token) => {
    const body = { pin: token };
    return api.post('/addLevelUser2.php', body, null, { noAuth: true });
  },

  createUser: async (token) => {
    // aquí devolvemos un booleano o lanzamos error como prefieras
    await userService.addUser(token);
    await userService.addUserAccessLevel(token);
    return true;
  }
};
