import { SignUp } from '@clerk/clerk-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">TransitOps</span>
          </div>
          <p className="text-gray-400 text-sm">Create your account to get started</p>
        </div>

        {/* Clerk Sign Up component */}
        <div className="flex justify-center">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/onboarding"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-gray-900/80 backdrop-blur-xl border border-gray-800 shadow-2xl',
                headerTitle: 'text-white',
                headerSubtitle: 'text-gray-400',
                socialButtonsBlockButton: 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700',
                formFieldLabel: 'text-gray-300',
                formFieldInput: 'bg-gray-800 border-gray-700 text-white',
                footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
