import axios from "axios";
import appConfig from "../components/configs/app.config";
import { getDecryptedToken, getTenantId } from "../utils/functions/tokenEncryption";

const socketApi = axios.create({
    baseURL: appConfig.backendSocketUrl,
    timeout: 20000,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    }
});

socketApi.interceptors.request.use(
    (config) => {
        const token = getDecryptedToken();
        const tenantId = getTenantId();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (tenantId) {
            config.headers.database = tenantId;
        }

        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

socketApi.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('❌ Socket API Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });

        if (error.message === 'Network Error') {
            console.error('🚫 CORS or Network Error detected');
        }

        return Promise.reject(error);
    }
);

export default socketApi;