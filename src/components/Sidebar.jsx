import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

const navByRole = {
    customer: [
        { to: '/customer-dashboard', label: 'Dashboard', icon: 'bi-grid' },
        { to: '/shop', label: 'Shop', icon: 'bi-shop-window' },
        { to: '/cart', label: 'Cart', icon: 'bi-cart3' },
        { to: '/orders/my', label: 'My Orders', icon: 'bi-receipt' },
        { to: '/profile', label: 'Profile', icon: 'bi-person' },
        { to: '/feedback/my', label: 'My Feedback', icon: 'bi-chat-left-text' },
        { to: '/feedback/submit', label: 'Submit Feedback', icon: 'bi-pencil-square' },
    ],
    branch_manager: [
        { to: '/branch-dashboard', label: 'Dashboard', icon: 'bi-grid' },
        { to: '/branch-profile', label: 'Profile', icon: 'bi-person' },
        { to: '/branch-products', label: 'My Products', icon: 'bi-box-seam' },
        { to: '/branch-orders', label: 'Orders', icon: 'bi-receipt' },
        { to: '/branch-delivery-zones', label: 'Delivery Zones', icon: 'bi-geo-alt' },
        { to: '/branch-feedback', label: 'Branch Feedback', icon: 'bi-chat-left-text' },
        { to: '/branch-feedback/submit', label: 'Message Admin', icon: 'bi-send' },
    ],
    admin: [
        { to: '/admin-dashboard', label: 'Dashboard', icon: 'bi-grid' },
        { to: '/admin/users', label: 'All Users', icon: 'bi-people' },
        { to: '/admin/branches', label: 'Branches', icon: 'bi-shop' },
        { to: '/admin/create-branch', label: 'Add Branch', icon: 'bi-building-add' },
        { to: '/admin/branch-managers', label: 'Branch Managers', icon: 'bi-person-badge' },
        { to: '/admin/create-branch-manager', label: 'Add Branch Manager', icon: 'bi-person-plus' },
        { to: '/admin/categories', label: 'Categories', icon: 'bi-tags' },
        { to: '/admin/products', label: 'Products', icon: 'bi-box-seam' },
        { to: '/admin/branch-products', label: 'Branch Inventory', icon: 'bi-boxes' },
        { to: '/admin/orders', label: 'Orders', icon: 'bi-receipt' },
        { to: '/admin/feedback', label: 'Feedback', icon: 'bi-chat-left-text' },
        { to: '/admin/activity', label: 'Activity', icon: 'bi-clock-history' },
    ],
}

const Sidebar = ({ role, variant = 'desktop' }) => {
    const location = useLocation()
    const nav = navByRole[role] || []

    // 'desktop': hidden below md, shown as part of the normal layout above it.
    // 'mobile': always shown - used inside DashboardLayout's slide-over drawer,
    // which is itself only ever rendered below md in the first place.
    const visibilityClass = variant === 'mobile' ? 'flex' : 'hidden md:flex'

    // sticky + top-0 + h-screen pins the sidebar to the viewport as the page
    // scrolls, instead of it being a normal in-flow flex child that scrolls
    // away along with everything else. overflow-y-auto on the aside itself
    // (not the page) means if the nav list is ever taller than the screen,
    // only the sidebar scrolls internally - the rest of the layout doesn't.
    // The mobile drawer copy fills its own fixed-position wrapper instead
    // (h-full), since that wrapper is already pinned by DashboardLayout.
    const positionClass = variant === 'mobile' ? 'h-full' : 'sticky top-0 h-screen'

    return (
        <aside className={`w-64 shrink-0 border-r border-brand-black/10 dark:border-white/10 ${positionClass} overflow-y-auto ${visibilityClass} flex-col`}>
            <div className="px-6 py-6">
                <Logo size="sm" />
            </div>
            <nav className="flex-1 px-3 space-y-1">
                {nav.map((item) => {
                    const active = location.pathname === item.to
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                                active
                                    ? 'bg-brand-green/15 text-brand-green-deep dark:text-brand-green'
                                    : 'text-brand-black/60 dark:text-white/60 hover:bg-brand-black/5 dark:hover:bg-white/5'
                            }`}
                        >
                            <i className={`bi ${item.icon}`} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}

export default Sidebar
