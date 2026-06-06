import { createContext, useContext, useState, useCallback } from 'react'
import { runAnalysis } from '../utils/analyze'

const defaultProfile = {
  age: 35,
  healthStatus: 'good',
  medication: 'none',
  budget: 500,
  coverageNeeds: ['hospitalization', 'critical'],
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [page, setPage] = useState('home')
  const [profile, setProfile] = useState(defaultProfile)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const updateProfile = useCallback((patch) => {
    setProfile((prev) => ({ ...prev, ...patch }))
  }, [])

  const startAnalysis = useCallback(() => {
    setAnalyzing(true)
    setPage('analysis')
    setTimeout(() => {
      const result = runAnalysis(profile)
      setAnalysis(result)
      setAnalyzing(false)
    }, 2200)
  }, [profile])

  const reset = useCallback(() => {
    setProfile(defaultProfile)
    setAnalysis(null)
    setAnalyzing(false)
    setPage('home')
  }, [])

  const goTo = useCallback((name) => setPage(name), [])

  return (
    <AppContext.Provider
      value={{
        page,
        setPage: goTo,
        profile,
        updateProfile,
        analysis,
        analyzing,
        startAnalysis,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
