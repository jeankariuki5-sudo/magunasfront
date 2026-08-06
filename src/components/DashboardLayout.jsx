import { useContext, useState } from 'react'
import { AuthContext } from './context/AuthContext'
import ThemeToggle from './context/ThemeToggle'
import Sidebar from './Sidebar'
import Logo from './Logo'

const roleLabels = {
    admin: 'Admin',
    branch_manager: 'Branch Manager',
    customer: 'Customer',
}

const DashboardLayout = ({ title, children }) => {
    const { user, Logout } = useContext(AuthContext)
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="min-h-screen flex bg-brand-cream dark:bg-brand-black transition-colors">
            <Sidebar role={user?.role} />

            {/* Mobile drawer - same nav, shown as an overlay below md breakpoint */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 bg-brand-cream dark:bg-brand-black" onClick={() => setMobileOpen(false)}>
                        <Sidebar role={user?.role} variant="mobile" />
                    </div>
                </div>
            )}

            <div className="flex-1 min-w-0">
                <header className="flex items-center justify-between px-4 md:px-8 py-5 border-b border-brand-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden text-brand-black dark:text-white text-xl"
                            aria-label="Open menu"
                        >
                            <i className="bi bi-list" />
                        </button>
                        <div className="md:hidden">
                            <Logo size="sm" />
                        </div>
                        {title && (
                            <h1 className="hidden md:block font-display font-semibold text-brand-black dark:text-white">
                                {title}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-brand-black dark:text-white">{user.username}</p>
                                <p className="text-xs text-brand-black/50 dark:text-white/50">
                                    {roleLabels[user.role] || user.role}
                                </p>
                            </div>
                        )}
                        <ThemeToggle />
                        {user && (
                            <button
                                onClick={Logout}
                                className="text-sm font-semibold text-red-500 hover:text-red-600 transition"
                            >
                                Log out
                            </button>
                        )}
                    </div>
                </header>

                <main className="px-4 md:px-8 py-8">
                    {title && <h1 className="page-title md:hidden mb-6">{title}</h1>}
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout