import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/react'
import { getRoleHomePath } from '../lib/roleAccess'

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}

function useAuthState() {
  // isLoaded/isSignedIn from useAuth is the source of truth for session state
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { isLoaded: userLoaded, user } = useUser()
  const role = user?.publicMetadata?.role
  return {
    isLoaded: authLoaded && userLoaded,
    isSignedIn,
    isOnboarded: Boolean(role),
    role,
  }
}

// Auth pages (sign-in/sign-up): only for signed-out users
export function GuestOnly() {
  const { isLoaded, isSignedIn, isOnboarded, role } = useAuthState()
  if (!isLoaded) return <LoadingScreen />
  if (isSignedIn) {
    return <Navigate to={isOnboarded ? getRoleHomePath(role) : '/onboarding'} replace />
  }
  return <Outlet />
}

// Everything past this point requires a signed-in user
export function RequireAuth() {
  const { isLoaded, isSignedIn } = useAuthState()
  if (!isLoaded) return <LoadingScreen />
  if (!isSignedIn) return <Navigate to="/sign-in" replace />
  return <Outlet />
}

// /onboarding: already-onboarded users get bounced to their dashboard
export function RequireNoOnboarding() {
  const { isLoaded, isOnboarded, role } = useAuthState()
  if (!isLoaded) return <LoadingScreen />
  if (isOnboarded) return <Navigate to={getRoleHomePath(role)} replace />
  return <Outlet />
}

// Main app: must have completed onboarding
export function RequireOnboarding() {
  const { isLoaded, isOnboarded } = useAuthState()
  if (!isLoaded) return <LoadingScreen />
  if (!isOnboarded) return <Navigate to="/onboarding" replace />
  return <Outlet />
}