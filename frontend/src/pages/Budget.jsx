import React, { useState, useEffect } from 'react'
import { Plus, PieChart, AlertTriangle, CheckCircle2, Trash2, X, Loader2, Bell, ShieldAlert, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabase'

export default function Budget() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const { showBudgetExceededToast } = useToast()

  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [dismissedAlert, setDismissedAlert] = useState(false)

  // Create Budget Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCatId, setSelectedCatId] = useState('')
  const [limitAmount, setLimitAmount] = useState('')
  const [period, setPeriod] = useState('monthly')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    loadBudgetData()
  }, [user])

  const loadBudgetData = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const currentMonth = now.toISOString().slice(0, 7)

      const [bRes, catRes, txRes] = await Promise.all([
        supabase
          .from('budgets')
          .select(`*, categories (id, name, color)`)
          .eq('user_id', user.id),
        supabase.from('categories').select('*').eq('type', 'expense'),
        supabase
          .from('transactions')
          .select('category_id, amount, date, type')
          .eq('user_id', user.id)
          .eq('type', 'expense')
      ])

      const currentMonthTx = (txRes.data || []).filter(t => t.date && t.date.startsWith(currentMonth))

      // Compute spent per category dynamically
      const spentMap = {}
      currentMonthTx.forEach(t => {
        if (t.category_id) {
          spentMap[t.category_id] = (spentMap[t.category_id] || 0) + Number(t.amount)
        }
      })

      const enrichedBudgets = (bRes.data || []).map(b => {
        const spent = spentMap[b.category_id] || 0
        const limit = Number(b.limit_amount)
        const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0
        const remaining = limit - spent

        let state = 'normal'
        if (pct >= 100) state = 'exceeded'
        else if (pct >= 90) state = 'critical'
        else if (pct >= 70) state = 'warning'

        return {
          ...b,
          spent,
          remaining,
          pct,
          state
        }
      })

      setBudgets(enrichedBudgets)
      setCategories(catRes.data || [])
      if (catRes.data && catRes.data.length > 0 && !selectedCatId) {
        setSelectedCatId(catRes.data[0].id)
      }

      // Automatically trigger pop notifications for any exceeded budgets!
      const exceededList = enrichedBudgets.filter(b => b.state === 'exceeded' || b.pct >= 100)
      exceededList.forEach(b => {
        showBudgetExceededToast({
          category: b.categories?.name || 'Category',
          spent: b.spent,
          limit: Number(b.limit_amount),
          pct: b.pct,
          remaining: b.remaining
        })
      })
    } catch (err) {
      console.error('Error fetching budgets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBudget = async (e) => {
    e.preventDefault()
    if (!limitAmount || Number(limitAmount) <= 0) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category_id: selectedCatId,
          limit_amount: parseFloat(limitAmount),
          period
        })

      if (error) throw error

      setModalOpen(false)
      setLimitAmount('')
      await loadBudgetData()
    } catch (err) {
      alert('Failed to save budget: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this budget limit?')) return
    try {
      await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id)
      setBudgets(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      alert('Failed to delete budget: ' + err.message)
    }
  }

  const totalLimit = budgets.reduce((s, b) => s + Number(b.limit_amount), 0)
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0)
  const totalRemaining = Math.max(0, totalLimit - totalSpent)
  const totalUsagePct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0
  const exceededBudgets = budgets.filter(b => b.state === 'exceeded' || b.pct >= 100)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-manrope text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('nav.budgets', 'Budgets')} & Financial Health
          </h2>
          <p className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control category limits and prevent spending overruns</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Prominent Budget Exceeded Alert Banner */}
      {exceededBudgets.length > 0 && !dismissedAlert && (
        <div className="bg-rose-50/90 dark:bg-rose-950/40 border-2 border-rose-500/60 dark:border-rose-500/70 p-5 rounded-[24px] card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-3 fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30 shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-manrope font-extrabold text-sm text-rose-900 dark:text-rose-200">
                  {t('budgetAlert.title', 'Budget Exceeded Alert!')}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                  {exceededBudgets.length} {exceededBudgets.length === 1 ? 'Category' : 'Categories'}
                </span>
              </div>
              <p className="font-inter text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                You have reached or exceeded your spending limit in{' '}
                <strong className="font-bold">
                  {exceededBudgets.map(b => b.categories?.name || 'Category').join(', ')}
                </strong>
                . Slow down spending in these categories to protect your financial health.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setDismissedAlert(true)}
              className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
            >
              Dismiss Notice
            </button>
          </div>
        </div>
      )}

      {/* Aggregate Overview Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[24px] border border-slate-200/80 dark:border-slate-800 card-shadow grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div>
          <span className="font-inter text-xs font-semibold text-slate-400 dark:text-slate-500 block">Total Budget Cap</span>
          <p className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">₹{totalLimit.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">Monthly allocated limit</span>
        </div>

        <div>
          <span className="font-inter text-xs font-semibold text-slate-400 dark:text-slate-500 block">Current Spent</span>
          <p className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
          <span className={`text-[11px] font-semibold mt-1 block ${totalUsagePct >= 100 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
            {totalUsagePct}% consumed
          </span>
        </div>

        <div>
          <span className="font-inter text-xs font-semibold text-slate-400 dark:text-slate-500 block">Remaining Allowance</span>
          <p className={`font-manrope text-2xl sm:text-3xl font-extrabold mt-1 ${totalRemaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            ₹{totalRemaining.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">Available until month-end</span>
        </div>

        <div className="flex flex-col justify-center">
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                totalUsagePct >= 100 ? 'bg-rose-500' : totalUsagePct >= 80 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, totalUsagePct)}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium text-right mt-1.5">
            {totalUsagePct}% Overall Usage
          </span>
        </div>
      </div>

      {/* Category Budgets Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading budgets...</div>
      ) : budgets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-16 rounded-[24px] border border-slate-200/80 dark:border-slate-800 text-center max-w-md mx-auto card-shadow">
          <PieChart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="font-manrope font-bold text-slate-800 dark:text-slate-200 text-base">No budgets created yet</h3>
          <p className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Set target limits for Food, Shopping, Transport, and Utilities to receive intelligent overspending warnings.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl mt-5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Set First Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map(b => (
            <div
              key={b.id}
              className={`bg-white dark:bg-slate-900 p-6 rounded-[24px] border card-shadow transition-all duration-220 hover:scale-[1.01] ${
                b.state === 'exceeded'
                  ? 'border-rose-400/80 dark:border-rose-900/80 bg-rose-50/15 dark:bg-rose-950/20 ring-1 ring-rose-500/20'
                  : b.state === 'critical'
                  ? 'border-amber-300 dark:border-amber-900/70 bg-amber-50/15 dark:bg-amber-950/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${b.state === 'exceeded' ? 'bg-rose-500' : 'bg-indigo-600'}`} />
                  <span className="font-manrope font-bold text-slate-900 dark:text-white text-sm">{b.categories?.name || 'Category'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    b.state === 'exceeded'
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      : b.state === 'critical'
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  }`}>
                    {b.pct}% used
                  </span>
                  <button
                    onClick={() => handleDeleteBudget(b.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Numbers */}
              <div className="flex items-baseline justify-between mb-3">
                <span className="font-manrope text-xl font-extrabold text-slate-900 dark:text-white">
                  ₹{b.spent.toLocaleString('en-IN')}
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1">
                    / ₹{Number(b.limit_amount).toLocaleString('en-IN')}
                  </span>
                </span>
                <span className={`text-xs font-bold font-manrope ${b.remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {b.remaining < 0
                    ? `Over by ₹${Math.abs(b.remaining).toLocaleString('en-IN')}`
                    : `₹${b.remaining.toLocaleString('en-IN')} left`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    b.state === 'exceeded' 
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse' 
                      : b.state === 'critical' 
                      ? 'bg-amber-500' 
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, b.pct)}%` }}
                />
              </div>

              {/* State Notice */}
              {b.state === 'exceeded' && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Budget exceeded. Slow down spending in this category.</span>
                </div>
              )}
              {b.state === 'critical' && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Over 90% of budget consumed.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Budget Guided Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[24px] p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 card-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-manrope font-bold text-slate-900 dark:text-white text-base">Create Category Budget</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-hidden focus:border-indigo-600 text-slate-800 dark:text-slate-100"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Monthly Limit (₹)</label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="e.g. 8000"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-hidden focus:border-indigo-600 text-slate-800 dark:text-slate-100"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set Budget Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
