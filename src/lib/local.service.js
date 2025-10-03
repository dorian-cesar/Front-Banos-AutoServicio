import { ApiClient } from './apiClient';

const localApi = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_TOTEM });

export const localService = {
    getIp: () => localApi.get('/get_ip')
};