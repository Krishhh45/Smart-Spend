import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, Plus, AlertCircle, CheckCircle2, Repeat, X, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

export default function Calendar() {
  const { user } = useAuth()
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading] = useState(true)

  // Add Recurring Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [nextDate, setNextDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    loadRecurring()
  }, [user])

  const loadRecurring = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('next_date', { ascending: true })
    if (data) setRecurring(data)
    setLoading(false)
  }

  const handleAddRecurring = async (e) => {
    e.preventDefault()
    if (!merchant || !amount || !nextDate) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .insert({
          user_id: user.id,
          merchant,
          amount: parseFloat(amount),
          frequency,
          next_date: nextDate,
          confidence: 100.0,
          is_active: true
        })

      if (error) throw error

      setModalOpen(false)
      setMerchant('')
      setAmount('')
      setNextDate('')
      await loadRecurring()
    } catch (err) {
      alert('Failed to add commitment: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Calendar</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor upcoming bills, renewals, EMIs, and recurring commitments
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Commitment</span>
        </button>
      </div>

      {/* Upcoming Commitments Schedule */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 mb-4">Scheduled Obligations</h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading schedule...</div>
        ) : recurring.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span>No recurring bills or subscriptions scheduled yet.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recurring.map((r) => (
              <div key={r.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">{r.merchant}</span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {r.frequency} payment • Next due {r.next_date}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-sm text-slate-900 block">
                    ₹{Number(r.amount).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Commitment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Schedule Recurring Payment</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecurring} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Service or Merchant</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Electricity, Rent"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 649.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cadence</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-hidden focus:border-indigo-600 text-slate-800"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Next Due Date</label>
                <input
                  type="date"
                  required
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-hidden focus:border-indigo-600 text-slate-800"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Recurring Commitment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
