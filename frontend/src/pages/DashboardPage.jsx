import { UserButton, useUser } from '@clerk/react'
import { useEffect } from 'react';

export default function DashboardPage() {
  const {user} = useUser();
  useEffect(() => {
    console.log(user)
  }, [user])


  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">TransitOps</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {user.publicMetadata.role.replace(/([A-Z])/g, ' $1').trim()} 
            </span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              {user.publicMetadata.role.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      {/* Placeholder content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400 mb-8">Welcome back, {user.fullName}.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Active Vehicles', 'Drivers On Duty', 'Pending Trips'].map((label) => (
            <div key={label} className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-sm">
              <p className="text-sm text-gray-400 mb-1">{label}</p>
              <p className="text-3xl font-bold">—</p>
            </div>
          ))}
        </div>

        <p className="text-gray-600 text-sm mt-10 text-center">
          Dashboard KPIs and full UI coming next. Auth + onboarding flow is complete.
        </p>
      </main>
    </div>
  )
}
