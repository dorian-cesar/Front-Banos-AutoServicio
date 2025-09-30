import { ApiClient } from './apiClient';

const paymentApi = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_LOCAL });

export const paymentService = {
    postPayment: (data) => paymentApi.post('/payment', data),
    getMonitor: async () => {
        try {
            // 1. Obtener IP del backend local
            const ipResponse = await localService.getIp();
            const ip = ipResponse.ip;

            const monitorUrl = `http://${ip}:3000`;
            const monitorData = await paymentApi.get('/monitor', monitorUrl);
            return monitorData;
        } catch (error) {
            console.error('Error obteniendo monitor:', error);
            throw error;
        }
    }
};
