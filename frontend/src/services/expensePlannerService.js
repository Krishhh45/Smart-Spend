import { supabase } from './supabase'

const API_BASE_URL = 'http://127.0.0.1:5000/api/v1'

/**
 * Gathers authentic user financial history from Supabase:
 * - 90 days of transactions for category spend baselines
 * - Active recurring commitments
 * - Total available balance from accounts
 */
export async function fetchUserFinancialContext(userId) {
  if (!userId) {
    return {
      monthly_income: 0,
      available_balance: 0,
      past_expenses: [],
      recurring_commitments: []
    }
  }

  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const [txRes, recRes, accRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('id, amount, type, date, category_id, description, merchant, categories(name)')
        .eq('user_id', userId)
        .gte('date', ninetyDaysAgo),
      supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true),
      supabase
        .from('accounts')
        .select('id, name, balance')
        .eq('user_id', userId)
    ])

    const transactions = txRes.data || []
    const recurring = recRes.data || []
    const accounts = accRes.data || []

    const available_balance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0)

    // Calculate approximate monthly income from last 90 days / 3
    const incomeTransactions = transactions.filter(t => t.type === 'income')
    const total90DayIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const monthly_income = total90DayIncome > 0 ? Math.round(total90DayIncome / 3) : 0

    // Past expense summary with category names
    const past_expenses = transactions
      .filter(t => t.type === 'expense')
      .map(t => ({
        amount: Number(t.amount),
        category: t.categories?.name || t.description || 'General',
        date: t.date
      }))

    return {
      monthly_income,
      available_balance,
      past_expenses,
      recurring_commitments: recurring
    }
  } catch (err) {
    console.warn('Could not fetch complete financial context from Supabase:', err)
    return {
      monthly_income: 0,
      available_balance: 0,
      past_expenses: [],
      recurring_commitments: []
    }
  }
}

/**
 * Calls backend AI Priority-Based Expense Planner or falls back to local engine.
 */
export async function runAiExpensePlanner({
  availableBudget,
  plannedExpenses,
  financialHistory,
  language = 'en'
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/expense-planner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        available_budget: Number(availableBudget) || 0,
        planned_expenses: plannedExpenses || [],
        financial_history: financialHistory || {},
        language
      })
    })

    const data = await res.json()
    if (data?.success && data?.data) {
      return data.data
    }
    throw new Error(data?.error || 'Backend analysis failed')
  } catch (err) {
    console.warn('Backend AI Planner request failed or offline, using robust client-side AI engine:', err)
    return runClientSidePlannerFallback({
      availableBudget,
      plannedExpenses,
      financialHistory,
      language
    })
  }
}

/**
 * Client-side mirror calculation engine if Flask backend is offline.
 */
function runClientSidePlannerFallback({
  availableBudget,
  plannedExpenses,
  financialHistory,
  language = 'en'
}) {
  const budget = Number(availableBudget) || 0
  const buffer = Math.round(Math.min(budget * 0.15, Math.max(1000, budget * 0.10)))

  const ESSENTIALS = ['housing', 'rent', 'mortgage', 'bills', 'electricity', 'water', 'gas', 'groceries', 'health', 'medicine', 'emi', 'loan', 'insurance']
  const DISCRETIONARY = ['dining', 'food', 'restaurant', 'shopping', 'clothing', 'personal care', 'fitness']
  const LUXURY = ['entertainment', 'streaming', 'gaming', 'travel', 'vacation', 'luxury', 'gadget']

  const analyzed = plannedExpenses.map(item => {
    const amount = Number(item.amount) || 0
    const cat = (item.category || '').toLowerCase()
    const name = (item.name || '').toLowerCase()
    const notes = (item.notes || '').toLowerCase()

    let tier = 'Important'
    let action = 'pay_now'
    let recAmount = amount
    let savings = 0
    let reason = ''

    if (ESSENTIALS.some(e => cat.includes(e) || name.includes(e)) || notes.includes('urgent') || notes.includes('mandatory')) {
      tier = 'Must Do'
      action = 'pay_now'
      reason = language === 'mr' 
        ? `अत्यावश्यक प्राथमिक खर्च (${item.category}). सेवा खंड किंवा दंड टाळण्यासाठी वेळेत पूर्ण भरा.`
        : language === 'hi'
        ? `अनिवार्य प्राथमिक व्यय (${item.category})। किसी भी रुकावट या दंड से बचने के लिए इसे पूर्ण भरें।`
        : `Essential baseline obligation (${item.category}). Pay in full on time to avoid disruption or penalties.`
    } else if (notes.includes('can wait') || notes.includes('later') || LUXURY.some(l => cat.includes(l) || name.includes(l))) {
      tier = 'Can Delay'
      action = 'postpone'
      recAmount = 0
      savings = amount
      reason = language === 'mr'
        ? `हा खर्च पुढील महिन्यापर्यंत पुढे ढकलणे सुरक्षित असून चालू शिल्लक वाढवेल.`
        : language === 'hi'
        ? `इस व्यय को अगले महीने तक सुरक्षित रूप से टाला जा सकता है, जिससे वर्तमान बजट सुरक्षित रहेगा।`
        : `Safe to postpone by 30-60 days with zero penalty, protecting your immediate cash cushion.`
    } else if (DISCRETIONARY.some(d => cat.includes(d) || name.includes(d))) {
      tier = 'Reduce'
      action = 'reduce'
      savings = Math.round(amount * 0.35)
      recAmount = amount - savings
      reason = language === 'mr'
        ? `ऐच्छिक खर्च. हा ₹${recAmount.toLocaleString('en-IN')} पर्यंत मर्यादित केल्यास ₹${savings.toLocaleString('en-IN')} बचत होईल.`
        : language === 'hi'
        ? `विवेकाधीन व्यय। इसे ₹${recAmount.toLocaleString('en-IN')} तक सीमित करने से ₹${savings.toLocaleString('en-IN')} की बचत होगी।`
        : `Discretionary spend. Capping at ₹${recAmount.toLocaleString('en-IN')} saves ₹${savings.toLocaleString('en-IN')}.`
    } else if (amount > budget * 0.3 && budget > 0) {
      tier = 'Avoid'
      action = 'avoid'
      recAmount = 0
      savings = amount
      reason = language === 'mr'
        ? `हा खर्च बजेटचा मोठा हिस्सा घेतो, तो टाळणे सुरक्षित ठरेल.`
        : language === 'hi'
        ? `यह व्यय बजट पर भारी दबाव डालता है, इसे अभी छोड़ना बेहतर है।`
        : `High strain on budget. Eliminating this protects your emergency reserve.`
    } else {
      tier = 'Important'
      action = 'schedule'
      reason = language === 'mr'
        ? `महत्त्वाचा खर्च. अत्यावश्यक देयकांनंतर याला निधी द्या.`
        : language === 'hi'
        ? `महत्वपूर्ण व्यय। आवश्यक खर्चों के बाद इसे बजट में शामिल करें।`
        : `High-utility expense. Fund after baseline essentials.`
    }

    return {
      id: item.id,
      name: item.name,
      amount,
      category: item.category,
      deadline: item.deadline,
      notes: item.notes,
      priority_tier: tier,
      action_type: action,
      recommended_amount: recAmount,
      potential_savings: savings,
      reason
    }
  })

  const mustDo = analyzed.filter(i => i.priority_tier === 'Must Do')
  const important = analyzed.filter(i => i.priority_tier === 'Important')
  const reduce = analyzed.filter(i => i.priority_tier === 'Reduce')
  const canDelay = analyzed.filter(i => i.priority_tier === 'Can Delay')
  const avoid = analyzed.filter(i => i.priority_tier === 'Avoid')

  const totalPlanned = analyzed.reduce((s, i) => s + i.amount, 0)
  const totalOptimized = mustDo.reduce((s, i) => s + i.amount, 0)
    + important.reduce((s, i) => s + i.amount, 0)
    + reduce.reduce((s, i) => s + i.recommended_amount, 0)
  const totalSavings = totalPlanned - totalOptimized
  const remaining = budget - totalOptimized - buffer

  return {
    available_budget: budget,
    total_planned_expenses: totalPlanned,
    optimized_spending_plan: totalOptimized,
    total_potential_savings: totalSavings,
    recommended_emergency_buffer: buffer,
    remaining_surplus: remaining,
    budget_status: remaining >= 0 ? 'surplus' : 'deficit',
    tier_counts: {
      'Must Do': mustDo.length,
      'Important': important.length,
      'Can Delay': canDelay.length,
      'Reduce': reduce.length,
      'Avoid': avoid.length
    },
    tier_totals: {
      'Must Do': mustDo.reduce((s, i) => s + i.amount, 0),
      'Important': important.reduce((s, i) => s + i.amount, 0),
      'Can Delay': canDelay.reduce((s, i) => s + i.amount, 0),
      'Reduce': reduce.reduce((s, i) => s + i.amount, 0),
      'Avoid': avoid.reduce((s, i) => s + i.amount, 0)
    },
    executive_summary: language === 'mr'
      ? `योजना यशस्वीरीत्या अनुकूलित झाली. ₹${totalSavings.toLocaleString('en-IN')} बचत साध्य करून व ₹${buffer.toLocaleString('en-IN')} आणीबाणी निधी राखूनही ₹${remaining.toLocaleString('en-IN')} शिल्लक राहतील.`
      : language === 'hi'
      ? `योजना अनुकूलित हो गई। ₹${totalSavings.toLocaleString('en-IN')} की बचत और ₹${buffer.toLocaleString('en-IN')} का बफर रखने के बाद ₹${remaining.toLocaleString('en-IN')} अधिशेष रहेगा।`
      : `Plan optimized. You save ₹${totalSavings.toLocaleString('en-IN')}, reserve ₹${buffer.toLocaleString('en-IN')} emergency buffer, and retain ₹${remaining.toLocaleString('en-IN')} surplus.`,
    all_analyzed_expenses: analyzed,
    action_plan: {
      what_to_pay_now: [...mustDo, ...important],
      what_to_reduce: reduce,
      what_to_postpone: canDelay,
      what_to_avoid: avoid
    }
  }
}

/**
 * Saves monthly expense plan to Supabase and caches in localStorage.
 */
export async function saveExpensePlan({ userId, month, availableBudget, plannedExpenses, aiAnalysis }) {
  const planData = {
    month,
    available_budget: availableBudget,
    planned_expenses: plannedExpenses,
    ai_recommendations: aiAnalysis,
    updated_at: new Date().toISOString()
  }

  // Always cache locally for instantaneous retrieval
  localStorage.setItem(`smartspend_plan_${month}`, JSON.stringify(planData))

  if (!userId) return planData

  try {
    const { data: existing } = await supabase
      .from('expense_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('month', month)
      .limit(1)

    if (existing && existing.length > 0) {
      const { data, error } = await supabase
        .from('expense_plans')
        .update(planData)
        .eq('id', existing[0].id)
        .select()
      if (error) throw error
      return data[0]
    } else {
      const { data, error } = await supabase
        .from('expense_plans')
        .insert({
          user_id: userId,
          ...planData
        })
        .select()
      if (error) throw error
      return data[0]
    }
  } catch (err) {
    console.warn('Could not save plan to Supabase, saved to localStorage:', err)
    return planData
  }
}

/**
 * Loads saved plan from Supabase or localStorage fallback.
 */
export async function loadSavedExpensePlan(userId, month) {
  const local = localStorage.getItem(`smartspend_plan_${month}`)
  let localData = null
  if (local) {
    try {
      localData = JSON.parse(local)
    } catch (e) {}
  }

  if (!userId) return localData

  try {
    const { data, error } = await supabase
      .from('expense_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .limit(1)

    if (error) throw error
    if (data && data.length > 0) {
      return {
        month: data[0].month,
        available_budget: Number(data[0].available_budget),
        planned_expenses: data[0].planned_expenses || [],
        ai_recommendations: data[0].ai_recommendations || null
      }
    }
  } catch (err) {
    console.warn('Could not load plan from Supabase, returning local cache:', err)
  }

  return localData
}
