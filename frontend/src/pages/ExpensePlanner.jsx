import React, { useState, useEffect } from 'react'
import { 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Wallet, 
  TrendingDown, 
  ArrowRight, 
  Download, 
  Save, 
  Loader2, 
  Check, 
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  PieChart as PieIcon,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { 
  fetchUserFinancialContext, 
  runAiExpensePlanner, 
  saveExpensePlan, 
  loadSavedExpensePlan 
} from '../services/expensePlannerService'

const CATEGORY_OPTIONS = [
  'Housing',
  'Groceries',
  'Bills & Utilities',
  'Food & Dining',
  'Healthcare',
  'Transportation',
  'EMI & Loans',
  'Shopping',
  'Education',
  'Entertainment',
  'Travel',
  'Personal Care',
  'Insurance',
  'Investments',
  'Other'
]

const TIER_COLORS = {
  'Must Do': '#EF4444',    // Rose red
  'Important': '#3B82F6',  // Blue
  'Reduce': '#F59E0B',     // Amber
  'Can Delay': '#8B5CF6',  // Violet
  'Avoid': '#64748B'       // Slate
}

export default function ExpensePlanner() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { isDark, language } = useTheme()

  const currentMonthStr = new Date().toISOString().slice(0, 7) // e.g. "2026-09"
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr)
  const [availableBudget, setAvailableBudget] = useState('')
  const [plannedExpenses, setPlannedExpenses] = useState([])
  const [financialHistory, setFinancialHistory] = useState(null)
  
  // UI states
  const [loadingContext, setLoadingContext] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'pay_now' | 'reduce' | 'postpone' | 'avoid'
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [importMessage, setImportMessage] = useState('')

  // Form input state
  const [formName, setFormName] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formCategory, setFormCategory] = useState('Housing')
  const [formDeadline, setFormDeadline] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formRecurring, setFormRecurring] = useState(false)

  // 1. Fetch user context & existing plan
  useEffect(() => {
    async function init() {
      setLoadingContext(true)
      const context = await fetchUserFinancialContext(user?.id)
      setFinancialHistory(context)

      // Auto-suggest budget if empty
      if (!availableBudget) {
        if (context.monthly_income > 0) {
          setAvailableBudget(String(context.monthly_income))
        } else if (context.available_balance > 0) {
          setAvailableBudget(String(context.available_balance))
        } else {
          setAvailableBudget('50000')
        }
      }

      // Check if user already saved an expense plan for this month
      const saved = await loadSavedExpensePlan(user?.id, selectedMonth)
      if (saved) {
        if (saved.available_budget) setAvailableBudget(String(saved.available_budget))
        if (saved.planned_expenses && saved.planned_expenses.length > 0) {
          setPlannedExpenses(saved.planned_expenses)
        }
        if (saved.ai_recommendations) {
          setAiResult(saved.ai_recommendations)
        }
      }

      setLoadingContext(false)
    }

    init()
  }, [user, selectedMonth])

  // 2. Open Add/Edit Modal
  const openAddModal = (index = null) => {
    if (index !== null) {
      const item = plannedExpenses[index]
      setEditingIndex(index)
      setFormName(item.name)
      setFormAmount(String(item.amount))
      setFormCategory(item.category || 'Housing')
      setFormDeadline(item.deadline || '')
      setFormNotes(item.notes || '')
      setFormRecurring(Boolean(item.is_recurring))
    } else {
      setEditingIndex(null)
      setFormName('')
      setFormAmount('')
      setFormCategory('Housing')
      setFormDeadline('')
      setFormNotes('')
      setFormRecurring(false)
    }
    setShowAddModal(true)
  }

  // 3. Save Form Item
  const handleSaveExpenseItem = (e) => {
    e.preventDefault()
    const amountNum = parseFloat(formAmount)
    if (!formName.trim() || isNaN(amountNum) || amountNum <= 0) return

    const newItem = {
      id: editingIndex !== null ? plannedExpenses[editingIndex].id : `exp_${Date.now()}`,
      name: formName.trim(),
      amount: amountNum,
      category: formCategory,
      deadline: formDeadline || null,
      notes: formNotes.trim(),
      is_recurring: formRecurring
    }

    if (editingIndex !== null) {
      setPlannedExpenses(prev => prev.map((item, idx) => idx === editingIndex ? newItem : item))
    } else {
      setPlannedExpenses(prev => [...prev, newItem])
    }

    setShowAddModal(false)
    // Clear previous AI result since inputs changed
    setAiResult(null)
  }

  // 4. Delete Expense
  const handleDeleteExpense = (index) => {
    setPlannedExpenses(prev => prev.filter((_, idx) => idx !== index))
    setAiResult(null)
  }

  // 5. Quick Presets
  const handleAddPreset = (name, category, defaultAmount) => {
    const newItem = {
      id: `preset_${Date.now()}`,
      name,
      amount: defaultAmount,
      category,
      deadline: '',
      notes: '',
      is_recurring: category === 'Housing' || category === 'EMI & Loans'
    }
    setPlannedExpenses(prev => [...prev, newItem])
    setAiResult(null)
  }

  // 6. Import Recurring Commitments
  const handleImportRecurring = () => {
    if (!financialHistory?.recurring_commitments?.length) {
      setImportMessage('No active recurring expenses found in your account records.')
      setTimeout(() => setImportMessage(''), 3000)
      return
    }

    const imported = financialHistory.recurring_commitments.map(rec => ({
      id: `rec_${rec.id || Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: rec.merchant || rec.description || 'Recurring Commitment',
      amount: Number(rec.amount) || 0,
      category: rec.category || 'Bills & Utilities',
      deadline: rec.next_date || '',
      notes: 'Imported fixed monthly commitment',
      is_recurring: true
    }))

    setPlannedExpenses(prev => [...prev, ...imported])
    setImportMessage(t('planner.importedSuccess', { count: imported.length }))
    setAiResult(null)
    setTimeout(() => setImportMessage(''), 3500)
  }

  // 7. Run AI Optimization Engine
  const handleRunAiAnalysis = async () => {
    const budgetNum = parseFloat(availableBudget)
    if (isNaN(budgetNum) || budgetNum <= 0) {
      alert('Please enter a valid available monthly budget')
      return
    }
    if (plannedExpenses.length === 0) {
      alert('Please add at least one planned expense to analyze')
      return
    }

    setAnalyzing(true)
    try {
      const result = await runAiExpensePlanner({
        availableBudget: budgetNum,
        plannedExpenses,
        financialHistory,
        language: i18n.language || language || 'en'
      })
      setAiResult(result)
      // Auto-save plan
      await saveExpensePlan({
        userId: user?.id,
        month: selectedMonth,
        availableBudget: budgetNum,
        plannedExpenses,
        aiAnalysis: result
      })
    } catch (err) {
      alert('Failed to analyze expense plan: ' + err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  // 8. Manual Save
  const handleManualSave = async () => {
    const budgetNum = parseFloat(availableBudget) || 0
    await saveExpensePlan({
      userId: user?.id,
      month: selectedMonth,
      availableBudget: budgetNum,
      plannedExpenses,
      aiAnalysis: aiResult
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  // 9. Export Plan
  const handleExportPlan = () => {
    const exportData = {
      month: selectedMonth,
      exported_at: new Date().toISOString(),
      available_budget: Number(availableBudget),
      planned_expenses: plannedExpenses,
      ai_result: aiResult
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SmartSpend_Expense_Plan_${selectedMonth}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const totalPlannedSum = plannedExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const budgetVal = parseFloat(availableBudget) || 0
  const budgetUsagePct = budgetVal > 0 ? Math.min(100, Math.round((totalPlannedSum / budgetVal) * 100)) : 0

  // Chart data preparation
  const tierPieData = aiResult?.tier_totals ? [
    { name: 'Must Do', value: aiResult.tier_totals['Must Do'] || 0, color: TIER_COLORS['Must Do'] },
    { name: 'Important', value: aiResult.tier_totals['Important'] || 0, color: TIER_COLORS['Important'] },
    { name: 'Reduce', value: aiResult.tier_totals['Reduce'] || 0, color: TIER_COLORS['Reduce'] },
    { name: 'Can Delay', value: aiResult.tier_totals['Can Delay'] || 0, color: TIER_COLORS['Can Delay'] },
    { name: 'Avoid', value: aiResult.tier_totals['Avoid'] || 0, color: TIER_COLORS['Avoid'] }
  ].filter(d => d.value > 0) : []

  const barComparisonData = aiResult ? [
    {
      name: 'Budget vs Spend',
      'Available Budget': aiResult.available_budget,
      'Total Planned': aiResult.total_planned_expenses,
      'Optimized Spend': aiResult.optimized_spending_plan,
      'Emergency Buffer': aiResult.recommended_emergency_buffer
    }
  ] : []

  // Filtered action items for tabs
  const getFilteredItems = () => {
    if (!aiResult?.all_analyzed_expenses) return []
    if (activeTab === 'all') return aiResult.all_analyzed_expenses
    if (activeTab === 'pay_now') return aiResult.all_analyzed_expenses.filter(i => i.priority_tier === 'Must Do' || i.priority_tier === 'Important')
    if (activeTab === 'reduce') return aiResult.all_analyzed_expenses.filter(i => i.priority_tier === 'Reduce')
    if (activeTab === 'postpone') return aiResult.all_analyzed_expenses.filter(i => i.priority_tier === 'Can Delay')
    if (activeTab === 'avoid') return aiResult.all_analyzed_expenses.filter(i => i.priority_tier === 'Avoid')
    return aiResult.all_analyzed_expenses
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t('planner.title', 'Smart Expense Planner')}
                </h1>
              </div>
              <p className="font-inter text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t('planner.subtitle', 'Prioritise your monthly spending, stay within budget, and build your safety net')}
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector & Actions */}
        <div className="flex items-center gap-2.5">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer outline-hidden"
          />

          {aiResult && (
            <button
              onClick={handleExportPlan}
              title={t('planner.exportPlan', 'Export Plan (JSON)')}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleManualSave}
            title={t('planner.savePlan', 'Save Plan')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-xs transition-colors"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4 text-slate-400" />}
            <span>{savedSuccess ? t('common.saved', 'Saved!') : t('planner.savePlan', 'Save')}</span>
          </button>
        </div>
      </div>

      {/* Top Configuration Card: Available Budget & Financial Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Budget Input & Usage Progress */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/80 dark:border-slate-800 card-shadow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t('planner.budget', 'Available Monthly Budget')}
              </label>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Total money allocated to cover this month's expenditure
              </p>
            </div>

            {/* Quick Autofill Shortcuts */}
            <div className="flex items-center gap-1.5">
              {financialHistory?.monthly_income > 0 && (
                <button
                  type="button"
                  onClick={() => setAvailableBudget(String(financialHistory.monthly_income))}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 transition-colors"
                >
                  {t('planner.autofillIncome', 'From Income')}: ₹{financialHistory.monthly_income.toLocaleString('en-IN')}
                </button>
              )}
              {financialHistory?.available_balance > 0 && (
                <button
                  type="button"
                  onClick={() => setAvailableBudget(String(financialHistory.available_balance))}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 transition-colors"
                >
                  {t('planner.autofillBalance', 'From Balance')}: ₹{financialHistory.available_balance.toLocaleString('en-IN')}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={availableBudget}
                onChange={(e) => {
                  setAvailableBudget(e.target.value)
                  setAiResult(null)
                }}
                placeholder={t('planner.budgetPlaceholder', 'Enter available budget')}
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 text-slate-900 dark:text-white font-manrope font-extrabold text-xl outline-hidden focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Budget Utilization Meter */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {t('planner.totalPlanned', 'Total Planned')}: <strong className="font-manrope text-slate-900 dark:text-white">₹{totalPlannedSum.toLocaleString('en-IN')}</strong>
              </span>
              <span className={`font-bold ${budgetUsagePct > 100 ? 'text-rose-600' : budgetUsagePct > 85 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {budgetUsagePct}% of Budget
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  budgetUsagePct > 100 ? 'bg-rose-500' : budgetUsagePct > 85 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, budgetUsagePct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Templates */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6 rounded-[24px] border border-indigo-100/80 dark:border-slate-800 card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {t('planner.quickTemplates', 'Quick Presets')}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                type="button"
                onClick={() => handleAddPreset('House Rent', 'Housing', 18000)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {t('planner.presetRent', '+ House Rent')}
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('Groceries & Supplies', 'Groceries', 6000)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {t('planner.presetGroceries', '+ Groceries')}
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('Electricity Bill', 'Bills & Utilities', 2500)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {t('planner.presetElectricity', '+ Electricity')}
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('Dining & Weekend', 'Food & Dining', 5000)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {t('planner.presetDining', '+ Dining Out')}
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset('Vehicle Loan EMI', 'EMI & Loans', 7500)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {t('planner.presetEmi', '+ Loan EMI')}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-indigo-100/60 dark:border-slate-700">
            <button
              type="button"
              onClick={handleImportRecurring}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-indigo-700 dark:text-indigo-300 font-bold text-xs shadow-2xs transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('planner.importRecurring', 'Import Recurring Commitments')}</span>
            </button>
            {importMessage && (
              <p className="text-[11px] text-center text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                {importMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Planned Expenses List Table & AI Analysis Trigger */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/80 dark:border-slate-800 card-shadow space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-white">
              {t('planner.plannedExpenses', 'Planned Monthly Expenses')}
            </h3>
            <p className="font-inter text-xs text-slate-400 dark:text-slate-500">
              {plannedExpenses.length} items entered • Total ₹{totalPlannedSum.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddModal()}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('planner.addExpense', 'Add Expense')}</span>
            </button>
          </div>
        </div>

        {/* Expenses List */}
        {plannedExpenses.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Wallet className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-inter text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto">
              {t('planner.noExpensesYet', "No planned expenses entered yet. Add items above or click 'Import Recurring Commitments' to begin.")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Title / Merchant</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Deadline</th>
                  <th className="pb-2.5 text-right">Amount</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {plannedExpenses.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.is_recurring && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                            Fixed
                          </span>
                        )}
                        {item.notes && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]" title={item.notes}>
                            • {item.notes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {item.deadline ? (
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {item.deadline}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Flexible</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-manrope font-extrabold text-slate-900 dark:text-white">
                      ₹{Number(item.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openAddModal(idx)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t('common.edit', 'Edit')}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title={t('common.delete', 'Delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Prominent Analyze & Optimize Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>AI optimizes spending, protects emergency reserves, and trims non-essentials</span>
          </div>

          <button
            onClick={handleRunAiAnalysis}
            disabled={analyzing || plannedExpenses.length === 0}
            className="w-full sm:w-auto relative group flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 active:scale-98"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{t('planner.analyzing', 'AI analyzing plan...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{aiResult ? t('planner.reAnalyze', 'Re-Analyze Plan') : t('planner.analyzePlan', 'Analyze & Optimize Plan with AI')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI PLANNER RESULTS DASHBOARD */}
      {aiResult && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Executive Summary Banner */}
          <div className={`p-6 rounded-[24px] border card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            aiResult.budget_status === 'deficit'
              ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
              : 'bg-gradient-to-r from-violet-50 via-indigo-50 to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-indigo-100 dark:border-slate-800 text-slate-800 dark:text-slate-100'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-2xl shrink-0 ${
                aiResult.budget_status === 'deficit'
                  ? 'bg-rose-600 text-white'
                  : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
              }`}>
                {aiResult.budget_status === 'deficit' ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Your Spending Strategy
                </span>
                <p className="text-sm font-medium mt-1 leading-relaxed">
                  {aiResult.executive_summary}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {aiResult.budget_status === 'surplus' ? 'Surplus' : aiResult.budget_status === 'deficit' ? 'Deficit Warning' : 'Tight Margin'}
              </span>
            </div>
          </div>

          {/* 6 Key Optimization Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Available Budget */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 card-shadow">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                {t('planner.budget', 'Available Budget')}
              </span>
              <span className="font-manrope text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                ₹{aiResult.available_budget.toLocaleString('en-IN')}
              </span>
            </div>

            {/* 2. Total Planned */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 card-shadow">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                {t('planner.totalPlanned', 'Total Planned')}
              </span>
              <span className="font-manrope text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                ₹{aiResult.total_planned_expenses.toLocaleString('en-IN')}
              </span>
            </div>

            {/* 3. Optimized Spend */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 card-shadow">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                {t('planner.optimizedSpend', 'Optimized Spend')}
              </span>
              <span className="font-manrope text-base sm:text-lg font-extrabold text-indigo-700 dark:text-indigo-300">
                ₹{aiResult.optimized_spending_plan.toLocaleString('en-IN')}
              </span>
            </div>

            {/* 4. Potential Savings */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 card-shadow">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                {t('planner.potentialSavings', 'Potential Savings')}
              </span>
              <span className="font-manrope text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                +₹{aiResult.total_potential_savings.toLocaleString('en-IN')}
              </span>
            </div>

            {/* 5. Emergency Buffer */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/50 card-shadow">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                {t('planner.emergencyBuffer', 'Emergency Buffer')}
              </span>
              <span className="font-manrope text-base sm:text-lg font-extrabold text-amber-700 dark:text-amber-300">
                ₹{aiResult.recommended_emergency_buffer.toLocaleString('en-IN')}
              </span>
            </div>

            {/* 6. Remaining Surplus */}
            <div className={`p-4 rounded-2xl border card-shadow ${
              aiResult.remaining_surplus >= 0
                ? 'bg-violet-50/70 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/50'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                aiResult.remaining_surplus >= 0 ? 'text-violet-700 dark:text-violet-400' : 'text-rose-700 dark:text-rose-400'
              }`}>
                {t('planner.remainingSurplus', 'Remaining Surplus')}
              </span>
              <span className={`font-manrope text-base sm:text-lg font-extrabold ${
                aiResult.remaining_surplus >= 0 ? 'text-violet-700 dark:text-violet-300' : 'text-rose-700 dark:text-rose-300'
              }`}>
                ₹{aiResult.remaining_surplus.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Visual Breakdown Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Priority Tier Breakdown Pie Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/80 dark:border-slate-800 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-white">
                    {t('planner.tierDistribution', 'Priority Tier Breakdown')}
                  </h3>
                  <p className="font-inter text-xs text-slate-400 dark:text-slate-500">Expense distribution across urgency & necessity</p>
                </div>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={4}
                    >
                      {tierPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`}
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Budget vs Planned vs Optimized Bar Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/80 dark:border-slate-800 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-white">
                    Budget Optimization Comparison
                  </h3>
                  <p className="font-inter text-xs text-slate-400 dark:text-slate-500">Planned expenditure vs AI optimized spend</p>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1E293B' : '#F1F5F9'} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`}
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="Available Budget" fill="#6366F1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Total Planned" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Optimized Spend" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Emergency Buffer" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Action Plan Tabs & Detailed Cards */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/80 dark:border-slate-800 card-shadow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-white">
                  {t('planner.actionPlan', 'Personalized Action Plan')}
                </h3>
                <p className="font-inter text-xs text-slate-400 dark:text-slate-500">
                  Step-by-step guidance on what to pay, reduce, postpone, and avoid
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl overflow-x-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({aiResult.all_analyzed_expenses.length})
                </button>
                <button
                  onClick={() => setActiveTab('pay_now')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'pay_now'
                      ? 'bg-white dark:bg-slate-800 text-rose-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('planner.whatToPayNow', 'Pay Now')} ({aiResult.action_plan.what_to_pay_now.length})
                </button>
                <button
                  onClick={() => setActiveTab('reduce')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'reduce'
                      ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('planner.whatToReduce', 'Reduce')} ({aiResult.action_plan.what_to_reduce.length})
                </button>
                <button
                  onClick={() => setActiveTab('postpone')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'postpone'
                      ? 'bg-white dark:bg-slate-800 text-violet-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('planner.whatToPostpone', 'Postpone')} ({aiResult.action_plan.what_to_postpone.length})
                </button>
                <button
                  onClick={() => setActiveTab('avoid')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'avoid'
                      ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('planner.whatToAvoid', 'Avoid')} ({aiResult.action_plan.what_to_avoid.length})
                </button>
              </div>
            </div>

            {/* List of Actionable Cards */}
            <div className="space-y-3.5">
              {getFilteredItems().map((item, idx) => {
                const tierColor = TIER_COLORS[item.priority_tier] || '#64748B'
                return (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900/60 bg-white dark:bg-slate-800/80 shadow-2xs space-y-3 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tierColor }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {item.name}
                            </h4>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${tierColor}15`,
                                color: tierColor
                              }}
                            >
                              {item.priority_tier}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">
                              • {item.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        {item.priority_tier === 'Reduce' ? (
                          <div className="text-right">
                            <span className="text-slate-400 line-through mr-2">
                              ₹{item.amount.toLocaleString('en-IN')}
                            </span>
                            <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                              ₹{item.recommended_amount.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-emerald-600 block font-bold">
                              Save ₹{item.potential_savings.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : item.priority_tier === 'Can Delay' || item.priority_tier === 'Avoid' ? (
                          <div className="text-right">
                            <span className="text-slate-400 line-through mr-2">
                              ₹{item.amount.toLocaleString('en-IN')}
                            </span>
                            <span className="font-bold text-slate-500 text-sm">
                              ₹0 this month
                            </span>
                            <span className="text-[10px] text-emerald-600 block font-bold">
                              Save ₹{item.amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : (
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rationale & Execution Advice */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p>{item.reason}</p>
                        {item.target_deferral_month && (
                          <span className="inline-block mt-1 font-bold text-[11px] text-violet-600 dark:text-violet-400">
                            {t('planner.targetDeferral', { month: item.target_deferral_month })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingIndex !== null ? t('planner.editExpense', 'Edit Expense') : t('planner.addExpense', 'Add Planned Expense')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveExpenseItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('planner.expenseTitle', 'Expense Title')} *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('planner.expenseTitlePlaceholder', 'e.g. House Rent, Electricity, Dining...')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('planner.amount', 'Amount')} (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-indigo-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('planner.category', 'Category')}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-indigo-600 transition-colors cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('planner.deadline', 'Deadline / Due Date')}
                </label>
                <input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-indigo-600 transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('planner.notes', 'Notes / Context')}
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={t('planner.notesPlaceholder', 'e.g. Landlord penalty, Urgent medication, Flexible sale...')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recCheck"
                  checked={formRecurring}
                  onChange={(e) => setFormRecurring(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="recCheck" className="text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none">
                  {t('planner.isRecurring', 'Recurring commitment (Rent, Bill, EMI)')}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition-colors"
                >
                  {editingIndex !== null ? t('common.save', 'Save Changes') : t('planner.addExpense', 'Add Expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
