import React, { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts'
import { 
  TrendingUp, 
  Calendar, 
  Tag, 
  PieChart as PieIcon, 
  BarChart3, 
  Zap,
  Info 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

export default function Analytics() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30D')

  useEffect(() => {
    if (!user) return
    const fetchTx = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('transactions')
        .select(`*, categories (name, color)`)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      if (data) setTransactions(data)
      setLoading(false)
    }
    fetchTx()
  }, [user])

  const expenses = transactions.filter(t => t.type === 'expense')
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0)
  const avgTx = expenses.length > 0 ? Math.round(totalExpense / expenses.length) : 0

  // Category Distribution for Donut Chart
  const categoryMap = {}
  expenses.forEach(t => {
    const name = t.categories?.name || 'Other'
    categoryMap[name] = (categoryMap[name] || 0) + Number(t.amount)
  })

  const COLORS = ['#4F46E5', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#84CC16']
  const categoryChartData = Object.entries(categoryMap)
    .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
    .sort((a, b) => b.value - a.value)

  const highestCategory = categoryChartData[0]?.name || 'N/A'

  // Day of Week Distribution
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const daySpendMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  expenses.forEach(t => {
    if (t.date) {
      const dayIdx = new Date(t.date).getDay()
      daySpendMap[dayIdx] += Number(t.amount)
    }
  })

  const dayOfWeekData = daysOfWeek.map((day, idx) => ({
    day: day.slice(0, 3),
    amount: Math.round(daySpendMap[idx])
  }))

  const maxDayIdx = Object.keys(daySpendMap).reduce((a, b) => daySpendMap[a] > daySpendMap[b] ? a : b, 0)
  const mostExpensiveDay = daysOfWeek[maxDayIdx]

  // GitHub-style Spending Heatmap (Last 28 days / 4 weeks)
  const heatmapDays = []
  const today = new Date()
  for (let i = 27; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const daySpend = expenses
      .filter(t => t.date === dateStr)
      .reduce((s, t) => s + Number(t.amount), 0)

    let intensity = 0
    if (daySpend > 5000) intensity = 4
    else if (daySpend > 2000) intensity = 3
    else if (daySpend > 800) intensity = 2
    else if (daySpend > 0) intensity = 1

    heatmapDays.push({ date: dateStr, amount: daySpend, intensity })
  }

  const intensityColors = [
    'bg-slate-100', // 0: none
    'bg-indigo-200', // 1: light
    'bg-indigo-400', // 2: medium
    'bg-indigo-600', // 3: high
    'bg-indigo-800'  // 4: very high
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">Understand your spending behavior and historical patterns</p>
      </div>

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block">Average Expense</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{avgTx.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">per recorded transaction</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block">Top Spending Category</span>
          <p className="text-xl font-extrabold text-indigo-600 mt-1 truncate">{highestCategory}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">highest volume contributor</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block">Peak Spending Day</span>
          <p className="text-xl font-extrabold text-violet-600 mt-1">{mostExpensiveDay}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">higher average activity</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block">Recorded Transactions</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{expenses.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Dynamic DB audit</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Donut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900">Category Distribution</h3>
            <span className="text-xs font-semibold text-slate-400">Total: ₹{totalExpense.toLocaleString('en-IN')}</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryChartData.length === 0 ? (
              <p className="text-xs text-slate-400">No expense records found</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Legend */}
          <div className="grid grid-cols-2 gap-2 pt-4 mt-2 border-t border-slate-100 text-xs">
            {categoryChartData.slice(0, 6).map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="truncate text-slate-600">{c.name}</span>
                <span className="font-bold text-slate-900 ml-auto">₹{c.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day-of-Week Spending Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Spending by Day of Week</h3>
              <span className="text-xs font-semibold text-slate-400">Weekly Habit Pattern</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']}
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
            Insights indicate peak spending typically clusters on <strong>{mostExpensiveDay}</strong>.
          </div>
        </div>
      </div>

      {/* Spending Heatmap (GitHub-style visual density) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Daily Spending Heatmap</h3>
            <p className="text-xs text-slate-400">Visual density of expense activity over the last 4 weeks</p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Less</span>
            {intensityColors.map((c, i) => (
              <div key={i} className={`w-3.5 h-3.5 rounded-xs ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
          {heatmapDays.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ₹${day.amount.toLocaleString('en-IN')}`}
              className={`h-10 rounded-xl ${intensityColors[day.intensity]} flex flex-col items-center justify-center text-[10px] font-semibold text-slate-700 transition-transform hover:scale-105 cursor-pointer shadow-2xs`}
            >
              <span>{day.date.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
