import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/axiosInstance'

const ROLES = [
  {
    value: 'FleetManager',
    label: 'Fleet Manager',
    description: 'Oversee fleet assets, maintenance, vehicle lifecycle, and operational efficiency.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    color: 'from-blue-500 to-cyan-500',
    bgHover: 'hover:border-blue-500/50 hover:bg-blue-500/5',
  },
  {
    value: 'Dispatcher',
    label: 'Dispatcher',
    description: 'Create trips, assign vehicles and drivers, and monitor active deliveries.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-500',
    bgHover: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
  },
  {
    value: 'SafetyOfficer',
    label: 'Safety Officer',
    description: 'Ensure driver compliance, track license validity, and monitor safety scores.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    color: 'from-amber-500 to-orange-500',
    bgHover: 'hover:border-amber-500/50 hover:bg-amber-500/5',
  },
  {
    value: 'FinancialAnalyst',
    label: 'Financial Analyst',
    description: 'Review operational expenses, fuel consumption, maintenance costs, and profitability.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    color: 'from-purple-500 to-pink-500',
    bgHover: 'hover:border-purple-500/50 hover:bg-purple-500/5',
  },
]

export default function OnboardingPage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)
    setError('')

    try {
      await api.post('/api/auth/onboard', { role: selected })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">TransitOps</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 👋
          </h1>
          <p className="text-gray-400">Select your role to get started. This determines what you can access.</p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {ROLES.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelected(role.value)}
              className={`
                group relative text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                ${selected === role.value
                  ? `border-transparent bg-gradient-to-br ${role.color} text-white shadow-lg shadow-indigo-500/20`
                  : `border-gray-800 bg-gray-900/60 backdrop-blur-sm text-gray-300 ${role.bgHover}`
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-3
                ${selected === role.value
                  ? 'bg-white/20'
                  : `bg-gradient-to-br ${role.color} bg-clip-padding`
                }
              `}>
                <span className={selected === role.value ? 'text-white' : 'text-white'}>
                  {role.icon}
                </span>
              </div>
              <h3 className={`font-semibold text-lg mb-1 ${selected === role.value ? 'text-white' : 'text-white'}`}>
                {role.label}
              </h3>
              <p className={`text-sm leading-relaxed ${selected === role.value ? 'text-white/80' : 'text-gray-400'}`}>
                {role.description}
              </p>

              {/* Selected checkmark */}
              {selected === role.value && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className={`
            w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200
            ${selected
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 cursor-pointer'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Setting up...
            </span>
          ) : (
            'Continue to Dashboard →'
          )}
        </button>

        <p className="text-center text-gray-600 text-xs mt-6">
          Your role can be changed later by a Fleet Manager in Settings.
        </p>
      </div>
    </div>
  )
}
