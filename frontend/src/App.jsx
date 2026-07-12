// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import OnboardingPage from './pages/OnboardingPage'
import SyncPage from './pages/SyncPage'
import DashboardPage from './pages/DashboardPage'
import VehicleRegistryPage from './pages/VehicleRegistryPage'
import DriversPage from './pages/DriversPage'
import TripsPage from './pages/TripsPage'
import MaintenancePage from './pages/MaintenancePage'
import FuelExpensesPage from './pages/FuelExpensesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/Layout'
import { GuestOnly, RequireAuth, RequireNoOnboarding, RequireOnboarding } from './routes/guards'
import { getRoleHomePath } from './lib/roleAccess'

function App() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role
  const roleHomePath = role ? getRoleHomePath(role) : '/dashboard'

  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<RequireNoOnboarding />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        <Route path="/syncing" element={<SyncPage />} />

        <Route element={<RequireOnboarding />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to={roleHomePath} replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/fleet" element={<VehicleRegistryPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/fuel-expenses" element={<FuelExpensesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to={roleHomePath} replace />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App