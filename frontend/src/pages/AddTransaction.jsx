import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  Loader2, 
  Upload, 
  Wallet, 
  Calendar, 
  Tag, 
  FileText 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabase'
import { suggestCategory } from '../services/financialEngine'

export default function AddTransaction() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const { showBudgetExceededToast } = useToast()
  const navigate = useNavigate()

  const [type, setType] = useState('expense') // 'expense' | 'income'
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [merchant, setMerchant] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [suggested, setSuggested] = useState(null)
  const [saving, setSaving] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)

  // Load user accounts and categories from Supabase
  useEffect(() => {
    if (!user) return

    const loadFormData = async () => {
      const [catRes, accRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('accounts').select('*').eq('user_id', user.id)
      ])

      if (catRes.data) setCategories(catRes.data)
      if (accRes.data) {
        setAccounts(accRes.data)
        if (accRes.data.length > 0 && !accountId) {
          setAccountId(accRes.data[0].id)
        }
      }
    }

    loadFormData()
  }, [user])

  // Live Smart Category Suggestion as user types description
  useEffect(() => {
    if (description.length >= 3 && categories.length > 0) {
      const match = suggestCategory(description, categories)
      if (match && match.categoryId !== categoryId) {
        setSuggested(match)
      } else {
        setSuggested(null)
      }
    } else {
      setSuggested(null)
    }
  }, [description, categories, categoryId])

  // Receipt Scan Simulator (OCR)
  const handleReceiptUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setOcrLoading(true)
    setTimeout(() => {
      // Mock OCR candidate extraction
      setAmount('1250.00')
      setDescription('Starbucks Coffee & Bagels')
      setMerchant('Starbucks')
      setPaymentMethod('Card')
      
      const match = suggestCategory('Starbucks Coffee', categories)
      if (match) setCategoryId(match.categoryId)

      setOcrLoading(false)
    }, 1200)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount greater than 0.')
      return
    }

    setSaving(true)
    try {
      const parsedAmount = parseFloat(amount)
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: accountId || null,
          category_id: categoryId || null,
          amount: parsedAmount,
          type,
          description: description || merchant || (type === 'income' ? 'Income' : 'Expense'),
          merchant: merchant || description || '',
          payment_method: paymentMethod,
          date,
          notes
        })

      if (error) throw error

      // Check if this expense exceeded the category budget
      if (type === 'expense' && categoryId) {
        try {
          const { data: bData } = await supabase
            .from('budgets')
            .select('limit_amount, categories(name)')
            .eq('user_id', user.id)
            .eq('category_id', categoryId)
            .maybeSingle()

          if (bData && Number(bData.limit_amount) > 0) {
            const currentMonth = date ? date.slice(0, 7) : new Date().toISOString().slice(0, 7)
            const { data: monthTx } = await supabase
              .from('transactions')
              .select('amount')
              .eq('user_id', user.id)
              .eq('category_id', categoryId)
              .eq('type', 'expense')
              .gte('date', `${currentMonth}-01`)

            const totalSpent = (monthTx || []).reduce((s, t) => s + Number(t.amount), 0)
            const limit = Number(bData.limit_amount)
            if (totalSpent >= limit) {
              const catName = bData.categories?.name || 'Category'
              showBudgetExceededToast({
                category: catName,
                spent: totalSpent,
                limit: limit,
                pct: Math.round((totalSpent / limit) * 100),
                remaining: limit - totalSpent
              })
            }
          }
        } catch (bErr) {
          console.warn('Budget check warning:', bErr)
        }
      }

      navigate('/transactions')
    } catch (err) {
      alert('Failed to save transaction: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const expenseCategories = categories.filter(c => c.type === 'expense')
  const incomeCategories = categories.filter(c => c.type === 'income')
  const activeCategories = type === 'expense' ? expenseCategories : incomeCategories

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Activity</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 card-shadow">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-manrope text-xl font-bold text-slate-900 dark:text-white">Add Transaction</h2>
            <p className="font-inter text-xs text-slate-400 dark:text-slate-500 mt-0.5">Quick composer with automated intelligence</p>
          </div>

          {/* Receipt OCR Upload Trigger */}
          <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-100/60 dark:border-indigo-900/40 px-3.5 py-2 rounded-xl transition-all shadow-2xs">
            {ocrLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Scan Receipt (OCR)</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReceiptUpload}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {/* 1. Type Switcher & Big Amount Input */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-[20px] bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            {/* Toggle Expense / Income */}
            <div className="flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 mb-5">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'expense' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'income' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Income
              </button>
            </div>

            <div className="flex items-center justify-center gap-1 w-full">
              <span className="font-manrope text-3xl sm:text-4xl font-extrabold text-slate-400 dark:text-slate-500 select-none">₹</span>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-manrope text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white bg-transparent !bg-transparent border-0 outline-hidden text-center w-48 sm:w-64 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-hidden focus:ring-0"
                style={{ background: 'transparent' }}
              />
            </div>
          </div>

          {/* 2. Description with Smart Category Suggestion */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description or Merchant
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy gourmet dinner, Uber ride, Grocery store"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setMerchant(e.target.value)
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            {/* Smart Suggestion Pill */}
            {suggested && (
              <div className="mt-2.5 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50 flex items-center justify-between text-xs text-violet-800 dark:text-violet-300 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>
                    Suggested Category: <strong>{suggested.categoryName}</strong> ({suggested.confidence}% confidence)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryId(suggested.categoryId)
                    setSuggested(null)
                  }}
                  className="font-bold text-violet-700 dark:text-violet-300 hover:underline bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-violet-200 dark:border-violet-800 cursor-pointer"
                >
                  Use suggestion
                </button>
              </div>
            )}
          </div>

          {/* 3. Category Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Category
            </label>
            <div className="flex flex-wrap gap-2">
              {activeCategories.map((c) => {
                const isSelected = categoryId === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4. Account, Date & Payment Mode Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-hidden focus:border-indigo-600 text-slate-800 dark:text-slate-100"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-hidden focus:border-indigo-600 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-hidden focus:border-indigo-600 text-slate-800 dark:text-slate-100"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          {/* 5. Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Optional Notes</label>
            <textarea
              rows={2}
              placeholder="Tag companions, bill split details, or tags..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-hidden focus:border-indigo-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

