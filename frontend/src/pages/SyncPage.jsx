import { useEffect, useState } from 'react'
import { useUser } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/axiosInstance'
import { getRoleHomePath } from '../lib/roleAccess'

export default function SyncPage() {
  const { isLoaded, user } = useUser()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Syncing your account...')

  useEffect(() => {
    if (!isLoaded) return

    let cancelled = false

    const runSync = async () => {
      try {
        const role = user?.publicMetadata?.role
        const response = await api.post('/user/sync', role ? { role } : {})
        const resolvedRole = response.data?.role

        if (!cancelled) {
          navigate(resolvedRole ? getRoleHomePath(resolvedRole) : '/onboarding', { replace: true })
        }
      } catch (err) {
        if (cancelled) return

        if (err.response?.status === 409) {
          navigate('/onboarding', { replace: true })
          return
        }

        setStatus(err.response?.data?.error || 'Unable to sync account right now.')
      }
    }

    runSync()

    return () => {
      cancelled = true
    }
  }, [isLoaded, navigate, user])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <h1 className="text-xl font-semibold text-white mb-2">Account sync</h1>
        <p className="text-gray-400 text-sm">{status}</p>
      </div>
    </div>
  )
}