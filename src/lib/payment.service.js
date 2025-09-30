import { ApiClient } from './apiClient';

const api = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_LOCAL });

export const paymentService = {
    postPayment: (data) => api.post('/payment', data),
};
