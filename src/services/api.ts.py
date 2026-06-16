import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// اینترسپتور برای توکن
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// اینترسپتور برای خطاها
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

// توابع API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
}

export const doctorsAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id: string) => api.get(`/doctors/${id}`),
}

export const appointmentsAPI = {
  create: (data: any) => api.post('/appointments', data),
  getUserAppointments: () => api.get('/appointments/my'),
  cancel: (id: string) => api.delete(`/appointments/${id}`),
}

export default api
