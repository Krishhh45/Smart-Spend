import React, { createContext, useContext, useState, useCallback } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, ChevronRight, Bell, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const { t } = useTranslation()
  const [toasts, setToasts] = useState([])

  const playAlertChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } catch (e) {
      // Audio context might be restricted before first interaction
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(({ 
    type = 'info', 
    title, 
    message, 
    category = '',
    spent = 0,
    limit = 0,
    pct = 0,
    actionText, 
    actionLink, 
    duration = 8000 
  }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6)
    
    if (type === 'budget_exceeded' || type === 'error') {
      playAlertChime()
    }

    const newToast = {
      id,
      type,
      title,
      message,
      category,
      spent,
      limit,
      pct,
      actionText,
      actionLink,
      duration
    }

    setToasts((prev) => {
      // Prevent identical duplicate toasts for the same category
      const existing = prev.find(t => t.category && t.category === category && t.type === type)
      if (existing) {
        return prev.map(t => t.id === existing.id ? { ...newToast, id: existing.id } : t)
      }
      return [...prev, newToast]
    })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [playAlertChime, removeToast])

  const showBudgetExceededToast = useCallback(({
    category,
    spent,
    limit,
    pct,
    remaining
  }) => {
    return showToast({
      type: 'budget_exceeded',
      title: t('budgetAlert.title', 'Budget Exceeded Alert!'),
      message: t('budgetAlert.message', 'You have exceeded your {{category}} budget limit! Slow down spending in this category.', { 
        category, 
        spent: spent.toLocaleString('en-IN'), 
        limit: limit.toLocaleString('en-IN'),
        pct 
      }),
      category,
      spent,
      limit,
      pct,
      actionText: t('budgetAlert.viewBudget', 'View Budget'),
      actionLink: '/budget',
      duration: 10000
    })
  }, [showToast, t])

  return (
    <ToastContext.Provider value={{ showToast, showBudgetExceededToast, removeToast }}>
      {children}

      {/* Floating Pop Notifications Container */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] flex flex-col gap-3 max-w-md w-[calc(100vw-2rem)] sm:w-[420px] pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-[24px] p-5 shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${
              toast.type === 'budget_exceeded'
                ? 'bg-white/95 dark:bg-slate-900/95 border-rose-500/50 dark:border-rose-500/60 shadow-rose-500/10 dark:shadow-rose-950/40'
                : toast.type === 'success'
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-500/40 dark:border-emerald-500/50 shadow-emerald-500/10'
                : 'bg-white/95 dark:bg-slate-900/95 border-indigo-500/40 dark:border-indigo-500/50 shadow-indigo-500/10'
            }`}
          >
            {/* Header: Icon, Title & Dismiss */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-2xl shrink-0 ${
                  toast.type === 'budget_exceeded'
                    ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 ring-4 ring-rose-500/10 animate-pulse'
                    : toast.type === 'success'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                    : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                }`}>
                  {toast.type === 'budget_exceeded' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : toast.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-manrope font-extrabold text-sm text-slate-900 dark:text-white">
                      {toast.title}
                    </h4>
                    {toast.pct >= 100 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                        {toast.pct}% used
                      </span>
                    )}
                  </div>
                  {toast.category && (
                    <p className="font-inter text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      {toast.category}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Breakdown if budget exceeded */}
            {toast.type === 'budget_exceeded' && toast.limit > 0 && (
              <div className="mt-3 p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Spent vs Limit</span>
                  <span className="font-manrope font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                    ₹{toast.spent?.toLocaleString('en-IN')}
                    <span className="text-slate-400 text-xs font-normal"> / ₹{toast.limit?.toLocaleString('en-IN')}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Status</span>
                  <span className="font-manrope font-extrabold text-rose-600 dark:text-rose-400 text-xs">
                    {toast.spent > toast.limit 
                      ? `Over by ₹${(toast.spent - toast.limit).toLocaleString('en-IN')}` 
                      : '100% Consumed'}
                  </span>
                </div>
              </div>
            )}

            {/* Message Body */}
            <p className="font-inter text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
              {toast.message}
            </p>

            {/* Actions Bar */}
            {toast.actionLink && (
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Instant Budget Advisory
                </span>
                <Link
                  to={toast.actionLink}
                  onClick={() => removeToast(toast.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-manrope font-bold text-xs shadow-xs transition-colors"
                >
                  <span>{toast.actionText || 'View Budget'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
