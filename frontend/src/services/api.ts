import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// No retry interceptor — 401 means not logged in, just reject cleanly
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
)

export default api
