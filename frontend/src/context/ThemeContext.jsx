import React, { createContext, useContext, useState, useEffect } from 'react'
import i18n from '../i18n'
import { supabase } from '../services/supabase'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // 1. Initialize Theme from localStorage or default 'light'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('smartspend_theme')
    if (saved === 'dark' || saved === 'light') return saved
    return 'light'
  })

  // 2. Initialize Language from localStorage or default 'en'
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('smartspend_language')
    if (saved === 'hi' || saved === 'mr' || saved === 'en') return saved
    return 'en'
  })

  // Apply dark mode class to document element and body
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      root.classList.remove('dark')
      document.body.classList.remove('dark')
    }
    localStorage.setItem('smartspend_theme', theme)
  }, [theme])

  // Apply language changes to i18next & localStorage
  useEffect(() => {
    i18n.changeLanguage(language)
    localStorage.setItem('smartspend_language', language)
  }, [language])

  // Sync preferences from Supabase session on auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {}
          if (meta.theme_preference && (meta.theme_preference === 'light' || meta.theme_preference === 'dark')) {
            setTheme(meta.theme_preference)
          }
          if (meta.language_preference && ['en', 'hi', 'mr'].includes(meta.language_preference)) {
            setLanguage(meta.language_preference)
          }
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const syncBackendSettings = async (newTheme, newLang) => {
    try {
      const updates = {}
      if (newTheme) updates.theme_preference = newTheme
      if (newLang) updates.language_preference = newLang

      // 1. Update Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: updates
      })

      // 2. Call Flask backend user settings endpoint
      const { data: { session } } = await supabase.auth.getSession()
      const headers = { 'Content-Type': 'application/json' }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      await fetch('http://127.0.0.1:5000/api/v1/user/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      }).catch(() => {
        // Backend failure shouldn't crash UI
      })
    } catch (err) {
      console.warn('Could not sync settings to backend:', err)
    }
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    syncBackendSettings(nextTheme, null)
  }

  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode)
      syncBackendSettings(mode, null)
    }
  }

  const changeLanguage = (lang) => {
    if (['en', 'hi', 'mr'].includes(lang)) {
      setLanguage(lang)
      syncBackendSettings(null, lang)
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setThemeMode,
        language,
        changeLanguage
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
