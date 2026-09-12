import React, { useState, useEffect, useRef } from 'react'
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Receipt,
  CheckCircle2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../services/supabase'

export default function AiCompanionPanel() {
  const { t } = useTranslation()
  const { isDark, language } = useTheme()
  const { user } = useAuth()
  const { showBudgetExceededToast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState(null)
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [voiceLang, setVoiceLang] = useState('auto') // 'auto' (Any Language), 'en', 'hi', or 'mr'

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: t('companion.subtitle', 'Ask any financial question or speak/type to add transactions in ANY language (English, हिंदी, मराठी)! Try: "Add 500 petrol UPI", "200 chaha cash add kar", or "Mera kharcha kitna hua?".'),
      proposal: null
    }
  ])

  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  // Check speech recognition availability
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceSupported(false)
    }
  }, [])

  // Start or Stop Voice Recognition
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
      
      // Map language code to BCP 47
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
          // Automatically submit parsed transcription after 800ms
          setTimeout(() => {
            handleSubmitQuery(transcript)
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
      setSpeechError('Could not start microphone: ' + err.message)
    }
  }

  // Handle Query Submission (Text or Voice)
  const handleSubmitQuery = async (queryText) => {
    const text = (queryText || input).trim()
    if (!text || loading) return

    setInput('')
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
          proposal: null
        })
        return updated
      })
      return
    }

    setLoading(true)

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }])

    try {
      // 1. Call Backend NLP parser
      const res = await fetch('http://127.0.0.1:5000/api/v1/ai/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: voiceLang })
      })

      const data = await res.json()
      
      if (data?.success && data?.data?.is_transaction && data.data.amount > 0) {
        const txProposal = data.data
        const isMethodSpecified = Boolean(txProposal.payment_method_specified && txProposal.payment_method)
        
        const responseText = isMethodSpecified
          ? t('companion.identifiedExpense', {
              amount: txProposal.amount.toLocaleString('en-IN'),
              merchant: txProposal.merchant,
              category: txProposal.category,
              method: txProposal.payment_method,
              defaultValue: `I identified an expense: **₹${txProposal.amount.toLocaleString('en-IN')}** for **${txProposal.merchant}** (${txProposal.category}) via ${txProposal.payment_method}.`
            })
          : t('companion.askPaymentMethod', {
              amount: txProposal.amount.toLocaleString('en-IN'),
              merchant: txProposal.merchant,
              category: txProposal.category,
              defaultValue: `I identified an expense: **₹${txProposal.amount.toLocaleString('en-IN')}** for **${txProposal.merchant}** (${txProposal.category}). You didn't specify a payment method. How did you pay? (Cash, UPI, or Card?)`
            })

        // Add AI message with Transaction Proposal Card
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: responseText,
            proposal: {
              ...txProposal,
              payment_method: isMethodSpecified ? txProposal.payment_method : null
            }
          }
        ])
      } else {
        // Not an expense input -> grounded financial query fallback
        await processGroundedQuery(text)
      }
    } catch (err) {
      console.warn('NLP parser request failed, fallback to local grounded query:', err)
      await processGroundedQuery(text)
    } finally {
      setLoading(false)
    }
  }

  // Grounded financial queries from authenticated database
  const processGroundedQuery = async (text) => {
    if (!user) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Please log in to query your real-time financial database.',
          proposal: null
        }
      ])
      return
    }

    try {
      const now = new Date()
      const currentMonth = now.toISOString().slice(0, 7)
      
      const [txRes, rRes, bRes] = await Promise.all([
        supabase.from('transactions').select('*, categories(name)').eq('user_id', user.id),
        supabase.from('recurring_expenses').select('*').eq('user_id', user.id),
        supabase.from('budgets').select('*, categories(name)').eq('user_id', user.id)
      ])

      const txs = txRes.data || []
      const recurring = rRes.data || []
      const budgets = bRes.data || []

      const currentExpenses = txs.filter(t => t.type === 'expense' && t.date?.startsWith(currentMonth))
      const totalSpend = currentExpenses.reduce((s, t) => s + Number(t.amount || 0), 0)
      const totalBudget = budgets.reduce((s, b) => s + Number(b.amount || 0), 0)
      const totalSubs = recurring.reduce((s, r) => s + Number(r.amount || 0), 0)

      const lower = text.toLowerCase()
      
      // Detect language from text
      const isMarathi = /(kiti|zala|jhala|shillak|konta|maza|majha|ahe|ahet|kuthe|madhe|kharch|खर्च|किती|झाला|शिल्लक|कुठे|आहे|सांगा)/i.test(lower)
      const isHindi = /(kitna|hua|bacha|kiska|kahan|hai|batao|sabse|jyada|kharcha|खर्चा|कितना|हुआ|बचा|कहाँ|है|बताओ|ज्यादा)/i.test(lower)

      let reply = ''

      // 1. Highest / Top expense
      if (/(highest|largest|biggest|top|motha|jast|jyada|bada|sarvat|sabse|सर्वात|मोठा|जास्त|बड़ा)/i.test(lower)) {
        const sorted = [...currentExpenses].sort((a,b) => Number(b.amount) - Number(a.amount))
        if (sorted.length > 0) {
          const topTx = sorted[0]
          const merchantName = topTx.description || topTx.merchant || 'Expense'
          const amt = Number(topTx.amount).toLocaleString('en-IN')
          if (isMarathi) {
            reply = `या महिन्यातील तुमचा सर्वात मोठा खर्च **₹${amt}** हा **${merchantName}** साठी होता (${topTx.date}).`
          } else if (isHindi) {
            reply = `इस महीने आपका सबसे बड़ा खर्च **₹${amt}** था **${merchantName}** के लिए (${topTx.date})।`
          } else {
            reply = `Your highest expense this month was **₹${amt}** for **${merchantName}** on ${topTx.date}.`
          }
        } else {
          reply = isMarathi
            ? 'या महिन्यात अजून कोणताही खर्च नोंदवलेला नाही.'
            : isHindi
            ? 'इस महीने अभी तक कोई खर्च दर्ज नहीं किया गया है।'
            : 'No transactions recorded yet this month.'
        }
      } 
      // 2. Budget status / Remaining balance
      else if (/(budget|balance|shillak|bacha|remaining|limit|baki|बजट|शिल्लक|बाकी|बचा)/i.test(lower)) {
        if (totalBudget > 0) {
          const remaining = totalBudget - totalSpend
          if (remaining < 0) {
            const overAmt = Math.abs(remaining).toLocaleString('en-IN')
            if (isMarathi) {
              reply = `⚠️ **सावधान: बजेट मर्यादा ओलांडली आहे!**\nतुमचा एकूण मासिक बजेट **₹${totalBudget.toLocaleString('en-IN')}** असून, चालू महिन्याचा खर्च **₹${totalSpend.toLocaleString('en-IN')}** झाला आहे (**₹${overAmt} बजेटपेक्षा जास्त**).`
            } else if (isHindi) {
              reply = `⚠️ **सावधान: बजट सीमा पार हो गई है!**\nआपका कुल मासिक बजट **₹${totalBudget.toLocaleString('en-IN')}** है और खर्च **₹${totalSpend.toLocaleString('en-IN')}** हो चुका है (**₹${overAmt} बजट से अधिक**)।`
            } else {
              reply = `⚠️ **Alert: Monthly Budget Exceeded!**\nYour budget limit is **₹${totalBudget.toLocaleString('en-IN')}**, but you have spent **₹${totalSpend.toLocaleString('en-IN')}** (**₹${overAmt} over budget**).`
            }
          } else {
            const remAmt = remaining.toLocaleString('en-IN')
            if (isMarathi) {
              reply = `चालू महिन्याचा बजेट: **₹${totalBudget.toLocaleString('en-IN')}**\nएकूण खर्च: **₹${totalSpend.toLocaleString('en-IN')}**\nशिल्लक बजेट: **₹${remAmt}**`
            } else if (isHindi) {
              reply = `इस महीने का कुल बजट: **₹${totalBudget.toLocaleString('en-IN')}**\nकुल खर्च: **₹${totalSpend.toLocaleString('en-IN')}**\nशेष बचा बजट: **₹${remAmt}**`
            } else {
              reply = `Monthly Budget: **₹${totalBudget.toLocaleString('en-IN')}**\nTotal Spent: **₹${totalSpend.toLocaleString('en-IN')}**\nRemaining Budget: **₹${remAmt}**`
            }
          }
        } else {
          reply = isMarathi
            ? `चालू महिन्याचा एकूण खर्च **₹${totalSpend.toLocaleString('en-IN')}** आहे. तुम्ही बजेट पेजवरून बजेट सेट करू शकता.`
            : isHindi
            ? `इस महीने का कुल खर्च **₹${totalSpend.toLocaleString('en-IN')}** है। आप बजट पेज से नया बजट बना सकते हैं।`
            : `You have spent **₹${totalSpend.toLocaleString('en-IN')}** this month. You have not set any active monthly budgets yet.`
        }
      }
      // 2b. Expense Prediction & Month-end Forecast Query
      else if (/(predict|prediction|forecast|future|month-end|burn rate|next month|अंदाज|भविष्य|पुढील महिना|पुढचा महिना|महिना अखेर)/i.test(lower)) {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const currentDay = now.getDate() || 1
        const dailyRate = Math.round(totalSpend / currentDay)
        const projectedTotal = Math.round(totalSpend + dailyRate * (daysInMonth - currentDay))

        if (totalSpend > 0) {
          if (isMarathi) {
            reply = `🔮 **खर्च अंदाज (Forecasting):**\nचालू महिन्याचा आतापर्यंतचा खर्च **₹${totalSpend.toLocaleString('en-IN')}** आहे (दररोज सरासरी ₹${dailyRate.toLocaleString('en-IN')}). या गतीने महिनाअखेर तुमचा एकूण खर्च **₹${projectedTotal.toLocaleString('en-IN')}** होण्याची शक्यता आहे.`
          } else if (isHindi) {
            reply = `🔮 **खर्च अनुमान (Forecasting):**\nइस महीने का अब तक का खर्च **₹${totalSpend.toLocaleString('en-IN')}** है (दैनिक औसत ₹${dailyRate.toLocaleString('en-IN')})। इस गति से महीने के अंत तक आपका कुल खर्च **₹${projectedTotal.toLocaleString('en-IN')}** होने का अनुमान है।`
          } else {
            reply = `🔮 **Expense Forecast:**\nYou have spent **₹${totalSpend.toLocaleString('en-IN')}** so far this month (averaging ₹${dailyRate.toLocaleString('en-IN')}/day). At this pace, your projected month-end spend will reach **₹${projectedTotal.toLocaleString('en-IN')}**.`
          }
        } else {
          reply = isMarathi
            ? 'चालू महिन्यात अजून पुरेसा खर्च नोंदवलेला नाही, त्यामुळे अंदाज उपलब्ध नाही.'
            : isHindi
            ? 'इस महीने में अभी तक पर्याप्त खर्च दर्ज नहीं किया गया है, इसलिए अनुमान उपलब्ध नहीं है।'
            : 'Not enough transactions recorded this month yet to generate an accurate forecast.'
        }
      }
      // 3. Subscriptions / Recurring Bills
      else if (/(subscription|recurring|dar mahina|har mahine|mahinyala|सबस्क्रिप्शन|दर महिना)/i.test(lower)) {
        if (recurring.length > 0) {
          const subNames = recurring.map(r => `${r.merchant} (₹${Number(r.amount).toLocaleString('en-IN')})`).join(', ')
          if (isMarathi) {
            reply = `तुमची **${recurring.length} नियमित देयके** सुरू आहेत, ज्यांचा एकूण मासिक खर्च **₹${totalSubs.toLocaleString('en-IN')}** आहे (${subNames}).`
          } else if (isHindi) {
            reply = `आपके **${recurring.length} नियमित खर्च** सक्रिय हैं, कुल मासिक खर्च **₹${totalSubs.toLocaleString('en-IN')}** है (${subNames})।`
          } else {
            reply = `You have **${recurring.length} recurring subscriptions** totaling **₹${totalSubs.toLocaleString('en-IN')}/month**: ${subNames}.`
          }
        } else {
          reply = isMarathi ? 'कोणतेही सक्रिय सबस्क्रिप्शन आढळले नाही.' : isHindi ? 'कोई सक्रिय सबस्क्रिप्शन नहीं मिला।' : 'No recurring subscriptions found.'
        }
      }
      // 4. How to add transaction / Help
      else if (/(how to add|kasa karu|kaise jode|kaise kare|madat|madad|help|add|taka|jodo)/i.test(lower)) {
        reply = `💡 **You can tell me anytime in ANY language to add an expense:**\n\n• **English:** "Add 500 petrol UPI" or "Record 150 coffee cash"\n• **मराठी:** "200 chaha cash add kar" किंवा "50 vadapav cash taka"\n• **हिंदी:** "500 rupaye petrol ka kharcha jodo UPI se" किंवा "200 chai cash likho"`
      }
      // 5. Total Spending / Summary (Default or explicit)
      else {
        if (isMarathi) {
          reply = `या महिन्यात तुम्ही **${currentExpenses.length} व्यवहारांमध्ये** एकूण **₹${totalSpend.toLocaleString('en-IN')}** खर्च केले आहेत.\n\nतुम्ही मला कोणताही खर्च जोडायला सांगू शकता (उदा. "200 chaha cash add kara" किंवा "500 petrol upi").`
        } else if (isHindi) {
          reply = `इस महीने आपने **${currentExpenses.length} लेनदेनों** में कुल **₹${totalSpend.toLocaleString('en-IN')}** खर्च किए हैं।\n\nआप मुझे कोई भी खर्च जोड़ने के लिए कह सकते हैं (जैसे "200 chai cash jodo" या "500 petrol UPI")।`
        } else {
          reply = `You have recorded **₹${totalSpend.toLocaleString('en-IN')}** in expenses this month across **${currentExpenses.length} transactions**.\n\nYou can speak or type in any language to log an expense (e.g. "Add 500 petrol UPI", "200 chaha cash add kar").`
        }
      }

      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: reply, proposal: null }
      ])
    } catch (e) {
      console.error('Database query error:', e)
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Finora AI database query failed temporarily.', proposal: null }
      ])
    }
  }

  // Select Payment Method for a Proposal
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

  // Confirm and Save Proposed Transaction to Supabase
  const handleConfirmProposal = async (proposal, index) => {
    if (!user) return
    if (!proposal.payment_method) {
      alert(t('companion.pleaseSelectPayment', 'Please select a payment method before confirming.'))
      return
    }
    try {
      // Find category id if possible
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${proposal.category}%`)
        .limit(1)

      const categoryId = cats?.[0]?.id || null

      // Find user's default account
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

      // Mark proposal confirmed in UI
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

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50">
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3.5 rounded-full shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/45 transition-all duration-200 hover:scale-105 active:scale-95"
          title={t('companion.title', 'Money Helper')}
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white animate-bounce" />
          </div>
          <span className="text-xs font-bold tracking-tight hidden sm:inline">
            Money Helper
          </span>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
        </button>
      )}

      {/* Expanded Floating AI Companion Panel */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[560px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight leading-none">Money Helper</h3>
                  <span className="text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded-md">{t('companion.voiceBadge', 'Voice')}</span>
                </div>
                <p className="text-[10px] text-white/80 mt-0.5">
                  {voiceLang === 'auto' ? '🌐 Auto Detect (EN • हिंदी • मराठी)' : t('companion.languages', 'English • हिंदी • मराठी')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice & Query Language Selector */}
              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
                className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold rounded-lg px-2 py-1 outline-hidden border border-white/20 cursor-pointer"
                title="Voice & Query Language"
              >
                <option value="auto" className="text-slate-900">🌐 Auto (Any Lang)</option>
                <option value="en" className="text-slate-900">EN (English)</option>
                <option value="hi" className="text-slate-900">हिंदी (Hindi)</option>
                <option value="mr" className="text-slate-900">मराठी (Marathi)</option>
              </select>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Listening Indicator Banner */}
          {isListening && (
            <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2 flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold">{t('companion.listening', 'Listening...')}</span>
                <span className="text-[11px] opacity-80">
                  ({voiceLang === 'auto' ? '🌐 AUTO' : voiceLang.toUpperCase()})
                </span>
              </div>
              <span className="text-[10px]">{t('companion.speakNow', 'Speak clearly into your microphone...')}</span>
            </div>
          )}

          {/* Speech Error Banner */}
          {speechError && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/40 px-3 py-1.5 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1">{speechError}</span>
              <button onClick={() => setSpeechError(null)} className="text-xs font-bold">×</button>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50 dark:bg-slate-950/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-xs shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>

                {/* Proposed Transaction Card */}
                {m.proposal && (
                  <div className="mt-2 w-[85%] p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Receipt className="w-3.5 h-3.5" />
                        {t('companion.proposalTitle', 'Transaction Proposal')}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full">
                        {t('companion.match', { confidence: Math.round(m.proposal.confidence * 100), defaultValue: `${Math.round(m.proposal.confidence * 100)}% Match` })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('companion.amount', 'Amount')}</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          ₹{m.proposal.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('companion.merchant', 'Merchant')}</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate block">
                          {m.proposal.merchant}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('companion.category', 'Category')}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {m.proposal.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('companion.paymentMethod', 'Mode')}</span>
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
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'UPI', label: t('companion.methods.upi', '⚡ UPI') },
                            { id: 'Cash', label: t('companion.methods.cash', '💵 Cash') },
                            { id: 'Card', label: t('companion.methods.card', '💳 Card') },
                            { id: 'Net Banking', label: t('companion.methods.netBanking', '🏦 Net Banking') },
                          ].map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectPaymentMethod(idx, opt.id)}
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
                      <div className="pt-1 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('companion.proposalAdded', 'Saved to Database!')}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConfirmProposal(m.proposal, idx)}
                        disabled={!m.proposal.payment_method}
                        className={`w-full mt-1 flex items-center justify-center gap-1.5 font-bold py-2 rounded-xl text-xs shadow-xs transition-colors ${
                          m.proposal.payment_method
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {m.proposal.payment_method
                            ? t('companion.confirmProposal', 'Confirm & Add Transaction')
                            : t('companion.pleaseSelectPayment', 'Select payment method above')}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>{t('companion.processing', 'SmartSpend is processing...')}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions based on active language */}
          <div className="px-3 py-2 bg-slate-100/60 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-slate-800 flex gap-1.5 overflow-x-auto">
            {(language === 'mr' 
              ? ['250 चहा वर खर्च केला', '1000 पेट्रोल', '20,000 न्यू बॅटरी']
              : language === 'hi'
              ? ['250 चाय पे खर्च किए', '1000 पेट्रोल', '20,000 न्यू बैटरी']
              : ['250 spend on chai', '1000 petrol', '20,000 new battery']
            ).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSubmitQuery(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input & Mic Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmitQuery()
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('companion.placeholder', "Type or speak: '250 chai pe kharch kiye'...")}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-hidden focus:border-indigo-600 transition-colors"
            />

            {/* Voice Input Microphone Button */}
            {voiceSupported ? (
              <button
                type="button"
                onClick={toggleListening}
                title={t('companion.micTooltip', 'Voice Input (English, Hindi, Marathi)')}
                className={`p-2.5 rounded-xl transition-all ${
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
                title={t('companion.unsupportedTooltip', 'Voice input not supported in this browser.')}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
              >
                <MicOff className="w-4 h-4" />
              </button>
            )}

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
