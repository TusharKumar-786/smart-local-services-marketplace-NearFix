import api from './client'

export const authApi = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  me: () => api.get('/auth/me/'),
  updateMe: (data) => api.patch('/auth/me/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
}

export const catalogApi = {
  categories: () => api.get('/categories/'),
  areas: () => api.get('/areas/'),
  providers: (params) => api.get('/providers/', { params }),
  provider: (id) => api.get(`/providers/${id}/`),
  providerReviews: (id, page = 1) => api.get(`/providers/${id}/reviews/`, { params: { page } }),
  providerSlots: (id, date) => api.get(`/providers/${id}/slots/`, { params: { date } }),
}

export const matchApi = {
  recommend: (params) => api.get('/recommendations/', { params }),
  emergency: (params) => api.get('/recommendations/emergency/', { params }),
  route: (from, to) => api.get('/dsa/route/', { params: { from, to } }),
  search: (params) => api.get('/dsa/search/', { params }),
}

export const bookingApi = {
  list: (params) => api.get('/bookings/', { params }),
  get: (id) => api.get(`/bookings/${id}/`),
  create: (data) => api.post('/bookings/', data),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel/`, { reason }),
  setStatus: (id, action, reason) => api.post(`/bookings/${id}/status/`, { action, reason }),
  pay: (id, method) => api.post(`/bookings/${id}/pay/`, { method }),
  review: (data) => api.post('/reviews/', data),
  complaint: (data) => api.post('/complaints/', data),
  complaints: () => api.get('/complaints/'),
}

export const providerApi = {
  profile: () => api.get('/provider/profile/'),
  updateProfile: (data) => api.patch('/provider/profile/', data),
  dashboard: () => api.get('/provider/dashboard/'),
  availability: () => api.get('/availability/'),
  addAvailability: (data) => api.post('/availability/', data),
  removeAvailability: (id) => api.delete(`/availability/${id}/`),
  reviews: () => api.get('/reviews/'),
}
