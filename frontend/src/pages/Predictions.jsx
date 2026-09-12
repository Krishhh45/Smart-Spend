import React, { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck, Sliders, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { supabase } from '../services/supabase'
import { predictExpenses, simulateWhatIf, calculateFinancialHealthScore } from '../services/financialEngine'

export default function Predictions() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { t } = useTranslation()

  const [transactions, setTransactions] = useState([])
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading] = useState(true)

  // What-If Simulator State
  const [reductionPct, setReductionPct] = useState(20)
  const [cancelSubs, setCancelSubs] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const [txRes, rRes] = await Promise.all([
          supabase.from('transactions').select('*').eq('user_id', user.id),
          supabase.from('recurring_expenses').select('*').eq('user_id', user.id)
        ])

        if (txRes.data) setTransactions(txRes.data)
        if (rRes.data) setRecurring(rRes.data)
      } catch (err) {
        console.error('Error fetching prediction data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const now = new Date()
  const currentMonthPrefix = now.toISOString().slice(0, 7)
  const currentMonthExpenses = transactions.filter(
    t => t.type === 'expense' && t.date && t.date.startsWith(currentMonthPrefix)
  )
  const currentMonthIncome = transactions
    .filter(t => t.type === 'income' && t.date && t.date.startsWith(currentMonthPrefix))
    .reduce((s, t) => s + Number(t.amount || 0), 0)

  const currentTotal = currentMonthExpenses.reduce((s, t) => s + Number(t.amount || 0), 0)

  // Compute past months totals for historical moving average
  const pastMonthsTotals = []
  for (let m = 1; m <= 3; m++) {
    const pastDate = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const prefix = pastDate.toISOString().slice(0, 7)
    const monthSum = transactions
      .filter(t => t.type === 'expense' && t.date && t.date.startsWith(prefix))
      .reduce((s, t) => s + Number(t.amount || 0), 0)
    if (monthSum > 0) {
      pastMonthsTotals.push(monthSum)
    }
  }

  const prediction = predictExpenses({ 
    currentMonthExpenses, 
    pastMonthsTotals 
  })

  const baseHealth = calculateFinancialHealthScore({
    totalIncome: currentMonthIncome,
    totalExpense: currentTotal
  })

  // Digital subscription savings calculation
  const subExpenses = recurring.filter(r => 
    r.merchant?.toLowerCase().includes('netflix') || 
    r.merchant?.toLowerCase().includes('spotify') ||
    r.merchant?.toLowerCase().includes('prime') ||
    r.merchant?.toLowerCase().includes('hotstar')
  )
  const subSavings = cancelSubs ? subExpenses.reduce((s, r) => s + Number(r.amount || 0), 0) : 0

  const simulation = simulateWhatIf({
    currentMonthlyExpense: currentTotal,
    categorySpend: currentTotal * 0.4, // discretionary spend estimate
    reductionPercentage: reductionPct,
    cancelledSubscriptionsCost: subSavings,
    currentHealthScore: baseHealth.score
  })

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const currentDay = now.getDate()

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Calculating predictions & forecasting burn rate...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Predictive AI Intelligence</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Where is your money heading?</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Proactive forecasting and non-destructive decision simulation
        </p>
      </div>

      {/* Main Forecast Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 card-shadow transition-colors">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Current Spent This Month</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">₹{currentTotal.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">Day {now.getDate()} of {daysInMonth}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-violet-200 dark:border-violet-900/60 card-shadow bg-gradient-to-br from-violet-50/50 to-white dark:from-violet-950/20 dark:to-slate-900 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300">Predicted Month-End Burn</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
              {(prediction.confidence || 'LOW').toUpperCase()} CONFIDENCE
            </span>
          </div>
          <p className="text-3xl font-extrabold text-violet-700 dark:text-violet-400 mt-2">
            ₹{(prediction.projectedCurrentMonth || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            {(prediction.dailyBurnRate || 0) > 0
              ? `Based on current ₹${(prediction.dailyBurnRate || 0).toLocaleString('en-IN')}/day burn rate`
              : 'Add more transactions to calculate burn rate'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 card-shadow transition-colors">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">Expected Next Month Outflow</span>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            ₹{(prediction.projectedNextMonth || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            ~₹{Math.max(0, currentMonthIncome - (prediction.projectedNextMonth || 0)).toLocaleString('en-IN')} projected surplus
          </span>
        </div>
      </div>

      {/* Forecast Timeline */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 card-shadow transition-colors">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Expenditure Projection Timeline</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Estimated forward obligations and typical discretionary pacing</p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Today</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">₹{currentTotal.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Actual recorded to date</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Next 7 Days</span>
            <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              +₹{((prediction.dailyBurnRate || 0) * 7).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Expected routine burn</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">End of Month</span>
            <p className="text-xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">
              ₹{(prediction.projectedCurrentMonth || 0).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Predicted monthly finish</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Next 3 Months</span>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
              ₹{((prediction.projectedNextMonth || 0) * 3).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Quarterly commitment volume</span>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <span>
            Predictions are dynamic statistical estimates based on your past transactions and confirmed recurring obligations. They do not constitute regulated investment advice.
          </span>
        </div>
      </div>

      {/* What-If Financial Decision Simulator */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 card-shadow transition-colors">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">What-If Decision Simulator</h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
          Test hypothetical budget cuts non-destructively without altering your actual database records
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>Reduce Discretionary Spending by</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-sm font-extrabold">{reductionPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={reductionPct}
                onChange={(e) => setReductionPct(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                <span>0% (No change)</span>
                <span>25%</span>
                <span>50% (Max cut)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Cancel Idle Subscriptions</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Streaming & digital renewals (~₹{subExpenses.reduce((s, r) => s + Number(r.amount || 0), 0) || 828}/mo)
                </span>
              </div>
              <input
                type="checkbox"
                checked={cancelSubs}
                onChange={(e) => setCancelSubs(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Outcome Simulation Card */}
          <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-center space-y-4">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Projected Scenario Impact</span>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-indigo-950 dark:text-indigo-100 block">
                +₹{(simulation.monthlySavings || 0).toLocaleString('en-IN')}/mo
              </span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                Potential +₹{(simulation.annualSavings || 0).toLocaleString('en-IN')} annual savings
              </span>
            </div>

            <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/50 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">New Monthly Burn</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">₹{(simulation.newMonthlyExpense || 0).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Projected Health Score</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{simulation.projectedHealthScore || 70} / 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
