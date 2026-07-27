import axios from 'axios'

// Adjust to wherever your Django/DRF backend lives.
// Put this in a .env file as VITE_API_URL so it's easy to swap between local/AlwaysData.
const API_URL = import.meta.env.VITE_API_URL || "https://jeanwanjiru.alwaysdata.net/api/"

const api = axios.create({
    baseURL: API_URL,
})

// Attach the access token to every outgoing request automatically
api.interceptors.request.use((config) => {
    const access_token = localStorage.getItem('access_token')
    if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`
    }
    return config
})

// If a request comes back 401, the token is dead - clear storage and bounce to login.
// (A more advanced version would try refreshing first; add that once your refresh
// endpoint is ready.)
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             localStorage.removeItem('access_token')
//             localStorage.removeItem('refresh')
//             localStorage.removeItem('user')
//             window.location.href = '/login'
//         }
//         return Promise.reject(error)
//     }
// )

export default api
