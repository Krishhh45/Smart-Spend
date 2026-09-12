import React, { useState, useEffect } from 'react'
import { FileText, Download, Printer, Calendar, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

export default function Reports() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchTransactions = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('transactions')
        .select(`*, categories (name), accounts (name)`)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      if (data) setTransactions(data)
      setLoading(false)
    }
    fetchTransactions()
  }, [user])

  // Aggregate monthly figures
  const now = new Date()
  const currentMonth = now.toISOString().slice(0, 7)
  const currentMonthTx = transactions.filter(t => t.date && t.date.startsWith(currentMonth))
  const income = currentMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = currentMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const netSavings = Math.max(0, income - expense)
  const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(1) : 0

  // Category breakdown
  const catMap = {}
  currentMonthTx.filter(t => t.type === 'expense').forEach(t => {
    const name = t.categories?.name || 'Other'
    catMap[name] = (catMap[name] || 0) + Number(t.amount)
  })

  // Export to CSV Function
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.')
      return
    }

    const headers = ['Date', 'Description', 'Merchant', 'Category', 'Account', 'Type', 'Amount (INR)', 'Payment Method', 'Notes']
    const rows = transactions.map(t => [
      t.date || '',
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      `"${(t.categories?.name || '').replace(/"/g, '""')}"`,
      `"${(t.accounts?.name || '').replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      t.payment_method || '',
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `SmartSpend_Report_${currentMonth}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">Audit-ready statements and dynamic data exports</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">SmartSpend Monthly Statement</h1>
            <span className="text-xs text-slate-400 block mt-1">
              Statement Period: {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-indigo-600 block">Generated Automatically</span>
            <span className="text-[11px] text-slate-400">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Executive Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Income</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">₹{income.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Expenditure</span>
            <p className="text-xl font-extrabold text-rose-600 mt-1">₹{expense.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Net Savings</span>
            <p className="text-xl font-extrabold text-indigo-700 mt-1">₹{netSavings.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Savings Rate</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{savingsRate}%</p>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Category Breakdown</h3>
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(catMap).map(([name, val]) => (
                  <tr key={name} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{name}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{val.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-4 text-right text-slate-500">
                      {expense > 0 ? Math.round((val / expense) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Disclaimer */}
        <div className="pt-6 border-t border-slate-100 text-xs text-slate-400 text-center">
          <p>This report was generated dynamically from authenticated database records on SmartSpend.</p>
        </div>
      </div>
    </div>
  )
}
