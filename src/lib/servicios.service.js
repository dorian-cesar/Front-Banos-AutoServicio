import { ApiClient } from './apiClient';

const api = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_REMOTO });

export const serviciosService = {
    getServicios: () => api.get('/servicios'),
    postVentas: (data) => api.post('/ventas', data)
};
