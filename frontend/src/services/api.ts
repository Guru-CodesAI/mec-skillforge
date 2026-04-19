import axios from 'axios'

const PROD_API = 'https://mec-skillforge.onrender.com'
const isDev = import.meta.env.DEV

const api = axios.create({
  baseURL: isDev ? '/api' : `${PROD_API}/api`,
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
)

export default api
