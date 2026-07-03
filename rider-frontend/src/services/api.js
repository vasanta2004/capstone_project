import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Authentication endpoints
export const loginUserAPI = (data) => API.post('/auth/login', { ...data, type: 'user' });
export const loginDriverAPI = (data) => API.post('/auth/login', { ...data, type: 'driver' });
export const registerUserAPI = (data) => API.post('/auth/register/user', data);
export const registerDriverAPI = (data) => API.post('/auth/register/driver', data);
export const updateProfileAPI = (data) => API.put('/auth/profile', data);

// Ride lifecycle endpoints
export const bookRideAPI = (data) => API.post('/rides/book', data);
export const acceptRideAPI = (id) => API.put(`/rides/${id}/accept`);
export const updateRideStatusAPI = (id, status) => API.put(`/rides/${id}/status`, { status });
export const getRideHistoryAPI = () => API.get('/rides/history');

// Payment processing endpoints
export const processPaymentAPI = (data) => API.post('/payments/process', data);

// Admin dashboard endpoints
export const getAdminStatsAPI = () => API.get('/admin/stats');
export const getAdminUsersAPI = () => API.get('/admin/users');
export const getAdminDriversAPI = () => API.get('/admin/drivers');
export const approveDriverAPI = (id) => API.put(`/admin/drivers/${id}/approve`);

export default API;
