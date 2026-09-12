import React, { useState, useEffect, useRef } from 'react'
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Mic, 
  MicOff, 
  Receipt, 
  Check, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabase'

export default function Assistant() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { language } = useTheme()
  const { showBudgetExceededToast } = useToast()

  const [voiceLang, setVoiceLang] = useState('auto') // 'auto' (Any Language), 'en', 'hi', or 'mr'

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm SmartSpend, your financial companion. Ask any question in ANY language (English, हिंदी, मराठी) or tell me to log an expense like 'Add 500 petrol UPI', '200 chaha cash add kar', or '500 rupaye petrol ka kharcha jodo'!",
      metrics: null,
      proposal: null
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState(null)
  const [voiceSupported, setVoiceSupported] = useState(true)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceSupported(false)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickPrompts = [
    'Where did my money go this month?',
    '200 chaha cash add kar',
    'Add 500 petrol UPI',
    'Mera kharcha kitna hua?',
    'Majha kharch kiti zala?',
    'Budget kitna bacha hai?'
  ]

  // Toggle Voice Input
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechError(t('companion.unsupportedTooltip', 'Voice input not supported in this browser.'))
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    setSpeechError(null)
    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      
      const langMap = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'mr': 'mr-IN'
      }
      if (voiceLang === 'auto') {
        const nav = (navigator.language || '').toLowerCase()
        if (nav.startsWith('mr')) recognition.lang = 'mr-IN'
        else if (nav.startsWith('hi')) recognition.lang = 'hi-IN'
        else recognition.lang = 'en-IN'
      } else {
        recognition.lang = langMap[voiceLang] || 'en-IN'
      }

      recognition.onstart = () => {
        setIsListening(true)
        setSpeechError(null)
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript
        if (transcript) {
          setInput(transcript)
          setIsListening(false)
          setTimeout(() => {
            processQuery(transcript)
          }, 800)
        }
      }

      recognition.onerror = (event) => {
        setIsListening(false)
        if (event.error === 'no-speech') {
          setSpeechError(t('companion.noSpeech', 'No speech detected. Try again.'))
        } else {
          setSpeechError(`Voice error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      setIsListening(false)
      setSpeechError('Microphone error: ' + err.message)
    }
  }

  // Grounded Query & NLP Transaction Processor
  const processQuery = async (query) => {
    const text = query.trim()
    if (!text) return
    setSpeechError(null)

    // Check if user is replying with payment method for an active unconfirmed proposal
    let pendingProposalIndex = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].proposal && !messages[i].proposalConfirmed && !messages[i].proposal.payment_method) {
        pendingProposalIndex = i
        break
      }
    }

    // A payment method follow-up reply MUST NOT contain a monetary amount/digits.
    // If it contains numbers (e.g. "Rs 200 chai cash" or "500 gpay"), it is a NEW transaction, NOT a payment follow-up!
    const hasDigits = /[0-9\u0966-\u096F]/.test(text)
    const isShortReply = text.trim().split(/\s+/).length <= 4

    let matchedMode = null
    if (!hasDigits && isShortReply) {
      const lower = text.toLowerCase()
      if (/(cash|rokh|rokad|rokhad|paise|कॅश|कैश|रोख|रोकड|नकद|नगद|रोकडा|रोकडी|पैशा)/i.test(lower)) {
        matchedMode = 'Cash'
      } else if (/(upi|gpay|google\s*pay|phonepe|paytm|bhim|cred|qr|यूपीआय|यूपीआई|युपीआय|युपिआय|जीपे|गुगल\s*पे|गूगल\s*पे|फोनपे|पेटीएम|स्कॅन|स्कैन|क्युआर|क्यूआर)/i.test(lower)) {
        matchedMode = 'UPI'
      } else if (/(card|debit|credit|visa|mastercard|rupay|atm|कार्ड|डेबिट|क्रेडिट|एटीएम|स्वाइप|swipe)/i.test(lower)) {
        matchedMode = 'Card'
      } else if (/(net\s*banking|bank|transfer|neft|rtgs|imps|cheque|बँकिंग|बैंकिंग|बँक|बैंक|चेक)/i.test(lower)) {
        matchedMode = 'Net Banking'
      }
    }

    if (pendingProposalIndex !== -1 && matchedMode) {
      setMessages(prev => {
        const updated = [...prev]
        updated[pendingProposalIndex] = {
          ...updated[pendingProposalIndex],
          proposal: {
            ...updated[pendingProposalIndex].proposal,
            payment_method: matchedMode,
            payment_method_specified: true
          }
        }
        updated.push({ sender: 'user', text })
        updated.push({
          sender: 'ai',
          text: t('companion.paymentMethodSet', {
            method: matchedMode,
            defaultValue: `Payment method set to **${matchedMode}**. Please confirm your transaction below.`
          }),
          metrics: null,
          proposal: null
        })
        return updated
      })
      setInput('')
      return
    }

    setLoading(true)

    try {
      // 1. Check if it's an expense transaction entry via NLP parser
      const nlpRes = await fetch('http://127.0.0.1:5000/api/v1/ai/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: voiceLang })
      })

      const nlpData = await nlpRes.json()

      if (nlpData?.success && nlpData?.data?.is_transaction && nlpData.data.amount > 0) {
        const txProposal = nlpData.data
        const isMethodSpecified = Boolean(txProposal.payment_method_specified && txProposal.payment_method)
        
        const responseText = isMethodSpecified
          ? t('companion.identifiedExpense', {
              amount: txProposal.amount.toLocaleString('en-IN'),
              merchant: txProposal.merchant,
              category: txProposal.category,
              method: txProposal.payment_method,
              defaultValue: `Identified expense: **₹${txProposal.amount.toLocaleString('en-IN')}** for **${txProposal.merchant}** (${txProposal.category}) via ${txProposal.payment_method}. Click below to confirm and save to your account.`
            })
          : t('companion.askPaymentMethod', {
              amount: txProposal.amount.toLocaleString('en-IN'),
              merchant: txProposal.merchant,
              category: txProposal.category,
              defaultValue: `Identified expense: **₹${txProposal.amount.toLocaleString('en-IN')}** for **${txProposal.merchant}** (${txProposal.category}). You didn't specify a payment method. How did you pay? (Cash, UPI, or Card?)`
            })

        setMessages(prev => [
          ...prev,
          { sender: 'user', text },
          {
            sender: 'ai',
            text: responseText,
            metrics: null,
            proposal: {
              ...txProposal,
              payment_method: isMethodSpecified ? txProposal.payment_method : null
            }
          }
        ])
        setInput('')
        return
      }

      // 2. Otherwise process as grounded financial inquiry
      const now = new Date()
      const currentMonth = now.toISOString().slice(0, 7)

      const [txRes, rRes, bRes] = await Promise.all([
        supabase.from('transactions').select(`*, categories (name)`).eq('user_id', user.id),
        supabase.from('recurring_expenses').select('*').eq('user_id', user.id),
        supabase.from('budgets').select(`*, categories (name)`).eq('user_id', user.id)
      ])

      const transactions = txRes.data || []
      const recurring = rRes.data || []
      const budgets = bRes.data || []

      const currentMonthExpenses = transactions.filter(
        t => t.type === 'expense' && t.date && t.date.startsWith(currentMonth)
      )
      const currentMonthIncome = transactions.filter(
        t => t.type === 'income' && t.date && t.date.startsWith(currentMonth)
      )

      const totalExp = currentMonthExpenses.reduce((s, t) => s + Number(t.amount || 0), 0)
      const totalInc = currentMonthIncome.reduce((s, t) => s + Number(t.amount || 0), 0)
      const totalBudget = budgets.reduce((s, b) => s + Number(b.amount || 0), 0)
      const totalSubs = recurring.reduce((s, r) => s + Number(r.amount || 0), 0)

      let reply = ''
      let metrics = null
      const lower = text.toLowerCase()

      const isMarathi = /(kiti|zala|jhala|shillak|konta|maza|majha|ahe|ahet|kuthe|madhe|kharch|खर्च|किती|झाला|शिल्लक|कुठे|आहे|सांगा)/i.test(lower)
      const isHindi = /(kitna|hua|bacha|kiska|kahan|hai|batao|sabse|jyada|kharcha|खर्चा|कितना|हुआ|बचा|कहाँ|है|बताओ|ज्यादा)/i.test(lower)

      // A. Highest Expense Query
      if (/(highest|single|largest|biggest|top|motha|jast|jyada|bada|sarvat|sabse|सर्वात|मोठा|जास्त|बड़ा)/i.test(lower)) {
        const sorted = [...currentMonthExpenses].sort((a, b) => Number(b.amount) - Number(a.amount))
        const highest = sorted[0]
        if (highest) {
          const amt = Number(highest.amount).toLocaleString('en-IN')
          const merchantName = highest.description || highest.merchant || 'General'
          if (isMarathi) {
            reply = `या महिन्यातील तुमचा सर्वात मोठा खर्च **₹${amt}** हा **${merchantName}** साठी होता (${highest.date}).`
          } else if (isHindi) {
            reply = `इस महीने आपका सबसे बड़ा खर्च **₹${amt}** था **${merchantName}** के लिए (${highest.date})।`
          } else {
            reply = `Your highest expense this month was **₹${amt}** for **${merchantName}** on ${highest.date} (${highest.categories?.name || 'General'}).`
          }
          metrics = [
            { label: 'Highest Expense', value: `₹${amt}` },
            { label: 'Merchant / Item', value: merchantName },
            { label: 'Date', value: highest.date }
          ]
        } else {
          reply = isMarathi ? `या महिन्यात अजून कोणताही खर्च नोंदवलेला नाही.` : isHindi ? `इस महीने अभी तक कोई खर्च दर्ज नहीं किया गया है।` : `No expense transactions recorded yet this month.`
        }
      } 
      // B. Budget Status & Remaining Balance
      else if (/(budget|balance|shillak|bacha|remaining|limit|baki|बजट|शिल्लक|बाकी|बचा)/i.test(lower)) {
        if (totalBudget > 0) {
          const remaining = totalBudget - totalExp
          const remAmt = Math.abs(remaining).toLocaleString('en-IN')
          if (remaining < 0) {
            if (isMarathi) {
              reply = `⚠️ **सावधान: बजेट मर्यादा ओलांडली आहे!**\nतुमचा एकूण मासिक बजेट मर्यादा **₹${totalBudget.toLocaleString('en-IN')}** असून, आतापर्यंतचा खर्च **₹${totalExp.toLocaleString('en-IN')}** झाला आहे (**₹${remAmt} जास्त खर्च**).`
            } else if (isHindi) {
              reply = `⚠️ **सावधान: बजट सीमा पार हो गई है!**\nआपकी कुल मासिक बजट सीमा **₹${totalBudget.toLocaleString('en-IN')}** है और खर्च **₹${totalExp.toLocaleString('en-IN')}** हो चुका है (**₹${remAmt} अधिक खर्च**)।`
            } else {
              reply = `⚠️ **Alert: Monthly Budget Exceeded!**\nYour budget limit is **₹${totalBudget.toLocaleString('en-IN')}**, but spending has reached **₹${totalExp.toLocaleString('en-IN')}** (**₹${remAmt} over budget**).`
            }
          } else {
            if (isMarathi) {
              reply = `चालू महिन्याचा बजेट: **₹${totalBudget.toLocaleString('en-IN')}**\nएकूण खर्च: **₹${totalExp.toLocaleString('en-IN')}**\nशिल्लक बजेट: **₹${remAmt}**`
            } else if (isHindi) {
              reply = `इस महीने का कुल बजट: **₹${totalBudget.toLocaleString('en-IN')}**\nकुल खर्च: **₹${totalExp.toLocaleString('en-IN')}**\nशेष बचा बजट: **₹${remAmt}**`
            } else {
              reply = `Monthly Budget: **₹${totalBudget.toLocaleString('en-IN')}**\nTotal Spent: **₹${totalExp.toLocaleString('en-IN')}**\nRemaining Budget: **₹${remAmt}**`
            }
          }
          metrics = [
            { label: 'Total Budget', value: `₹${totalBudget.toLocaleString('en-IN')}` },
            { label: 'Spent So Far', value: `₹${totalExp.toLocaleString('en-IN')}` },
            { label: remaining < 0 ? 'Exceeded By' : 'Remaining', value: `₹${remAmt}` }
          ]
        } else {
          reply = isMarathi
            ? `चालू महिन्याचा एकूण खर्च **₹${totalExp.toLocaleString('en-IN')}** आहे. तुम्ही बजेट पेजवर नवीन बजेट सेट करू शकता.`
            : isHindi
            ? `इस महीने का कुल खर्च **₹${totalExp.toLocaleString('en-IN')}** है। आप बजट पेज से नया बजट बना सकते हैं।`
            : `You have spent **₹${totalExp.toLocaleString('en-IN')}** this month. No active budgets set.`
        }
      }
      // B2. Expense Prediction & Month-end Forecast Query
      else if (/(predict|prediction|forecast|future|month-end|burn rate|next month|अंदाज|भविष्य|पुढील महिना|पुढचा महिना|महिना अखेर)/i.test(lower)) {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const currentDay = now.getDate() || 1
        const dailyRate = Math.round(totalExp / currentDay)
        const projectedTotal = Math.round(totalExp + dailyRate * (daysInMonth - currentDay))

        if (totalExp > 0) {
          if (isMarathi) {
            reply = `🔮 **खर्च अंदाज (Forecasting):**\nचालू महिन्याचा आतापर्यंतचा खर्च **₹${totalExp.toLocaleString('en-IN')}** आहे (दररोज सरासरी ₹${dailyRate.toLocaleString('en-IN')}). या गतीने महिनाअखेर तुमचा एकूण खर्च **₹${projectedTotal.toLocaleString('en-IN')}** होण्याची शक्यता आहे.`
          } else if (isHindi) {
            reply = `🔮 **खर्च अनुमान (Forecasting):**\nइस महीने का अब तक का खर्च **₹${totalExp.toLocaleString('en-IN')}** है (दैनिक औसत ₹${dailyRate.toLocaleString('en-IN')})। इस गति से महीने के अंत तक आपका कुल खर्च **₹${projectedTotal.toLocaleString('en-IN')}** होने का अनुमान है।`
          } else {
            reply = `🔮 **Expense Forecast:**\nYou have spent **₹${totalExp.toLocaleString('en-IN')}** so far this month (averaging ₹${dailyRate.toLocaleString('en-IN')}/day). At this pace, your projected month-end spend will reach **₹${projectedTotal.toLocaleString('en-IN')}**.`
          }
          metrics = [
            { label: 'Current Spent', value: `₹${totalExp.toLocaleString('en-IN')}` },
            { label: 'Daily Burn Rate', value: `₹${dailyRate.toLocaleString('en-IN')}/day` },
            { label: 'Projected Month-End', value: `₹${projectedTotal.toLocaleString('en-IN')}` }
          ]
        } else {
          reply = isMarathi
            ? 'चालू महिन्यात अजून पुरेसा खर्च नोंदवलेला नाही, त्यामुळे अंदाज उपलब्ध नाही.'
            : isHindi
            ? 'इस महीने में अभी तक पर्याप्त खर्च दर्ज नहीं किया गया है, इसलिए अनुमान उपलब्ध नहीं है।'
            : 'Not enough transactions recorded this month yet to generate an accurate forecast.'
        }
      }
      // C. Subscriptions / Recurring
      else if (/(subscription|recurring|dar mahina|har mahine|mahinyala|सबस्क्रिप्शन|दर महिना)/i.test(lower)) {
        const subList = recurring.map(r => `${r.merchant} (₹${r.amount}/${r.frequency})`).join(', ')
        if (isMarathi) {
          reply = `तुमची **${recurring.length} नियमित देयके** आहेत, ज्यांचा एकूण मासिक खर्च **₹${totalSubs.toLocaleString('en-IN')}** आहे: ${subList || 'काहीही नाही'}.`
        } else if (isHindi) {
          reply = `आपके **${recurring.length} नियमित खर्च** सक्रिय हैं, कुल मासिक खर्च **₹${totalSubs.toLocaleString('en-IN')}** है: ${subList || 'कोई नहीं'}।`
        } else {
          reply = `You have **${recurring.length} recurring obligations** recorded, totaling **₹${totalSubs.toLocaleString('en-IN')} per month**: ${subList || 'None'}.`
        }
        metrics = [
          { label: 'Active Services', value: `${recurring.length} subscriptions` },
          { label: 'Monthly Burden', value: `₹${totalSubs.toLocaleString('en-IN')}` },
          { label: 'Annual Cost', value: `₹${(totalSubs * 12).toLocaleString('en-IN')}` }
        ]
      }
      // D. How to add / Help
      else if (/(how to add|kasa karu|kaise jode|kaise kare|madat|madad|help|add|taka|jodo)/i.test(lower)) {
        reply = `💡 **You can speak or type in ANY language to add an expense:**\n\n• **English:** "Add 500 petrol UPI" or "Record 150 coffee cash"\n• **मराठी:** "200 chaha cash add kar" किंवा "50 vadapav cash taka"\n• **हिंदी:** "500 rupaye petrol ka kharcha jodo UPI se" किंवा "200 chai cash likho"`
      }
      // E. Total Spending Breakdown / Summary
      else {
        const catMap = {}
        currentMonthExpenses.forEach(t => {
          const name = t.categories?.name || 'Other'
          catMap[name] = (catMap[name] || 0) + Number(t.amount)
        })
        const topCat = Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0]

        if (isMarathi) {
          reply = `या महिन्यात तुम्ही **${currentMonthExpenses.length} व्यवहारांमध्ये** एकूण **₹${totalExp.toLocaleString('en-IN')}** खर्च केले आहेत (जमा: **₹${totalInc.toLocaleString('en-IN')}**). सर्वात मोठा वर्ग: **${topCat ? topCat[0] : 'General'}** (₹${topCat ? topCat[1].toLocaleString('en-IN') : 0}).\n\nतुम्ही मला कोणताही खर्च जोडायला सांगू शकता (उदा. "200 chaha cash add kara").`
        } else if (isHindi) {
          reply = `इस महीने आपने **${currentMonthExpenses.length} लेनदेनों** में कुल **₹${totalExp.toLocaleString('en-IN')}** खर्च किए हैं (कुल आय: **₹${totalInc.toLocaleString('en-IN')}**)। सबसे बड़ा वर्ग: **${topCat ? topCat[0] : 'General'}** (₹${topCat ? topCat[1].toLocaleString('en-IN') : 0})।\n\nआप मुझे कोई भी खर्च जोड़ने के लिए कह सकते हैं (जैसे "200 chai cash jodo")।`
        } else {
          reply = `This month you have recorded **₹${totalExp.toLocaleString('en-IN')}** in total expenses across **${currentMonthExpenses.length} transactions** against **₹${totalInc.toLocaleString('en-IN')}** in total income. Largest category: **${topCat ? topCat[0] : 'General'}** (₹${topCat ? topCat[1].toLocaleString('en-IN') : 0}).\n\nYou can speak or type in any language to add an expense (e.g. "Add 500 petrol UPI", "200 chaha cash add kar").`
        }

        metrics = [
          { label: 'Total Income', value: `+₹${totalInc.toLocaleString('en-IN')}` },
          { label: 'Total Expenses', value: `-₹${totalExp.toLocaleString('en-IN')}` },
          { label: 'Top Category', value: topCat ? topCat[0] : 'None' }
        ]
      }

      setMessages(prev => [
        ...prev,
        { sender: 'user', text },
        { sender: 'ai', text: reply, metrics, proposal: null }
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'user', text },
        { sender: 'ai', text: 'Finora AI is temporarily unable to query data.', metrics: null, proposal: null }
      ])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  const handleSelectPaymentMethod = (msgIndex, method) => {
    setMessages(prev => prev.map((m, idx) => {
      if (idx === msgIndex && m.proposal) {
        return {
          ...m,
          proposal: {
            ...m.proposal,
            payment_method: method,
            payment_method_specified: true
          }
        }
      }
      return m
    }))
  }

  const handleConfirmProposal = async (proposal, index) => {
    if (!user) return
    if (!proposal.payment_method) {
      alert(t('companion.pleaseSelectPayment', 'Please select a payment method before confirming.'))
      return
    }
    try {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${proposal.category}%`)
        .limit(1)

      const categoryId = cats?.[0]?.id || null

      const { data: accounts } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      const accountId = accounts?.[0]?.id || null

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: proposal.amount,
        type: proposal.type || 'expense',
        merchant: proposal.merchant,
        description: proposal.raw_text,
        category_id: categoryId,
        account_id: accountId,
        payment_method: proposal.payment_method,
        date: proposal.date || new Date().toISOString().slice(0, 10)
      })

      if (error) throw error

      // Check if this newly logged expense exceeds any active category budget
      if (categoryId && (proposal.type || 'expense') === 'expense') {
        try {
          const { data: bData } = await supabase
            .from('budgets')
            .select('limit_amount, categories(name)')
            .eq('user_id', user.id)
            .eq('category_id', categoryId)
            .maybeSingle()

          if (bData && Number(bData.limit_amount) > 0) {
            const currentMonth = new Date().toISOString().slice(0, 7)
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
              const catName = bData.categories?.name || proposal.category || 'Category'
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

      setMessages(prev => prev.map((m, i) => {
        if (i === index) {
          return {
            ...m,
            proposalConfirmed: true
          }
        }
        return m
      }))
    } catch (err) {
      alert('Failed to save transaction: ' + err.message)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    processQuery(input.trim())
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Your Money Assistant</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Ask anything about your finances</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Type or speak in any language — English, हिंदी, मराठी
          </p>
        </div>

        {/* Voice & Query Language Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Language:</span>
          <select
            value={voiceLang}
            onChange={(e) => setVoiceLang(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-hidden cursor-pointer shadow-2xs hover:border-indigo-500 transition-colors"
          >
            <option value="auto">🌐 Auto (Any Language)</option>
            <option value="en">English (EN)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => processQuery(p)}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-2xs transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col h-[540px] transition-colors">
        {/* Listening Banner */}
        {isListening && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-2xl flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold">
                Listening... ({voiceLang === 'auto' ? '🌐 AUTO' : voiceLang.toUpperCase()})
              </span>
            </div>
            <span className="text-[11px]">Speak clearly into your microphone...</span>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 rounded-2xl text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{speechError}</span>
            </div>
            <button onClick={() => setSpeechError(null)} className="font-bold">×</button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] space-y-2.5 ${m.sender === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed inline-block ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-750 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>

                {/* Proposed Transaction Card */}
                {m.proposal && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-2 text-left">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Receipt className="w-4 h-4" />
                        Parsed Transaction
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full">
                        {Math.round(m.proposal.confidence * 100)}% Confidence
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Amount</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          ₹{m.proposal.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Merchant</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate block">
                          {m.proposal.merchant}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Category</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {m.proposal.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Payment Mode</span>
                        {m.proposal.payment_method ? (
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {m.proposal.payment_method}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 text-[10px] bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-sm">
                            ⚠️ {t('companion.unspecified', 'Unspecified')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interactive Payment Method Selector Pills */}
                    {!m.proposalConfirmed && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/70 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {t('companion.selectPaymentPrompt', 'Select payment method:')}
                          </span>
                          {!m.proposal.payment_method && (
                            <span className="text-[9px] font-bold text-amber-500 animate-pulse">
                              Required *
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {[
                            { id: 'UPI', label: t('companion.methods.upi', '⚡ UPI') },
                            { id: 'Cash', label: t('companion.methods.cash', '💵 Cash') },
                            { id: 'Card', label: t('companion.methods.card', '💳 Card') },
                            { id: 'Net Banking', label: t('companion.methods.netBanking', '🏦 Net Banking') },
                          ].map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectPaymentMethod(i, opt.id)}
                              className={`text-[10px] py-1.5 px-2 rounded-lg font-bold border transition-all text-center ${
                                m.proposal.payment_method === opt.id
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-[1.02]'
                                  : 'bg-slate-50 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-indigo-400'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {m.proposalConfirmed ? (
                      <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Saved to Database!</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConfirmProposal(m.proposal, i)}
                        disabled={!m.proposal.payment_method}
                        className={`w-full mt-2 flex items-center justify-center gap-1.5 font-bold py-2 rounded-xl text-xs shadow-xs transition-colors ${
                          m.proposal.payment_method
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {m.proposal.payment_method
                            ? 'Confirm & Add Transaction'
                            : t('companion.pleaseSelectPayment', 'Select payment method above')}
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* Optional Metric Badges */}
                {m.metrics && (
                  <div className="grid grid-cols-3 gap-2 text-left">
                    {m.metrics.map((met, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40">
                        <span className="text-[10px] text-violet-700 dark:text-violet-300 font-semibold block">{met.label}</span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 block">{met.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600" />
                <span>SmartSpend is querying your financial records...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask questions or type/speak: '250 chai pe kharch kiye'..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-hidden focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all text-slate-800 dark:text-slate-100"
          />

          {/* Microphone Button */}
          {voiceSupported ? (
            <button
              type="button"
              onClick={toggleListening}
              title="Voice Input (English, Hindi, Marathi)"
              className={`p-3 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          ) : (
            <button
              type="button"
              disabled
              title="Voice input not supported in this browser."
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
            >
              <MicOff className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Grounding Disclaimer */}
        <div className="flex items-center justify-center gap-1.5 pt-3 text-[10px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          <span>Calculated directly from your authenticated database records. No hallucinations.</span>
        </div>
      </div>
    </div>
  )
}
