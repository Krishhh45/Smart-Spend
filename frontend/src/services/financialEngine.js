// SmartSpend Financial & AI/ML Intelligence Calculation Engine
// Strictly dynamic - no hardcoded financial values. All outputs derive from real transaction records.

/**
 * Calculates the dynamic Financial Health Score (0-100) based on transparent criteria:
 * - Savings Rate (30%)
 * - Budget Adherence (25%)
 * - Spending Stability (20%)
 * - Recurring Commitment Burden (15%)
 * - Goal Progress (10%)
 */
export function calculateFinancialHealthScore({
  totalIncome = 0,
  totalExpense = 0,
  budgets = [],
  transactions = [],
  recurringExpenses = [],
  goals = []
}) {
  let score = 0
  const breakdown = []

  // 1. Savings Rate Score (0 - 30 pts)
  const savings = Math.max(0, totalIncome - totalExpense)
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0
  let savingsPts = 0
  if (savingsRate >= 30) savingsPts = 30
  else if (savingsRate >= 20) savingsPts = 25
  else if (savingsRate >= 10) savingsPts = 18
  else if (savingsRate > 0) savingsPts = 10
  else savingsPts = 0
  score += savingsPts
  breakdown.push({
    factor: 'Savings Rate',
    score: savingsPts,
    max: 30,
    status: savingsRate >= 20 ? 'good' : savingsRate > 0 ? 'fair' : 'warning',
    details: `${savingsRate.toFixed(1)}% savings rate (${savingsRate >= 20 ? 'Optimal' : 'Needs boost'})`
  })

  // 2. Budget Adherence Score (0 - 25 pts)
  let budgetPts = 25
  if (budgets.length > 0) {
    let exceededCount = 0
    budgets.forEach(b => {
      const spent = b.spent || 0
      if (spent > b.limit_amount) exceededCount++
    })
    const adherenceRatio = (budgets.length - exceededCount) / budgets.length
    budgetPts = Math.round(adherenceRatio * 25)
  }
  score += budgetPts
  breakdown.push({
    factor: 'Budget Adherence',
    score: budgetPts,
    max: 25,
    status: budgetPts >= 20 ? 'good' : budgetPts >= 12 ? 'fair' : 'warning',
    details: budgets.length === 0 ? 'No active budgets set' : `${budgetPts}/25 adherence score`
  })

  // 3. Spending Stability / Anomaly Check (0 - 20 pts)
  const expenses = transactions.filter(t => t.type === 'expense')
  let stabilityPts = 20
  if (expenses.length >= 3) {
    const amounts = expenses.map(e => Number(e.amount))
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const maxAmount = Math.max(...amounts)
    if (maxAmount > avg * 4) {
      stabilityPts = 10 // Spike detected
    } else if (maxAmount > avg * 2.5) {
      stabilityPts = 15
    }
  }
  score += stabilityPts
  breakdown.push({
    factor: 'Spending Stability',
    score: stabilityPts,
    max: 20,
    status: stabilityPts >= 18 ? 'good' : 'fair',
    details: stabilityPts === 20 ? 'Stable expense pattern' : 'Occasional spending spikes detected'
  })

  // 4. Recurring Burden Score (0 - 15 pts)
  const recurringTotal = recurringExpenses
    .filter(r => r.is_active)
    .reduce((sum, r) => sum + Number(r.amount), 0)
  const recurringRatio = totalIncome > 0 ? (recurringTotal / totalIncome) * 100 : 0
  let recurringPts = 15
  if (recurringRatio > 50) recurringPts = 5
  else if (recurringRatio > 35) recurringPts = 10
  else recurringPts = 15
  score += recurringPts
  breakdown.push({
    factor: 'Commitments & Subscriptions',
    score: recurringPts,
    max: 15,
    status: recurringRatio <= 35 ? 'good' : 'warning',
    details: `${recurringRatio.toFixed(1)}% of income tied to recurring costs`
  })

  // 5. Goal Progress (0 - 10 pts)
  let goalPts = 10
  if (goals.length > 0) {
    const totalCurrent = goals.reduce((s, g) => s + Number(g.current_amount || 0), 0)
    const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount || 1), 0)
    const goalPct = Math.min(100, (totalCurrent / totalTarget) * 100)
    goalPts = Math.round((goalPct / 100) * 10)
  }
  score += goalPts
  breakdown.push({
    factor: 'Financial Goals',
    score: goalPts,
    max: 10,
    status: goalPts >= 7 ? 'good' : 'fair',
    details: goals.length === 0 ? 'Start setting savings targets' : `${goalPts}/10 milestone progress`
  })

  const finalScore = Math.min(100, Math.max(0, score))
  let rating = 'Healthy'
  if (finalScore < 50) rating = 'Needs Attention'
  else if (finalScore < 75) rating = 'Fair'

  return {
    score: finalScore,
    rating,
    breakdown,
    savingsRate,
    savings
  }
}

/**
 * Checks an expense transaction for unusual spending / anomaly relative to history.
 */
export function detectAnomaly(transaction, historicalTransactions = []) {
  const currentAmount = Number(transaction.amount)
  const categoryId = transaction.category_id

  const categoryExpenses = historicalTransactions.filter(
    t => t.type === 'expense' && t.category_id === categoryId && t.id !== transaction.id
  )

  if (categoryExpenses.length < 2) {
    return { isAnomaly: false, reason: null, confidence: 0 }
  }

  const amounts = categoryExpenses.map(t => Number(t.amount))
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length

  // Variance & standard deviation
  const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length
  const stdDev = Math.sqrt(variance) || 1

  const zScore = (currentAmount - mean) / stdDev

  if (zScore > 2.0 || currentAmount > mean * 2.8) {
    const timesHigher = (currentAmount / mean).toFixed(1)
    return {
      isAnomaly: true,
      zScore: zScore.toFixed(2),
      average: Math.round(mean),
      reason: `This transaction is approximately ${timesHigher}× higher than your usual category average of ₹${Math.round(mean).toLocaleString('en-IN')}.`,
      confidence: Math.min(98, Math.round(75 + zScore * 7))
    }
  }

  return { isAnomaly: false, reason: null, confidence: 0 }
}

/**
 * Predicts month-end and next-month expenditure using linear projection and moving averages.
 */
export function predictExpenses({ currentMonthExpenses = [], pastMonthsTotals = [] }) {
  const now = new Date()
  const currentDay = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  const currentTotal = currentMonthExpenses.reduce((sum, t) => sum + Number(t.amount), 0)

  if (currentDay === 0 || currentTotal === 0) {
    return {
      currentTotal: currentTotal || 0,
      dailyBurnRate: 0,
      daysRemaining: Math.max(0, daysInMonth - currentDay),
      projectedCurrentMonth: currentTotal || 0,
      projectedNextMonth: pastMonthsTotals.length > 0 ? Math.round(pastMonthsTotals.reduce((a,b)=>a+b,0)/pastMonthsTotals.length) : 0,
      confidence: 'low',
      hasEnoughData: false
    }
  }

  const dailyBurnRate = currentTotal / currentDay
  const projectedCurrentMonth = Math.round(currentTotal + dailyBurnRate * (daysInMonth - currentDay))

  // Estimate next month
  let projectedNextMonth = projectedCurrentMonth
  if (pastMonthsTotals.length > 0) {
    const historicalAvg = pastMonthsTotals.reduce((a, b) => a + b, 0) / pastMonthsTotals.length
    projectedNextMonth = Math.round(0.6 * projectedCurrentMonth + 0.4 * historicalAvg)
  }

  return {
    currentTotal,
    dailyBurnRate: Math.round(dailyBurnRate),
    daysRemaining: daysInMonth - currentDay,
    projectedCurrentMonth,
    projectedNextMonth,
    confidence: currentDay >= 10 ? 'high' : currentDay >= 5 ? 'medium' : 'low',
    hasEnoughData: true
  }
}

/**
 * Suggests an expense category based on transaction description/merchant keywords.
 */
export function suggestCategory(description = '', categories = []) {
  if (!description) return null

  const text = description.toLowerCase().trim()

  const rules = [
    { keys: ['swiggy', 'zomato', 'restaurant', 'dinner', 'lunch', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'food', 'pizza', 'burger', 'kfc', 'subway', 'biryani'], category: 'Food & Dining' },
    { keys: ['blinkit', 'zepto', 'instamart', 'dmart', 'bigbasket', 'grocery', 'vegetables', 'fruits', 'milk', 'supermarket', 'spencer'], category: 'Groceries' },
    { keys: ['amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'clothes', 'shoes', 'electronics', 'shopping', 'mall'], category: 'Shopping' },
    { keys: ['uber', 'ola', 'rapido', 'metro', 'bus', 'train', 'auto', 'cab', 'transport', 'irctc'], category: 'Transportation' },
    { keys: ['petrol', 'diesel', 'fuel', 'cng', 'hpcl', 'bpcl', 'iocl', 'shell'], category: 'Fuel' },
    { keys: ['netflix', 'spotify', 'prime', 'hotstar', 'youtube', 'cinema', 'pvr', 'inox', 'movie', 'game', 'playstation'], category: 'Entertainment' },
    { keys: ['electricity', 'water', 'bescom', 'tneb', 'wifi', 'broadband', 'airtel', 'jio', 'vi', 'gas', 'cylinder', 'maintenance'], category: 'Bills & Utilities' },
    { keys: ['hospital', 'doctor', 'clinic', 'medicine', 'pharmacy', 'apollo', 'pharmeasy', '1mg', 'dental', 'health'], category: 'Healthcare' },
    { keys: ['tuition', 'course', 'udemy', 'coursera', 'books', 'school', 'college', 'exam', 'fees', 'education'], category: 'Education' },
    { keys: ['lic', 'hdfc ergo', 'star health', 'insurance', 'policybazaar', 'premium'], category: 'Insurance' },
    { keys: ['zerodha', 'groww', 'mutual fund', 'sip', 'stocks', 'demat', 'etf', 'coin', 'gold', 'investment'], category: 'Investments' },
    { keys: ['emi', 'loan', 'home loan', 'car loan', 'personal loan', 'credit card bill', 'card payment'], category: 'EMI & Loans' },
    { keys: ['flight', 'hotel', 'airbnb', 'makemytrip', 'booking.com', 'goibibo', 'vacation', 'resort', 'travel'], category: 'Travel' },
    { keys: ['salon', 'spa', 'haircut', 'parlour', 'grooming', 'gym', 'fitness', 'cult.fit'], category: 'Personal Care' },
    { keys: ['salary', 'payroll', 'wages', 'stipend'], category: 'Salary' },
    { keys: ['freelance', 'client payment', 'consulting', 'upwork', 'fiverr'], category: 'Freelance' }
  ]

  for (const rule of rules) {
    if (rule.keys.some(k => text.includes(k))) {
      const match = categories.find(c => c.name.toLowerCase() === rule.category.toLowerCase())
      if (match) {
        return {
          categoryId: match.id,
          categoryName: match.name,
          confidence: 94
        }
      }
    }
  }

  return null
}

/**
 * Simulates what-if decisions (e.g. reduce category spending by X%, cancel subscriptions).
 */
export function simulateWhatIf({
  currentMonthlyExpense = 0,
  categorySpend = 0,
  reductionPercentage = 0,
  cancelledSubscriptionsCost = 0,
  currentHealthScore = 70
}) {
  const categorySavings = (categorySpend * reductionPercentage) / 100
  const totalMonthlySavings = categorySavings + cancelledSubscriptionsCost
  const annualSavings = totalMonthlySavings * 12

  // Projected new score
  const scoreBoost = Math.min(15, Math.round((totalMonthlySavings / (currentMonthlyExpense || 1)) * 40))
  const projectedHealthScore = Math.min(100, currentHealthScore + scoreBoost)

  return {
    monthlySavings: Math.round(totalMonthlySavings),
    annualSavings: Math.round(annualSavings),
    newMonthlyExpense: Math.max(0, Math.round(currentMonthlyExpense - totalMonthlySavings)),
    projectedHealthScore
  }
}
