import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import { useEffect, useState } from 'react'
import { api } from './lib/axiosInstance'

// Checks if the signed-in user has completed onboarding (has a role in our DB)
function AuthGate({ children }) {
  const { isSignedIn, isLoaded } = useUser()
  const [dbUser, setDbUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    api.get('/api/auth/me')
      .then(res => {
        setDbUser(res.data.user)
        setLoading(false)
      })
      .catch(err => {
        if (err.response?.status === 404) {
          // User exists in Clerk but not in our DB yet → onboarding
          navigate('/onboarding', { replace: true })
        }
        setLoading(false)
      })
  }, [isLoaded, isSignedIn, navigate])

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return children(dbUser)
}

function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/sign-in" element={
        <>
          <SignedIn><Navigate to="/" replace /></SignedIn>
          <SignedOut><SignInPage /></SignedOut>
        </>
      } />
      <Route path="/sign-up" element={
        <>
          <SignedIn><Navigate to="/" replace /></SignedIn>
          <SignedOut><SignUpPage /></SignedOut>
        </>
      } />

      {/* Onboarding — signed in but no role yet */}
      <Route path="/onboarding" element={
        <>
          <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
          <SignedIn><OnboardingPage /></SignedIn>
        </>
      } />

      {/* Protected app routes */}
      <Route path="/*" element={
        <>
          <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
          <SignedIn>
            <AuthGate>
              {(dbUser) => dbUser ? <DashboardPage user={dbUser} /> : null}
            </AuthGate>
          </SignedIn>
        </>
      } />
    </Routes>
  )
}

export default App
