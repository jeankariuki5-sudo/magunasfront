import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import ThemeToggle from './context/ThemeToggle'
import Logo from './Logo'

const roleLabels = {
    admin: 'Admin',
    branch_manager: 'Branch Manager',
    customer: 'Customer',
}

const navByRole = {
    customer: [
        { to: '/customer-dashboard', label: 'Dashboard' },
        { to: '/profile', label: 'Profile' },
        { to: '/feedback/my', label: 'My Feedback' },
    ],
    branch_manager: [
        { to: '/branch-dashboard', label: 'Dashboard' },
        { to: '/branch-profile', label: 'Profile' },
        { to: '/branch-feedback', label: 'Branch Feedback' },
        { to: '/branch-feedback/submit', label: 'Message Admin' },
    ],
    admin: [
        { to: '/admin-dashboard', label: 'Dashboard' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/create-branch-manager', label: '+ Branch Manager' },
        { to: '/admin/feedback', label: 'Feedback' },
        { to: '/admin/activity', label: 'Activity' },
    ],
}

const DashboardHeader = ({ title }) => {
    const { user, Logout } = useContext(AuthContext)
    const nav = user ? navByRole[user.role] || [] : []

    return (
        <header className="border-b border-brand-black/10 dark:border-white/10">
            <div className="flex items-center justify-between px-6 md:px-12 py-6">
                <div className="flex items-center gap-4">
                    <Logo size="sm" />
                    {title && (
                        <span className="hidden sm:block text-brand-black/30 dark:text-white/30 text-xl">/</span>
                    )}
                    {title && (
                        <h1 className="hidden sm:block font-display font-semibold text-brand-black dark:text-white">
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
                    <button
                        onClick={Logout}
                        className="text-sm font-semibold text-red-500 hover:text-red-600 transition"
                    >
                        Log out
                    </button>
                </div>
            </div>

            {nav.length > 0 && (
                <nav className="flex gap-5 px-6 md:px-12 pb-4 overflow-x-auto">
                    {nav.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="text-sm text-brand-black/60 dark:text-white/60 hover:text-brand-green-deep dark:hover:text-brand-green whitespace-nowrap transition"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    )
}

export default DashboardHeader
