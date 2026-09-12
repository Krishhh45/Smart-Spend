import React, { useState } from 'react'
import { Settings as SettingsIcon, Bell, Sparkles, Shield, Trash2, Download, Sun, Moon, Globe, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../services/supabase'

export default function Settings() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { theme, setThemeMode, language, changeLanguage } = useTheme()

  const [budgetAlerts, setBudgetAlerts] = useState(true)
  const [anomalyAlerts, setAnomalyAlerts] = useState(true)
  const [aiInsights, setAiInsights] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const showSavedIndicator = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2000)
  }

  const handleThemeChange = (newTheme) => {
    setThemeMode(newTheme)
    showSavedIndicator()
  }

  const handleLanguageChange = (newLang) => {
    changeLanguage(newLang)
    showSavedIndicator()
  }

  const handleExportAllData = async () => {
    setExporting(true)
    try {
      const [tx, acc, bud, rec] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('budgets').select('*').eq('user_id', user.id),
        supabase.from('recurring_expenses').select('*').eq('user_id', user.id)
      ])

      const fullBackup = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email,
        accounts: acc.data || [],
        transactions: tx.data || [],
        budgets: bud.data || [],
        recurring_expenses: rec.data || []
      }

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(fullBackup, null, 2))}`
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', jsonString)
      downloadAnchor.setAttribute('download', `SmartSpend_Full_Backup_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
    } catch (err) {
      alert('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  const handleClearTransactions = async () => {
    if (!window.confirm('WARNING: This will permanently delete ALL recorded transactions for your account. This action cannot be undone. Are you sure?')) {
      return
    }

    try {
      await supabase.from('transactions').delete().eq('user_id', user.id)
      alert('All transactions cleared successfully.')
    } catch (err) {
      alert('Failed to clear: ' + err.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('settings.title', 'Account & System Settings')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('settings.subtitle', 'Manage your preferences, visual theme, and multilingual experience')}
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold animate-in fade-in duration-150">
            <Check className="w-3.5 h-3.5" />
            <span>{t('settings.saved', 'Settings saved!')}</span>
          </div>
        )}
      </div>

      {/* Theme Preference Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sun className="w-4 h-4 text-amber-500" />
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('settings.appearance', 'Appearance & Theme')}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {t('settings.themeModeDesc', 'Select whether you prefer a clean light theme or high-contrast dark theme')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Light Theme Radio Option */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {t('theme.light', 'Light Mode')}
                </span>
                <span className="text-[10px] text-slate-400">Clean Aurora Day</span>
              </div>
            </div>
            <input
              type="radio"
              name="theme_preference"
              checked={theme === 'light'}
              onChange={() => handleThemeChange('light')}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
          </button>

          {/* Dark Theme Radio Option */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {t('theme.dark', 'Dark Mode')}
                </span>
                <span className="text-[10px] text-slate-400">High-Contrast Night</span>
              </div>
            </div>
            <input
              type="radio"
              name="theme_preference"
              checked={theme === 'dark'}
              onChange={() => handleThemeChange('dark')}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
          </button>
        </div>
      </div>

      {/* Language & Internationalization Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('settings.languageSection', 'Language & Localization')}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {t('settings.languageDesc', 'Choose your primary language for navigation, charts, and voice recognition')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { code: 'en', title: 'English', sub: 'Default' },
            { code: 'hi', title: 'हिंदी', sub: 'Hindi' },
            { code: 'mr', title: 'मराठी', sub: 'Marathi' }
          ].map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                language === lang.code
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 ring-2 ring-indigo-600/20 font-bold'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-sm font-bold block">{lang.title}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{lang.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI & Automation Preferences */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Intelligence & Automation</h3>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Smart AI Financial Insights</span>
              <span className="text-slate-400 dark:text-slate-500">Generate explainable spending observations and tips</span>
            </div>
            <input
              type="checkbox"
              checked={aiInsights}
              onChange={(e) => setAiInsights(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Unusual Spending Anomaly Warnings</span>
              <span className="text-slate-400 dark:text-slate-500">Flag transactions exceeding 2.5x category baseline</span>
            </div>
            <input
              type="checkbox"
              checked={anomalyAlerts}
              onChange={(e) => setAnomalyAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Proactive Budget Threshold Alerts</span>
              <span className="text-slate-400 dark:text-slate-500">Notify when category spend exceeds 90% and 100% of limits</span>
            </div>
            <input
              type="checkbox"
              checked={budgetAlerts}
              onChange={(e) => setBudgetAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Data Export & Privacy */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Data Sovereignty & Privacy</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Export Full JSON Database Backup</span>
              <span className="text-slate-400 dark:text-slate-500">Includes all accounts, transactions, budgets, and recurring obligations</span>
            </div>
            <button
              onClick={handleExportAllData}
              disabled={exporting}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl font-semibold transition-all shadow-2xs text-xs self-start sm:self-center"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>{exporting ? 'Preparing...' : 'Export Backup'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
            <div>
              <span className="font-bold text-rose-800 dark:text-rose-400 block">Clear All Transactions</span>
              <span className="text-rose-500/80 text-[11px]">Permanently deletes all financial records. Cannot be recovered.</span>
            </div>
            <button
              onClick={handleClearTransactions}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl font-semibold transition-all shadow-xs text-xs self-start sm:self-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
