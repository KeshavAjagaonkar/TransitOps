import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="flex bg-gray-950 min-h-screen text-white font-sans antialiased overflow-x-hidden w-full">
      {/* Sidebar on Left */}
      <Sidebar />

      {/* Main Content Area on Right */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full">
        {/* Navbar Header */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 bg-gray-950/40">
          {children}
        </main>
      </div>
    </div>
  )
}
