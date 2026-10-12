import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { refreshAccessToken, setAuthFailureHandler, tokens } from '../api/client'
import { authApi } from '../api/endpoints'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    tokens.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    setAuthFailureHandler(clearSession)
    async function restore() {
      if (!tokens.getRefresh()) return setLoading(false)
      try {
        await refreshAccessToken()
        const { data } = await authApi.me()
        setUser(data)
      } catch {
        clearSession()
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [clearSession])

  const startSession = (data) => {
    tokens.setAccess(data.access)
    tokens.setRefresh(data.refresh)
    setUser(data.user)
    return data.user
  }

  const value = useMemo(() => ({
    user,
    loading,
    login: async (email, password) => startSession((await authApi.login({ email, password })).data),
    register: async (form) => startSession((await authApi.register(form)).data),
    logout: async () => {
      const refresh = tokens.getRefresh()
      try { if (refresh) await authApi.logout(refresh) } catch { /* token may already be invalid */ }
      clearSession()
    },
    refreshUser: async () => setUser((await authApi.me()).data),
    setUser,
  }), [user, loading, clearSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
