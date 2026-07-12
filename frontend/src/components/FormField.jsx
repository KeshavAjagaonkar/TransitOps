export function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function FieldClass(hasError) {
  return `w-full bg-gray-900/60 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${
    hasError ? 'border-red-500/60 focus:border-red-500' : 'border-gray-800 focus:border-indigo-500/50'
  }`
}