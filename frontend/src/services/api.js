import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5005/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or auth store
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error('Access forbidden:', error.response.data.message)
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data.message)
    }
    
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.patch('/auth/profile', userData),
  changePassword: (passwordData) => api.patch('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  getAllUsers: () => api.get('/auth/users'),
}

export const coursesAPI = {
  getAll: (params) => api.get('/training', { params }),
  getById: (id) => api.get(`/training/${id}`),
  create: (courseData) => api.post('/training', courseData),
  update: (id, courseData) => api.put(`/training/${id}`, courseData),
  delete: (id) => api.delete(`/training/${id}`),
  getByCategory: (categoryId) => api.get(`/training/category/${categoryId}`),
}

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
}

export const trainingSchedulesAPI = {
  getAll: () => api.get('/training-schedules'),
  getById: (id) => api.get(`/training-schedules/${id}`),
  create: (scheduleData) => api.post('/training-schedules', scheduleData),
  update: (id, scheduleData) => api.put(`/training-schedules/${id}`, scheduleData),
  delete: (id) => api.delete(`/training-schedules/${id}`),
  getByTraining: (trainingId) => api.get(`/training-schedules/training/${trainingId}`),
}

export const enrollmentsAPI = {
  getAll: () => api.get('/enrollments'),
  getById: (id) => api.get(`/enrollments/${id}`),
  create: (enrollmentData) => api.post('/enrollments', enrollmentData),
  updateStatus: (id, status) => api.patch(`/enrollments/${id}/status`, { status }),
}

export const reviewsAPI = {
  getByTraining: (trainingId) => api.get(`/reviews/training/${trainingId}`),
  getTrainingRating: (trainingId) => api.get(`/reviews/training/${trainingId}/rating`),
  create: (reviewData) => api.post('/reviews', reviewData),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
}

// Utility functions
export const uploadFile = async (file, endpoint) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const downloadFile = async (url, filename) => {
  const response = await api.get(url, {
    responseType: 'blob',
  })
  
  const blob = new Blob([response.data])
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

export default api