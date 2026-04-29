import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Wallet } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <div className="flex items-center px-4 py-3 border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 md:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-6 h-6 bg-primary-500 rounded-lg flex items-center justify-center">
              <Wallet size={12} className="text-white" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-white text-sm tracking-tight">Financeiro</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
