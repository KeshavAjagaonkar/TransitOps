// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import OnboardingPage from './pages/OnboardingPage'
import SyncPage from './pages/SyncPage'
import DashboardPage from './pages/DashboardPage'
import VehicleRegistryPage from './pages/VehicleRegistryPage'
import DriversPage from './pages/DriversPage'
import TripsPage from './pages/TripsPage'
import Layout from './components/Layout'
import { GuestOnly, RequireAuth, RequireNoOnboarding, RequireOnboarding } from './routes/guards'

function App() {
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
            <Route path="/" element={<DashboardPage />} />
            <Route path="/fleet" element={<VehicleRegistryPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App