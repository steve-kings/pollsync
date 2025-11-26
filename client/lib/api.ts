import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor - handle 401 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired
            console.log('🔒 401 Unauthorized - clearing auth data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect if not already on login/register page
            if (typeof window !== 'undefined' && 
                !window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register') &&
                !window.location.pathname.includes('/pricing') &&
                !window.location.pathname.includes('/features') &&
                !window.location.pathname.includes('/how-it-works') &&
                window.location.pathname !== '/') {
                window.location.href = '/login?session=expired';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
