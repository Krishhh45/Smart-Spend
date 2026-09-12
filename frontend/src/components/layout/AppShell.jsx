import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  BarChart3, 
  PieChart, 
  Sparkles, 
  Bot, 
  Calendar, 
  Wallet, 
  FileText, 
  Settings, 
  User, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X, 
  TrendingUp, 
  Plus,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sun,
  Moon,
  Globe,
  Sliders
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../services/supabase'
import AiCompanionPanel from '../AiCompanionPanel'

export default function AppShell({ children }) {
  const { t } = useTranslation()
  const { user, profile, logout } = useAuth()
  const { theme, isDark, toggleTheme, language, changeLanguage } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fetch notifications
  useEffect(() => {
    if (!user) return
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6)
      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    }
    fetchNotifs()
  }, [user])

  const markAllRead = async () => {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const navItems = [
    { label: t('nav.overview', 'Overview'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.transactions', 'Transactions'), path: '/transactions', icon: Receipt },
    { label: t('nav.addExpense', 'Add Expense'), path: '/transactions/add', icon: PlusCircle, isPrimaryAction: true },
    { label: t('nav.analytics', 'Analytics'), path: '/analytics', icon: BarChart3 },
    { label: t('nav.budgets', 'Budgets'), path: '/budget', icon: PieChart },
    { label: t('nav.predictions', 'Predictions'), path: '/predictions', icon: Sparkles },
    { label: t('nav.expensePlanner', 'Expense Planner'), path: '/planner', icon: Sliders },
    { label: t('nav.calendar', 'Calendar'), path: '/calendar', icon: Calendar },
    { label: t('nav.accounts', 'Accounts'), path: '/accounts', icon: Wallet },
    { label: t('nav.reports', 'Reports'), path: '/reports', icon: FileText },
  ]

  const secondaryNavItems = [
    { label: t('nav.profile', 'Profile'), path: '/profile', icon: User },
    { label: t('nav.settings', 'Settings'), path: '/settings', icon: Settings },
  ]

  const getPageTitle = () => {
    const current = [...navItems, ...secondaryNavItems].find(item => item.path === location.pathname)
    return current ? current.label : 'SmartSpend'
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col md:flex-row aurora-bg transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 p-4 sticky top-0 h-screen z-30 shadow-xs transition-colors duration-200">
        {/* Brand Header with Stitch Aurora Styling */}
        <div className="flex items-center gap-3 px-2 py-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-manrope font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              SmartSpend
            </h1>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              {t('brand.tagline', 'Your money, simplified')}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-50 to-violet-50/60 dark:from-indigo-950/60 dark:to-violet-950/40 text-indigo-700 dark:text-indigo-400 font-bold border-l-4 border-indigo-600 shadow-xs scale-[1.01]'
                    : item.isAi
                    ? 'text-violet-700 dark:text-violet-400 hover:bg-violet-50/70 dark:hover:bg-violet-950/30 font-semibold'
                    : item.isPrimaryAction
                    ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : item.isAi ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
                {item.isAi && (
                  <span className="ml-auto text-[10px] font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">
                    AI
                  </span>
                )}
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              {t('nav.preferences', 'Preferences')}
            </span>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Card & Logout */}
        <div className="pt-3 mt-auto border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2">
          <Link to="/profile" className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {profile?.full_name || 'My Account'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
            </div>
          </Link>
          <button
            onClick={logout}
            title={t('nav.logout', 'Log out')}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Top Bar */}
        <header className="h-16 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{getPageTitle()}</h2>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle Button (Sun / Moon) */}
            <button
              onClick={toggleTheme}
              title={isDark ? t('theme.light', 'Switch to Light Mode') : t('theme.dark', 'Switch to Dark Mode')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Language Switcher Dropdown */}
            <div className="relative flex items-center">
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-transparent text-xs font-semibold outline-hidden cursor-pointer"
                  title={t('language.select', 'Select Language')}
                >
                  <option value="en" className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">English</option>
                  <option value="hi" className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">हिंदी</option>
                  <option value="mr" className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">मराठी</option>
                </select>
              </div>
            </div>

            {/* Quick Add Expense Action Button (Stitch Pattern) */}
            <Link
              to="/transactions/add"
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('common.addTransaction', 'Add Expense')}</span>
            </Link>

            {/* Command Palette Trigger Button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden lg:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 px-3 py-1.5 rounded-xl transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('common.search', 'Search SmartSpend...')}</span>
              <kbd className="text-[10px] font-semibold bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300">
                Ctrl K
              </kbd>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(prev => !prev)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-750 max-h-72 overflow-y-auto mt-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No notifications yet</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl text-xs transition-colors ${
                            n.is_read ? 'opacity-70' : 'bg-indigo-50/40 dark:bg-indigo-950/30 font-medium'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {n.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Button */}
            <Link
              to="/transactions/add"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.quickAdd', 'Add Expense')}</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Floating AI Companion Panel (Persistent Across All Routes) */}
      <AiCompanionPanel />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/40 backdrop-blur-xs flex">
          <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 border-r border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  S
                </div>
                <span className="font-bold text-slate-900 dark:text-white">SmartSpend</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</span>
              <button onClick={logout} className="text-xs text-rose-600 font-semibold">
                {t('nav.logout', 'Logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around px-2 z-40">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 text-[11px] ${
            location.pathname === '/dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{t('nav.overview', 'Home')}</span>
        </Link>
        <Link
          to="/transactions"
          className={`flex flex-col items-center gap-1 text-[11px] ${
            location.pathname === '/transactions' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>{t('nav.transactions', 'Activity')}</span>
        </Link>

        {/* Center Prominent Add Button */}
        <Link
          to="/transactions/add"
          className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </Link>

        <Link
          to="/analytics"
          className={`flex flex-col items-center gap-1 text-[11px] ${
            location.pathname === '/analytics' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>{t('nav.analytics', 'Analytics')}</span>
        </Link>
        <Link
          to="/settings"
          className={`flex flex-col items-center gap-1 text-[11px] ${
            location.pathname === '/settings' ? 'text-violet-600 dark:text-violet-400 font-bold' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>{t('nav.settings', 'Settings')}</span>
        </Link>
      </div>

      {/* Command Palette Modal (Ctrl+K) */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder={t('common.search', 'Search SmartSpend navigation...')}
                className="w-full text-sm outline-hidden text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setCommandPaletteOpen(false)
                }}
              />
              <kbd className="text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
            <div className="p-2 divide-y divide-slate-50 dark:divide-slate-800 max-h-80 overflow-y-auto">
              <div className="py-1">
                <span className="px-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quick Jump</span>
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setCommandPaletteOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4 text-slate-400" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
