import React, { useState, useEffect } from 'react'
import { Wallet, Plus, CreditCard, Landmark, DollarSign, ArrowUpRight, ArrowDownRight, X, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

export default function Accounts() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  // Add Account Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('bank')
  const [institution, setInstitution] = useState('')
  const [mask, setMask] = useState('')
  const [balance, setBalance] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    loadAccounts()
  }, [user])

  const loadAccounts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    if (data) setAccounts(data)
    setLoading(false)
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    if (!name || balance === '') return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name,
          type,
          institution: institution || name,
          account_number_mask: mask ? `•••• ${mask.slice(-4)}` : '•••• 0000',
          balance: parseFloat(balance),
          currency: 'INR'
        })

      if (error) throw error

      setModalOpen(false)
      setName('')
      setInstitution('')
      setMask('')
      setBalance('')
      await loadAccounts()
    } catch (err) {
      alert('Failed to create account: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Net Worth Calculation: Total Assets - Liabilities
  const assets = accounts.filter(a => Number(a.balance) > 0).reduce((s, a) => s + Number(a.balance), 0)
  const liabilities = accounts.filter(a => Number(a.balance) < 0).reduce((s, a) => s + Math.abs(Number(a.balance)), 0)
  const netWorth = assets - liabilities

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Money Sources</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage bank accounts, cards, UPI wallets, and investments</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Net Worth Summary Row */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <span className="text-xs font-semibold text-slate-400 block">Consolidated Net Worth</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">₹{netWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">Assets minus obligations</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 block">Total Liquid & Asset Balances</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">₹{assets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Savings, Cash & Demat</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 block">Total Credit Balances Due</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">₹{liabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Cards & Unsettled credit</span>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => {
          const bal = Number(acc.balance)
          return (
            <div
              key={acc.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    {acc.type === 'credit_card' ? <CreditCard className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {acc.type.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{acc.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{acc.institution || 'Financial Institution'}</p>
                <span className="text-xs text-slate-500 font-mono mt-2 block">{acc.account_number_mask || '•••• ••••'}</span>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Balance</span>
                <span className={`text-xl font-extrabold ${bal < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  ₹{bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Financial Account</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Salary, ICICI Card, Zerodha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-hidden focus:border-indigo-600 text-slate-800"
                >
                  <option value="bank">Bank / Savings Account</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="investment">Investment / Demat</option>
                  <option value="cash">Cash / Physical Wallet</option>
                  <option value="other">Other Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Institution</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, SBI, Zerodha"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last 4 Digits</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 2841"
                  value={mask}
                  onChange={(e) => setMask(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 42500 (or negative for credit card due)"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
