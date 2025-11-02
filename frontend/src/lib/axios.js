import axios from 'axios'

const base_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5173/api' : '/api'

export const axiosInstance = axios.create({
  baseURL: base_URL,
  withCredentials: true //dùng để gửi cookie giữa frontend và backend trong các request Axios
})
