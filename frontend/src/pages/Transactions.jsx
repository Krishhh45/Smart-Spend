import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  Edit3, 
  X, 
  AlertTriangle,
  Receipt,
  Calendar,
  Wallet,
  Tag,
  Loader2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { detectAnomaly } from '../services/financialEngine'

export default function Transactions() {
  const { user } = useAuth()

  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedAccount, setSelectedAccount] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')
  const [viewMode, setViewMode] = useState('timeline') // 'timeline' | 'table'

  // Detail Drawer
  const [selectedTx, setSelectedTx] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [txRes, catRes, accRes] = await Promise.all([
        supabase
          .from('transactions')
          .select(`
            *,
            categories (id, name, color, icon),
            accounts (id, name, type)
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase.from('categories').select('*'),
        supabase.from('accounts').select('*').eq('user_id', user.id)
      ])

      setTransactions(txRes.data || [])
      setCategories(catRes.data || [])
      setAccounts(accRes.data || [])
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this transaction? Dependent summaries and account balances will be updated automatically.')) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setTransactions(prev => prev.filter(t => t.id !== id))
      setSelectedTx(null)
    } catch (err) {
      alert('Failed to delete transaction: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  // Filtered transactions
  const filtered = transactions.filter(t => {
    const descMatch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (t.merchant || '').toLowerCase().includes(searchTerm.toLowerCase())
    const catMatch = selectedCategory === 'ALL' || t.category_id === selectedCategory
    const accMatch = selectedAccount === 'ALL' || t.account_id === selectedAccount
    const typeMatch = selectedType === 'ALL' || t.type === selectedType

    return descMatch && catMatch && accMatch && typeMatch
  })

  // Group by relative dates for Timeline view
  const groupTimeline = () => {
    const groups = {}
    filtered.forEach(t => {
      const d = t.date || 'Unknown'
      if (!groups[d]) groups[d] = []
      groups[d].push(t)
    })
    return groups
  }

  const timelineGroups = groupTimeline()

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Money Activity</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit log of all financial transactions</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'timeline' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Table View
            </button>
          </div>

          <Link
            to="/transactions/add"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search merchant or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-hidden focus:border-indigo-600"
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-hidden focus:border-indigo-600 text-slate-700"
        >
          <option value="ALL">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Account Dropdown */}
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-hidden focus:border-indigo-600 text-slate-700"
        >
          <option value="ALL">All Accounts</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-hidden focus:border-indigo-600 text-slate-700"
        >
          <option value="ALL">All Types</option>
          <option value="expense">Expenses Only</option>
          <option value="income">Income Only</option>
        </select>
      </div>

      {/* Main Transactions View */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading transactions from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center max-w-lg mx-auto">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 text-base">No transactions found</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {searchTerm || selectedCategory !== 'ALL'
              ? 'Try clearing your filters to see more activity.'
              : 'Add your first transaction and SmartSpend will begin understanding your spending.'}
          </p>
          <Link
            to="/transactions/add"
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl mt-5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Link>
        </div>
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="space-y-6">
          {Object.entries(timelineGroups).map(([date, txs]) => (
            <div key={date} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{date}</span>
                <span className="text-xs font-semibold text-slate-500">
                  {txs.length} {txs.length === 1 ? 'transaction' : 'transactions'}
                </span>
              </div>

              <div className="divide-y divide-slate-50">
                {txs.map(t => {
                  const anomaly = t.type === 'expense' ? detectAnomaly(t, transactions) : null
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTx({ ...t, anomaly })}
                      className="py-3 px-2 flex items-center justify-between rounded-xl hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {t.description || t.merchant || 'Transaction'}
                            </p>
                            {anomaly?.isAnomaly && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded-full">
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                Unusual
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {t.categories?.name || 'Uncategorized'} • {t.accounts?.name || 'Main Account'} • {t.payment_method || 'Direct'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-extrabold ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Account</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(t => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTx(t)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">{t.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 truncate max-w-xs">
                      {t.description || t.merchant || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{t.categories?.name || 'General'}</td>
                    <td className="py-3 px-4 text-slate-500">{t.accounts?.name || 'Default'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        t.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-extrabold whitespace-nowrap ${
                      t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(t.id)
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Drawer (Right panel on desktop, bottom sheet on mobile) */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transaction Details</span>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount Display */}
              <div className="py-6 text-center border-b border-slate-100">
                <span className={`text-3xl font-extrabold ${
                  selectedTx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                }`}>
                  {selectedTx.type === 'income' ? '+' : '-'}₹{Number(selectedTx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-sm font-semibold text-slate-800 mt-1">{selectedTx.description || selectedTx.merchant}</p>
                <span className="text-xs text-slate-400">{selectedTx.date}</span>
              </div>

              {/* Anomaly Explanation Alert (if triggered) */}
              {selectedTx.anomaly?.isAnomaly && (
                <div className="my-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/80">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-900">Unusual Spending Detected</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">{selectedTx.anomaly.reason}</p>
                  <span className="text-[10px] text-amber-600 mt-2 block">
                    Confidence: {selectedTx.anomaly.confidence}% based on historical category spending
                  </span>
                </div>
              )}

              {/* Field Metadata List */}
              <div className="py-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" /> Category
                  </span>
                  <span className="font-semibold text-slate-800">{selectedTx.categories?.name || 'General'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5" /> Account
                  </span>
                  <span className="font-semibold text-slate-800">{selectedTx.accounts?.name || 'Default Account'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Date Recorded
                  </span>
                  <span className="font-semibold text-slate-800">{selectedTx.date}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Payment Mode</span>
                  <span className="font-semibold text-slate-800">{selectedTx.payment_method || 'UPI/Transfer'}</span>
                </div>

                {selectedTx.notes && (
                  <div className="pt-2">
                    <span className="text-slate-400 block mb-1">Notes</span>
                    <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">{selectedTx.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delete Action */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => handleDelete(selectedTx.id)}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 py-2.5 rounded-xl transition-colors"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete Transaction</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
