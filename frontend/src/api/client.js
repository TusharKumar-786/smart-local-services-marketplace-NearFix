import axios from 'axios'

// Token strategy: the short-lived access token lives only in memory.
// The refresh token is kept in localStorage so a page reload keeps you
// logged in; it is rotated on every refresh and blacklisted on logout.
const REFRESH_KEY = 'nearfix_refresh'
let accessToken = null
let onAuthFailure = () => {}

export const tokens = {
  setAccess: (token) => { accessToken = token },
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (token) => (token ? localStorage.setItem(REFRESH_KEY, token) : localStorage.removeItem(REFRESH_KEY)),
  clear: () => { accessToken = null; localStorage.removeItem(REFRESH_KEY) },
  hasAccess: () => Boolean(accessToken),
}

export function setAuthFailureHandler(handler) {
  onAuthFailure = handler
}

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1', timeout: 15000 })

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let refreshPromise = null

export async function refreshAccessToken() {
  const refresh = tokens.getRefresh()
  if (!refresh) throw new Error('No refresh token')
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${api.defaults.baseURL}/auth/token/refresh/`, { refresh })
      .then(({ data }) => {
        tokens.setAccess(data.access)
        if (data.refresh) tokens.setRefresh(data.refresh)
        return data.access
      })
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthCall = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/token/refresh')
    if (error.response?.status === 401 && !original._retried && !isAuthCall && tokens.getRefresh()) {
      original._retried = true
      try {
        await refreshAccessToken()
        return api(original)
      } catch {
        tokens.clear()
        onAuthFailure()
      }
    }
    return Promise.reject(error)
  },
)

// Turn any API error into { message, fields } for forms.
export function parseError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) return { message: 'Cannot reach the server. Is the backend running?', fields: {} }
  const data = error.response.data || {}
  const fields = {}
  Object.entries(data.errors || {}).forEach(([key, value]) => {
    fields[key] = Array.isArray(value) ? value.join(' ') : String(value)
  })
  return { message: data.detail || fallback, fields }
}

export default api
