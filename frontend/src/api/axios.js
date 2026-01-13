import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // change this to your hosted backend API base URL
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
            // Don't redirect on these pages/paths
            const noRedirectPaths = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
            const isProfileCheck = error.config?.url?.includes('/auth/profile');

            // Don't redirect if on allowed pages or during initial auth check
            if (!noRedirectPaths.includes(window.location.pathname) && !isProfileCheck) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;