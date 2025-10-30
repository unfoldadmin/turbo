import Link from 'next/link'

export default function Home() {
  const pages = [
    { name: 'Dashboard', href: '/dashboard', description: 'Overview and key metrics' },
    { name: 'Fuel Farm', href: '/fuel-farm', description: 'Monitor fuel tank levels' },
    { name: 'Dispatch', href: '/dispatch', description: 'Manage fuel transactions' },
    { name: 'Flights', href: '/flights', description: 'View and manage flight schedule' },
    { name: 'Training', href: '/training', description: 'Track certifications and training' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            FBO Manager
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Airport Fuel Operations Management System
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {page.name}
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                {page.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            API Status: <a href="http://localhost:8000/api/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">http://localhost:8000/api/</a>
          </p>
        </div>
      </div>
    </div>
  )
}
