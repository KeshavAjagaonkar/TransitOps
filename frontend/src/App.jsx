// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { Show, useUser } from '@clerk/react'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import OnboardingPage from './pages/OnboardingPage'
import SyncPage from './pages/SyncPage'
import DashboardPage from './pages/DashboardPage'
import VehicleRegistryPage from './pages/VehicleRegistryPage'
import DriversPage from './pages/DriversPage'
import TripsPage from './pages/TripsPage'
import Layout from './components/Layout'
import { getRoleHomePath } from './lib/roleAccess'

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

function App() {
  // Straight off Clerk's own hook — no wrapper needed. Role lives in
  // publicMetadata (set once, at onboarding, via POST /api/user/sync).
  const { isLoaded, user } = useUser()
  const role = user?.publicMetadata?.role
  const isOnboarded = Boolean(role)
  const roleHomePath = getRoleHomePath(role)

  return (
    <Routes>
      {/* Public auth routes — signed-in users never see these */}
      <Route
        path="/sign-in"
        element={
          <>
            <Show when="signed-in"><Navigate to={isOnboarded ? roleHomePath : '/onboarding'} replace /></Show>
            <Show when="signed-out"><SignInPage /></Show>
          </>
        }
      />
      <Route
        path="/sign-up"
        element={
          <>
            <Show when="signed-in"><Navigate to={isOnboarded ? roleHomePath : '/onboarding'} replace /></Show>
            <Show when="signed-out"><SignUpPage /></Show>
          </>
        }
      />

      {/* Onboarding — signed in, no role yet. Already-onboarded users get bounced to the dashboard. */}
      <Route
        path="/onboarding"
        element={
          <>
            <Show when="signed-out"><Navigate to="/sign-in" replace /></Show>
            <Show when="signed-in">
              {!isLoaded ? (
                <LoadingScreen />
              ) : isOnboarded ? (
                <Navigate to={roleHomePath} replace />
              ) : (
                <OnboardingPage />
              )}
            </Show>
          </>
        }
      />

      <Route
        path="/syncing"
        element={
          <>
            <Show when="signed-out"><Navigate to="/sign-in" replace /></Show>
            <Show when="signed-in">
              {!isLoaded ? <LoadingScreen /> : <SyncPage />}
            </Show>
          </>
        }
      />

      {/* Protected app — role check decides onboarding vs dashboard, no API round-trip */}
      <Route
        path="/*"
        element={
          <>
            <Show when="signed-out"><Navigate to="/sign-in" replace /></Show>
            <Show when="signed-in">
              {!isLoaded ? (
                <LoadingScreen />
              ) : !isOnboarded ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Layout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/fleet" element={<VehicleRegistryPage />} />
                    <Route path="/drivers" element={<DriversPage />} />
                    <Route path="/trips" element={<TripsPage />} />
                    {/* Fallback for other pages */}
                    <Route path="*" element={<DashboardPage />} />
                  </Routes>
                </Layout>
              )}
            </Show>
          </>
        }
      />
    </Routes>
  )
}

export default App