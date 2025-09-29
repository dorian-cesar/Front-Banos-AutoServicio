import { ApiClient } from './apiClient';

const api = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL });

export const serviciosService = {
    getServicios: () => api.get('/servicios'),
};
