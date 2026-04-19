import api from './api'
import type { User, UserProfile, Match, AdminUser } from '../types'

export const authService = {
  register: (data: { name: string; email: string; password: string; github_username?: string; experience_level?: string }) =>
    api.post<User>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<User>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
}

export const userService = {
  getProfile: () => api.get<UserProfile>('/users/profile'),
  updateProfile: (data: Partial<{ name: string; github_username: string; experience_level: string }>) =>
    api.patch('/users/profile', data),
}

export const githubService = {
  verify: () => api.post('/github/verify'),
  getProfile: () => api.get('/github/profile'),
}

export const trustService = {
  getScore: () => api.get<{ score: number; confidence_level: string }>('/trust/score'),
}

export const matchingService = {
  getRecommendations: () => api.get<{ matches: Match[] }>('/matching/recommendations'),
}

export const adminService = {
  getUsers: () => api.get<AdminUser[]>('/admin/users'),
  removeUser: (id: number) => api.delete(`/admin/users/${id}`),
}
