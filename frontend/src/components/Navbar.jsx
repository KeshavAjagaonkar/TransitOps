import { UserButton, useUser } from '@clerk/react'
import { formatRole } from '../lib/roleAccess'

export default function Navbar() {
    const { user } = useUser()

    const initials = user?.fullName
        ? user.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
        : 'U'

    const roleDisplay = formatRole(user?.publicMetadata?.role)

    return (
        <header className="h-16 border-b border-gray-900 bg-gray-950/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40 select-none">
            {/* Search Input on Left */}
            <div className="relative w-72">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-9 pr-4 py-1.5 bg-gray-900/60 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150"
                />
            </div>

            {/* User Info on Right */}
            <div className="flex items-center gap-4">
                {/* User profile & Role */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-white">{user?.fullName || 'Raven K.'}</p>
                        <p className="text-[11px] text-gray-500">{roleDisplay}</p>
                    </div>

                    {/* Role Pill */}
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
                        {roleDisplay}
                    </span>
                </div>

                {/* User initials circle or Clerk UserButton */}

                <UserButton
                    afterSignOutUrl="/sign-in"
                    appearance={{
                        elements: {
                            userButtonTrigger: 'w-8 h-8',
                        },
                    }}
                />
            </div>
        </header>
    )
}
