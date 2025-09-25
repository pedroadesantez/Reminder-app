import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - update this for production
const API_BASE_URL = __DEV__
  ? 'http://localhost:7001/api'
  : 'https://your-production-api.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Load token from storage on app start
export const loadAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }
    return token;
  } catch (error) {
    console.error('Error loading auth token:', error);
    return null;
  }
};

// Save token to storage
export const saveAuthToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem('authToken', token);
      setAuthToken(token);
    } else {
      await AsyncStorage.removeItem('authToken');
      setAuthToken(null);
    }
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    // Handle 401 unauthorized - token expired
    if (error.response?.status === 401) {
      await saveAuthToken(null);
      // You might want to redirect to login screen here
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  googleAuth: (tokenData) => api.post('/auth/google', tokenData),
};

// Tasks API
export const tasksAPI = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats'),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Reminders API
export const remindersAPI = {
  getAll: (params = {}) => api.get('/reminders', { params }),
  getById: (id) => api.get(`/reminders/${id}`),
  create: (reminderData) => api.post('/reminders', reminderData),
  update: (id, reminderData) => api.put(`/reminders/${id}`, reminderData),
  delete: (id) => api.delete(`/reminders/${id}`),
  snooze: (id, minutes) => api.post(`/reminders/${id}/snooze`, { minutes }),
  markTriggered: (id) => api.post(`/reminders/${id}/trigger`),
};

// Users API
export const usersAPI = {
  getStats: () => api.get('/users/stats'),
};

// Health check
export const healthCheck = () => api.get('/health', { baseURL: API_BASE_URL.replace('/api', '') });

export default api;