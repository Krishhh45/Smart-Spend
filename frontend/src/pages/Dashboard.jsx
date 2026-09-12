import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  Plus
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { supabase } from '../services/supabase'
import { calculateFinancialHealthScore, predictExpenses } from '../services/financialEngine'

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const { user, profile } = useAuth()
  const { isDark } = useTheme()

  const currentLang = i18n.language || 'en'
  const dateLocale = currentLang === 'mr' ? 'mr-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-US')

  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [recurring, setRecurring] = useState([])
  const [insights, setInsights] = useState([])
  const [chartPeriod, setChartPeriod] = useState('1M')

  // Load all user data dynamically from Supabase
  useEffect(() => {
    if (!user) return

    const loadDashboardData = async () => {
      setLoading(true)
      try {
        // Fetch accounts
        const { data: accData } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)

        // Fetch transactions
        const { data: txData } = await supabase
          .from('transactions')
          .select(`
            *,
            categories (name, icon, color),
            accounts (name, type)
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        // Fetch budgets
        const { data: bData } = await supabase
          .from('budgets')
          .select(`
            *,
            categories (name, color)
          `)
          .eq('user_id', user.id)

        // Fetch recurring
        const { data: rData } = await supabase
          .from('recurring_expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('next_date', { ascending: true })

        // Fetch insights
        const { data: inData } = await supabase
          .from('ai_insights')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)

        setAccounts(accData || [])
        setTransactions(txData || [])
        setBudgets(bData || [])
        setRecurring(rData || [])
        setInsights(inData || [])
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  // Dynamic calculations from real transactions
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0)

  // Current month income & expenses
  const now = new Date()
  const currentMonthPrefix = now.toISOString().slice(0, 7) // 'YYYY-MM'

  const currentMonthTransactions = transactions.filter(t => t.date && t.date.startsWith(currentMonthPrefix))
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const currentMonthExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const currentMonthSavings = Math.max(0, currentMonthIncome - currentMonthExpense)
  const savingsRate = currentMonthIncome > 0 ? ((currentMonthSavings / currentMonthIncome) * 100).toFixed(1) : 0

  // Category breakdown for current month
  const categorySpendMap = {}
  currentMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
    const catName = t.categories?.name || 'Other'
    categorySpendMap[catName] = (categorySpendMap[catName] || 0) + Number(t.amount)
  })

  const rankedCategories = Object.entries(categorySpendMap)
    .map(([name, amount]) => ({
      name,
      amount,
      pct: currentMonthExpense > 0 ? Math.round((amount / currentMonthExpense) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4)

  // Dynamic Financial Health Score
  const healthData = calculateFinancialHealthScore({
    totalIncome: currentMonthIncome,
    totalExpense: currentMonthExpense,
    budgets,
    transactions,
    recurringExpenses: recurring
  })

  // Dynamic Expense Prediction
  const prediction = predictExpenses({
    currentMonthExpenses: currentMonthTransactions.filter(t => t.type === 'expense')
  })

  // Prepare Cash Flow Chart Data
  const chartData = []
  const daysToShow = chartPeriod === '7D' ? 7 : chartPeriod === '1M' ? 30 : chartPeriod === '3M' ? 90 : 365
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(now.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    const dayIncome = transactions
      .filter(t => t.date === dateStr && t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0)
    const dayExpense = transactions
      .filter(t => t.date === dateStr && t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0)

    chartData.push({
      date: label,
      income: dayIncome,
      expense: dayExpense,
      net: dayIncome - dayExpense
    })
  }

  // Group recent transactions
  const recentTransactions = transactions.slice(0, 6)

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-200 rounded-3xl" />
          <div className="h-44 bg-slate-200 rounded-3xl" />
          <div className="h-44 bg-slate-200 rounded-3xl" />
        </div>
        <div className="h-80 bg-slate-200 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {now.getHours() < 12 
              ? t('dashboard.greetingMorning', { name: profile?.full_name?.split(' ')[0] || 'Member', defaultValue: `Good morning, ${profile?.full_name?.split(' ')[0] || 'Member'}` })
              : now.getHours() < 17
              ? t('dashboard.greetingAfternoon', { name: profile?.full_name?.split(' ')[0] || 'Member', defaultValue: `Good afternoon, ${profile?.full_name?.split(' ')[0] || 'Member'}` })
              : t('dashboard.greetingEvening', { name: profile?.full_name?.split(' ')[0] || 'Member', defaultValue: `Good evening, ${profile?.full_name?.split(' ')[0] || 'Member'}` })}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{t('dashboard.subtitle', 'Here is how your money is doing this month.')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-700">
            {now.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })}
          </span>
          <Link
            to="/transactions/add"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('common.addTransaction', 'Add Transaction')}</span>
          </Link>
        </div>
      </div>

      {/* Stitch Aurora 4-Column KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Available Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200/80 dark:border-slate-800 card-shadow transition-all duration-220 hover:scale-[1.01] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-2xl pointer-events-none transition-transform group-hover:scale-125" />
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-inter font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/40">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {currentMonthSavings >= 0 ? `+${savingsRate}%` : `${savingsRate}%`}
            </span>
          </div>
          <div className="relative z-10">
            <p className="font-inter text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard.totalAvailableBalance', 'Total Balance')}</p>
            <h3 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {t('dashboard.acrossAccounts', { count: accounts.length, defaultValue: `across ${accounts.length} accounts` })}
            </p>
          </div>
        </div>

        {/* Card 2: Monthly Income */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200/80 dark:border-slate-800 card-shadow transition-all duration-220 hover:scale-[1.01] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl pointer-events-none transition-transform group-hover:scale-125" />
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-inter font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/40">
              {t('dashboard.credits', 'Credits')}
            </span>
          </div>
          <div className="relative z-10">
            <p className="font-inter text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard.totalIncome', 'Monthly Income')}</p>
            <h3 className="font-manrope text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              +₹{currentMonthIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {t('dashboard.thisMonthSoFar', 'This month so far')}
            </p>
          </div>
        </div>

        {/* Card 3: Monthly Expenses */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200/80 dark:border-slate-800 card-shadow transition-all duration-220 hover:scale-[1.01] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-2xl pointer-events-none transition-transform group-hover:scale-125" />
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-inter font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-rose-200/60 dark:border-rose-800/40">
              {t('dashboard.debits', 'Debits')}
            </span>
          </div>
          <div className="relative z-10">
            <p className="font-inter text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard.totalExpenses', 'Monthly Expenses')}</p>
            <h3 className="font-manrope text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              -₹{currentMonthExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {currentMonthTransactions.filter(t => t.type === 'expense').length} {t('nav.transactions', 'transactions')}
            </p>
          </div>
        </div>

        {/* Card 4: Financial Health Score */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200/80 dark:border-slate-800 card-shadow transition-all duration-220 hover:scale-[1.01] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-2xl pointer-events-none transition-transform group-hover:scale-125" />
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-inter font-bold text-xs px-2.5 py-1 rounded-full border border-violet-200/60 dark:border-violet-800/40">
              {healthData.rating === 'Healthy' ? t('dashboard.healthy', 'Healthy') : healthData.rating === 'Fair' ? t('dashboard.fair', 'Fair') : t('dashboard.needsAttention', 'Alert')}
            </span>
          </div>
          <div className="relative z-10">
            <p className="font-inter text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard.financialHealth', 'Health Score')}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="font-manrope text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {healthData.score}
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {t('dashboard.savingsRate', 'Savings rate')}: <strong className="text-slate-700 dark:text-slate-300">{savingsRate}%</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Row: Cash Flow Chart & Category Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cash Flow Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/80 dark:border-slate-800 card-shadow transition-all duration-220">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-white">{t('dashboard.cashFlowTimeline', 'Cash Flow Timeline')}</h3>
              <p className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('dashboard.timelineSubtitle', 'See how your money moves, day by day')}</p>
            </div>
            {/* Time Period Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              {['7D', '1M', '3M', '1Y'].map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    chartPeriod === p
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1E293B' : '#F1F5F9'} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name === 'income' ? t('dashboard.income', 'Income') : t('dashboard.expense', 'Expense')]}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Top Category Spending Progress Bars */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/80 dark:border-slate-800 card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-white">{t('dashboard.spendingByCategory', 'Spending by Category')}</h3>
              <Link to="/analytics" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                {t('common.viewAll', 'View All')}
              </Link>
            </div>

            {rankedCategories.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-10 text-center">{t('dashboard.noExpensesPeriod', 'No expense activity in this period')}</p>
            ) : (
              <div className="space-y-4">
                {rankedCategories.map((c) => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-manrope font-bold text-slate-900 dark:text-white">₹{c.amount.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 w-8 text-right font-medium">{c.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-700"
                        style={{ width: `${c.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/budget"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <span>{t('dashboard.manageBudgets', 'Manage Category Budgets')}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Third Row: SmartSpend AI Insights, Upcoming Commitments & Recent Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. SmartSpend AI Insight Card */}
        <div className="bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-white dark:from-violet-950/20 dark:via-indigo-950/10 dark:to-slate-900 p-6 rounded-[24px] border border-violet-200/70 dark:border-violet-900/50 card-shadow flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-600/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-violet-800 dark:text-violet-300">
                {t('dashboard.smartSpendInsight', 'Money Tip')}
              </span>
            </div>

            {insights.length > 0 ? (
              <div>
                <h4 className="font-manrope font-bold text-slate-900 dark:text-white text-sm mb-2">{insights[0].title}</h4>
                <p className="font-inter text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{insights[0].explanation}</p>
              </div>
            ) : (
              <div>
                <h4 className="font-manrope font-bold text-slate-900 dark:text-white text-sm mb-2">{t('dashboard.defaultInsightTitle', 'Weekend Spending Pattern')}</h4>
                <p className="font-inter text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('dashboard.defaultInsightDesc', 'Your weekend food & dining spending is approximately 31% higher than your weekday baseline. Capping this could yield ~₹1,800/month extra savings.')}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-4 mt-6 border-t border-violet-100 dark:border-slate-800 relative z-10">
            <Link
              to="/planner"
              className="flex-1 text-center text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 py-2.5 rounded-xl transition-all shadow-xs"
            >
              {t('nav.expensePlanner', 'Expense Planner')}
            </Link>
            <Link
              to="/assistant"
              className="flex-1 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 py-2.5 rounded-xl transition-all"
            >
              {t('dashboard.askSmartSpend', 'Get Help')}
            </Link>
          </div>
        </div>

        {/* 2. Upcoming Obligations / Subscriptions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/80 dark:border-slate-800 card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-white">{t('dashboard.upcomingPayments', 'Upcoming Payments')}</h3>
              <Link to="/calendar" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                {t('nav.calendar', 'Calendar')}
              </Link>
            </div>

            {recurring.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-8 text-center">{t('dashboard.noUpcomingPayments', 'No upcoming commitments scheduled')}</p>
            ) : (
              <div className="space-y-3">
                {recurring.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">{r.merchant}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{t('dashboard.due', 'Due')}: {r.next_date}</span>
                    </div>
                    <span className="font-manrope text-xs font-bold text-slate-900 dark:text-white">₹{Number(r.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('dashboard.totalRecurringCommitments', 'Total monthly commitments')}: <strong className="font-manrope text-slate-800 dark:text-slate-200">₹{recurring.reduce((s, r) => s + Number(r.amount), 0).toLocaleString('en-IN')}</strong>
            </span>
          </div>
        </div>

        {/* 3. Recent Transactions Timeline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/80 dark:border-slate-800 card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-white">{t('dashboard.recentTransactions', 'Recent Activity')}</h3>
              <Link to="/transactions" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                {t('common.viewAll', 'View All')}
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-8 text-center">{t('dashboard.noTransactionsRecorded', 'No transactions recorded yet')}</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{t.description || t.merchant || 'Transaction'}</p>
                        {t.payment_method && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                            {t.payment_method}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{t.categories?.name || t.type} • {t.date}</span>
                    </div>
                    <span className={`font-manrope font-bold shrink-0 ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/transactions"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 py-1"
            >
              <span>{t('dashboard.exploreAllTransactions', 'Explore all transactions')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
