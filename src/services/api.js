import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', email),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  getAllUsers: () => api.get('/auth/users'),
}

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

// Trainings API
export const trainingsAPI = {
  getAll: () => api.get('/training'),
  getById: (id) => api.get(`/training/${id}`),
  getByCategory: (categoryId) => api.get(`/training/category/${categoryId}`),
  create: (data) => api.post('/training', data),
  update: (id, data) => api.put(`/training/${id}`, data),
  delete: (id) => api.delete(`/training/${id}`),
}

// Training Schedules API
export const schedulesAPI = {
  getAll: () => api.get('/training-schedules'),
  getById: (id) => api.get(`/training-schedules/${id}`),
  getByTraining: (trainingId) => api.get(`/training-schedules/training/${trainingId}`),
  create: (data) => api.post('/training-schedules', data),
  update: (id, data) => api.put(`/training-schedules/${id}`, data),
  delete: (id) => api.delete(`/training-schedules/${id}`),
}

// Enrollments API
export const enrollmentsAPI = {
  getAll: () => api.get('/enrollments'),
  getById: (id) => api.get(`/enrollments/${id}`),
  create: (data) => api.post('/enrollments', data),
  updateStatus: (id, status) => api.patch(`/enrollments/${id}/status`, { status }),
}

// Reviews API
export const reviewsAPI = {
  getByTraining: (trainingId) => api.get(`/reviews/training/${trainingId}`),
  getTrainingRating: (trainingId) => api.get(`/reviews/training/${trainingId}/rating`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
}

export default api