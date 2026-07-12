import { Link, useLocation } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/react'
import { formatRole, getRoleHomePath } from '../lib/roleAccess'

const MENU_GROUPS = [
  {
    title: 'Overview',
    items: [
      {
        path: '/',
        label: 'Dashboard',
        roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'],
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        path: '/fleet',
        label: 'Fleet',
        roles: ['FleetManager'],
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        ),
      },
      {
        path: '/drivers',
        label: 'Drivers',
        roles: ['FleetManager', 'SafetyOfficer'],
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        path: '/trips',
        label: 'Trips',
        roles: ['FleetManager', 'Dispatcher'],
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        ),
      },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const { signOut } = useClerk()
  const { user } = useUser()
  const role = user?.publicMetadata?.role
  const roleLabel = formatRole(role)
  const homePath = getRoleHomePath(role)

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-900 flex flex-col min-h-screen text-gray-400 select-none">
      {/* Brand Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-gray-900/60">
        <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">TransitOps</span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-6 px-4 space-y-5">
        {MENU_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(role))

          if (visibleItems.length === 0) return null

          return (
            <div key={group.title} className="space-y-2">
              <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">{group.title}</p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.path
                  const isHome = homePath === item.path

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer
                        ${isActive
                          ? 'bg-amber-600/10 text-amber-500 border border-amber-600/20 font-semibold'
                          : 'hover:bg-gray-900 hover:text-white border border-transparent'
                        }
                      `}
                    >
                      <span className={isActive || isHome ? 'text-amber-500' : 'text-gray-500'}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {isHome && !isActive && (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Home</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User Footer / Log out */}
      <div className="p-4 border-t border-gray-900/60">
        <div className="mb-3 rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">Current Role</p>
          <p className="mt-1 text-sm font-semibold text-white">{roleLabel}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-150 cursor-pointer"
        >
          <svg className="w-5 h-5 text-gray-500 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </div>
    </aside>
  )
}
