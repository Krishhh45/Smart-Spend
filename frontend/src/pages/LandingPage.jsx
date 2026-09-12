import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  TrendingDown,
  ShieldCheck, 
  Sparkles, 
  BarChart3, 
  PieChart, 
  FileText, 
  ArrowRight,
  CheckCircle2,
  Mic,
  Volume2,
  Wallet,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Lock,
  HeartHandshake,
  Check,
  Zap,
  Globe,
  MessageSquareQuote,
  Calculator
} from 'lucide-react'

export default function LandingPage() {
  // 1. Interactive Demo Playground State
  const [activeDemoTab, setActiveDemoTab] = useState('voice')
  const [demoBalance, setDemoBalance] = useState(42850)
  const [demoSpends, setDemoSpends] = useState([
    { id: 1, merchant: 'Blue Tokai Coffee', category: 'Food & Dining', amount: 240, method: 'UPI', time: '10 mins ago' },
    { id: 2, merchant: 'HPCL Petrol Pump', category: 'Fuel', amount: 800, method: 'Cash', time: '2 hours ago' }
  ])
  const [demoPromptActive, setDemoPromptActive] = useState(null)
  const [demoBudgetSpend, setDemoBudgetSpend] = useState(7200)
  const demoBudgetLimit = 8000

  // 2. Interactive Savings Calculator State
  const [monthlySpendInput, setMonthlySpendInput] = useState(45000)

  // 3. Interactive FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0)

  // Simulated Voice / Chat prompt handler
  const handleRunDemoPrompt = (preset) => {
    setDemoPromptActive(preset)
    // If not already added, deduct from balance
    if (!demoSpends.some(s => s.id === preset.id)) {
      setDemoSpends(prev => [preset, ...prev])
      setDemoBalance(prev => prev - preset.amount)
    }
  }

  // Pre-configured humanised prompts
  const demoPrompts = [
    { id: 101, text: '200 chaha cash add kar', merchant: 'Chai & Snacks', category: 'Food & Dining', amount: 200, method: 'Cash', lang: 'मराठी / Marathlish' },
    { id: 102, text: 'Add 500 petrol UPI', merchant: 'Petrol Fuel', category: 'Fuel', amount: 500, method: 'UPI', lang: 'English' },
    { id: 103, text: '1200 bijli bill bhara gpay se', merchant: 'Electricity Bill', category: 'Bills & Utilities', amount: 1200, method: 'UPI', lang: 'हिंदी / Hinglish' }
  ]

  const calculatedMonthlySaving = Math.round(monthlySpendInput * 0.125)
  const calculatedYearlySaving = calculatedMonthlySaving * 12
  const calculatedRunwayMonths = (calculatedYearlySaving / (monthlySpendInput || 1)).toFixed(1)

  const faqs = [
    {
      q: 'Do I really not have to categorize or type manually every day?',
      a: 'Exactly. You can speak or write natural sentences in English, Hindi, Marathi, or code-mixed phrases (like "200 chaha cash add kar" or "500 petrol UPI"). SmartSpend automatically identifies the merchant, amount, category, and payment method in under a second.'
    },
    {
      q: 'How does the budget alert protect me from overspending?',
      a: 'Unlike traditional apps that only send a sad month-end summary when you are already broke, SmartSpend calculates your real-time spend against your category limits. The exact moment you hit 100% of your allocated budget, an instant warning notification and sound chime alerts you before you make the next purchase.'
    },
    {
      q: 'Is my personal financial data private and secure?',
      a: 'Yes, completely. Your records are protected with bank-grade 256-bit encryption and Supabase Row-Level Security (RLS). We never sell your financial data or harvest transaction records for advertisers. You can export your data anytime.'
    },
    {
      q: 'Can I track cash transactions alongside UPI and bank cards?',
      a: 'Yes! While traditional banking apps only see digital card swipes, SmartSpend was built for the Indian financial reality where Cash, UPI, and Cards coexist. Simply say "paid in cash" or "रोख" and it is recorded accurately.'
    },
    {
      q: 'Does it work seamlessly on mobile browsers and desktops?',
      a: 'Yes. SmartSpend is a fully responsive Progressive Web App featuring desktop keyboards shortcuts, a floating voice companion, and instant mobile touch support with dark and light modes.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] aurora-bg transition-colors duration-200 selection:bg-indigo-500/20 selection:text-indigo-700">
      
      {/* Top Banner: Real Human Product Status */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white text-xs font-semibold py-2 px-4 text-center">
        <span className="opacity-90">✨ Built for modern living: Speak or type in English, हिंदी, or मराठी with zero spreadsheet headaches.</span>
      </div>

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="font-manrope font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">SmartSpend</span>
            <span className="block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 leading-none">Personal Finance</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <a href="#demo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Interactive Demo</a>
          <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How It Works</a>
          <a href="#calculator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Savings Impact</a>
          <a href="#stories" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">User Stories</a>
          <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 sm:px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-16 text-center">
        {/* Warm pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-2xs">
          <HeartHandshake className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Crafted for human habits, not robotic bookkeeping</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-manrope font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-6">
          Feel good about <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
            where your money goes.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          No rigid spreadsheets or cold banking jargon. Speak your daily chai runs, grocery trips, or bills in any language — get instant clarity and proactive peace of mind.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
          <Link
            to="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Free with SmartSpend</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#demo"
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-8 py-3.5 rounded-2xl shadow-2xs transition-all"
          >
            <span>Try Interactive Demo</span>
          </a>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE PRODUCT PLAYGROUND (HERO)                          */}
        {/* ------------------------------------------------------------- */}
        <div id="demo" className="relative max-w-4xl mx-auto rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-white/90 to-slate-100/50 dark:from-slate-900/90 dark:to-slate-950/50 border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-md text-left">
          
          {/* Playground Top Tab Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 ml-2">Interactive Preview</span>
            </div>

            {/* Interactive Modes Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold">
              <button
                onClick={() => setActiveDemoTab('voice')}
                className={`px-3 py-1.5 rounded-xl transition-all ${activeDemoTab === 'voice' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                🎙️ Voice & Chat Logging
              </button>
              <button
                onClick={() => setActiveDemoTab('budget')}
                className={`px-3 py-1.5 rounded-xl transition-all ${activeDemoTab === 'budget' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                🛡️ Budget Alerts
              </button>
              <button
                onClick={() => setActiveDemoTab('overview')}
                className={`px-3 py-1.5 rounded-xl transition-all ${activeDemoTab === 'overview' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                📊 Balance & Cash Flow
              </button>
            </div>
          </div>

          {/* TAB 1: INTERACTIVE VOICE & CHAT LOGGING */}
          {activeDemoTab === 'voice' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Simulated Account Balance</span>
                  <p className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white mt-0.5">
                    ₹{demoBalance.toLocaleString('en-IN')}.00
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Auto Multilingual Listening Ready
                  </span>
                </div>
              </div>

              {/* Clickable Quick Speech / Text Prompts */}
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Click a sample sentence to test how SmartSpend parses it live:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {demoPrompts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleRunDemoPrompt(p)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        demoPromptActive?.id === p.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                        {p.lang}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        "{p.text}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Output Simulation Card */}
              {demoPromptActive && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-900/60 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/60 dark:border-slate-700">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Instantly Parsed & Recorded
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Balance adjusted by -₹{demoPromptActive.amount}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Merchant</span>
                      <span className="font-bold text-slate-900 dark:text-white">{demoPromptActive.merchant}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Amount</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">₹{demoPromptActive.amount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Category</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{demoPromptActive.category}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Paid Via</span>
                      <span className="inline-block px-2 py-0.5 font-bold rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px]">
                        {demoPromptActive.method}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Live Stream</span>
                {demoSpends.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        {s.merchant[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{s.merchant}</span>
                        <span className="text-[10px] text-slate-400">{s.category} • {s.method}</span>
                      </div>
                    </div>
                    <span className="font-manrope font-bold text-slate-900 dark:text-white">-₹{s.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE BUDGET ALERTS */}
          {activeDemoTab === 'budget' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Early-Warning Budget Simulation</span>
                <h3 className="text-lg font-manrope font-extrabold text-slate-900 dark:text-white mt-1">
                  Food & Dining Monthly Limit: ₹{demoBudgetLimit.toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Slide the handle to see how SmartSpend sounds the alarm the exact moment you hit or exceed 100% capacity:
                </p>
              </div>

              {/* Slider Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Simulated Spend: ₹{demoBudgetSpend.toLocaleString('en-IN')}</span>
                  <span className={demoBudgetSpend >= demoBudgetLimit ? 'text-rose-600 font-extrabold' : 'text-indigo-600'}>
                    {Math.round((demoBudgetSpend / demoBudgetLimit) * 100)}% Used
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="12000"
                  step="200"
                  value={demoBudgetSpend}
                  onChange={(e) => setDemoBudgetSpend(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Real-time Pop Banner Response */}
              {demoBudgetSpend >= demoBudgetLimit ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 animate-bounce-short">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 shadow-sm shadow-rose-600/30">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                        ⚠️ Budget Exceeded Warning Generated!
                      </h4>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                        Food & Dining has reached ₹{demoBudgetSpend.toLocaleString('en-IN')} of your ₹{demoBudgetLimit.toLocaleString('en-IN')} limit (Over by ₹{(demoBudgetSpend - demoBudgetLimit).toLocaleString('en-IN')}). SmartSpend generates a floating pop alert with audio chime immediately!
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    Safe zone: You have <strong>₹{(demoBudgetLimit - demoBudgetSpend).toLocaleString('en-IN')}</strong> remaining in this category.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OVERVIEW & CASH FLOW */}
          {activeDemoTab === 'overview' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500">Monthly Credits</span>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">+₹65,000</p>
                  <span className="text-[11px] text-slate-400">Salary & Freelance</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500">Monthly Debits</span>
                  <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">-₹31,420</p>
                  <span className="text-[11px] text-slate-400">Across 28 entries</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500">Financial Wellness</span>
                  <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">84 / 100</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">51.6% Savings Pace</span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Top Categories</span>
                {[
                  { name: 'Groceries & Kirana', spent: '₹8,400', pct: 65 },
                  { name: 'Food & Dining', spent: '₹6,200', pct: 48 },
                  { name: 'Fuel & Commute', spent: '₹3,500', pct: 32 }
                ].map((c, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{c.name}</span>
                      <span className="text-slate-900 dark:text-white">{c.spent}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: THE HUMAN DIFFERENCE (VS SPREADSHEETS & BANK APPS)   */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Thoughtful by Design</span>
          <h2 className="text-3xl sm:text-4xl font-manrope font-extrabold text-slate-900 dark:text-white mt-1">
            Why traditional money apps fail humans.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
            Most finance tools either demand 20 manual clicks per coffee or only tell you about overspending after the damage is done.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Old Way */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative">
            <span className="text-xs font-extrabold uppercase text-rose-500 tracking-wider">The Old Way</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-4">Manual spreadsheets & clunky tax apps</h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Typing dropdowns, date pickers, and account codes for every single chai or snack.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>English-only interfaces that fail to understand Indian speech like "200 chaha cash".</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Zero real-time warnings — you only find out you blew your budget at the end of the month.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Cash spending gets completely forgotten and untracked.</span>
              </li>
            </ul>
          </div>

          {/* The SmartSpend Way */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/20 border border-indigo-200 dark:border-indigo-900/60 shadow-md relative">
            <span className="text-xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">The SmartSpend Way</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-4">Natural, effortless, and proactive</h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Instant multi-lingual speech & text:</strong> Just speak in English, मराठी, or हिंदी.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Mandatory payment method clarity:</strong> Explicitly asks how you paid (Cash, UPI, Card) if missing.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Live 100% budget alerts:</strong> Immediate pop notification and chime the exact moment a category is capped.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>100% private:</strong> Row-level PostgreSQL database security with zero advertisement tracking.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: INTERACTIVE SAVINGS CALCULATOR                       */}
      {/* ------------------------------------------------------------- */}
      <section id="calculator" className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Calculator className="w-4 h-4" />
            <span>Financial Wellness Calculator</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-manrope font-extrabold text-slate-900 dark:text-white tracking-tight">
            See how much you could recover each month.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            By eliminating forgotten micro-leaks, duplicate subscriptions, and unmonitored weekend dining, our members save an average of 12.5% monthly.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-600 dark:text-slate-300">Your Monthly Spending:</span>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                ₹{monthlySpendInput.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="15000"
              max="200000"
              step="2500"
              value={monthlySpendInput}
              onChange={(e) => setMonthlySpendInput(Number(e.target.value))}
              className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>₹15,000 / mo</span>
              <span>₹1,00,000 / mo</span>
              <span>₹2,00,000 / mo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly Recovered</span>
              <p className="text-2xl sm:text-3xl font-manrope font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                +₹{calculatedMonthlySaving.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">1-Year Wealth Built</span>
              <p className="text-2xl sm:text-3xl font-manrope font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{calculatedYearlySaving.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/40">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Safety Runway Added</span>
              <p className="text-2xl sm:text-3xl font-manrope font-extrabold text-violet-600 dark:text-violet-400 mt-1">
                +{calculatedRunwayMonths} Months
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: REAL USER STORIES (HUMANISED SOCIAL PROOF)           */}
      {/* ------------------------------------------------------------- */}
      <section id="stories" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Real Human Stories</span>
          <h2 className="text-3xl sm:text-4xl font-manrope font-extrabold text-slate-900 dark:text-white mt-1">
            Loved by everyday people across India.
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            No stock personas. Real professionals and families who transformed their relationship with money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Story 1 */}
          <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "Being able to speak in Marathi right after paying cash at the local vegetable market or tea stall is magical. I don't feel like I'm doing accounting anymore."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
                SD
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Siddharth Deshmukh</h4>
                <p className="text-[11px] text-slate-400">Software Architect • Pune</p>
              </div>
            </div>
          </div>

          {/* Story 2 */}
          <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "The instant budget pop alert saved me on weekend Swiggy and dining orders three times already. It gives me a gentle nudge before I swipe, not weeks later."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center text-sm">
                PR
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pooja Rao</h4>
                <p className="text-[11px] text-slate-400">Product Designer • Bengaluru</p>
              </div>
            </div>
          </div>

          {/* Story 3 */}
          <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "My father speaks Hindi, while I prefer English. We can both log expenses into our joint family account without touching any complex settings."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                AS
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Aman Sharma</h4>
                <p className="text-[11px] text-slate-400">Consultant • New Delhi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: INTERACTIVE FAQ ACCORDION                            */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Got Questions?</span>
          <h2 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: BOTTOM CALL TO ACTION                                */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 rounded-[32px] p-8 sm:p-14 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-manrope font-extrabold tracking-tight mb-4">
              Ready for clear, stress-free money management?
            </h2>
            <p className="text-sm sm:text-base text-indigo-100 mb-8 leading-relaxed">
              Join thousands of individuals tracking their expenses effortlessly in their own language. Free forever to start.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto text-sm sm:text-base font-bold text-indigo-900 bg-white hover:bg-slate-100 px-8 py-3.5 rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto text-sm sm:text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-3.5 rounded-2xl transition-all"
              >
                Sign In to Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-12 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              S
            </div>
            <span className="font-bold text-slate-900 dark:text-white">SmartSpend</span>
            <span>— Personal Finance & Budget Clarity</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-indigo-600 transition-colors">Register</Link>
            <span>Privacy & Security Guaranteed</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
