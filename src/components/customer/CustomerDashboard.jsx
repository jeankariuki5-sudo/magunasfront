import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardHeader from '../DashboardHeader'
import StatCard from '../StatCard'

const CustomerDashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('accounts/dashboard/customer/')
                setData(res.data)
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load dashboard')
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-cream dark:bg-brand-black flex items-center justify-center transition-colors">
                <p className="text-brand-black/60 dark:text-white/60">Loading dashboard...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-brand-cream dark:bg-brand-black flex items-center justify-center transition-colors">
                <p className="text-red-500">{error}</p>
            </div>
        )
    }

    const { profile, orders, total_spent, cart } = data
    // The backend only includes cart fields if the customer actually has a
    // cart (hasattr check) - otherwise it comes back as {}, so guard on that
    // rather than assuming cart.items exists.
    const hasCart = cart && cart.item_count > 0

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
            <DashboardHeader title={`Welcome, ${profile.first_name}`} />

            <main className="px-6 md:px-12 py-8 max-w-4xl mx-auto">
                {/* Order stats */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Your Orders</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total" value={orders.total} />
                    <StatCard label="Pending" value={orders.pending} />
                    <StatCard label="Completed" value={orders.completed} accent />
                    <StatCard label="Cancelled" value={orders.cancelled} />
                </div>

                <div className="mb-8">
                    <StatCard label="Total Spent" value={`KES ${total_spent}`} accent />
                </div>

                {/* Cart */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Your Cart</h2>
                <div className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl overflow-hidden mb-8">
                    {!hasCart ? (
                        <p className="p-5 text-sm text-brand-black/50 dark:text-white/50">Your cart is empty.</p>
                    ) : (
                        <>
                            <div className="px-4 py-3 border-b border-brand-black/5 dark:border-white/5 flex justify-between text-sm">
                                <span className="text-brand-black/60 dark:text-white/60">{cart.branch}</span>
                                <span className="font-semibold text-brand-black dark:text-white">KES {cart.total}</span>
                            </div>
                            <table className="w-full text-sm text-left">
                                <tbody>
                                    {cart.items.map((item, i) => (
                                        <tr key={i} className="border-t border-brand-black/5 dark:border-white/5">
                                            <td className="px-4 py-3 text-brand-black dark:text-white">{item.product}</td>
                                            <td className="px-4 py-3 text-brand-black/60 dark:text-white/60">x{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-brand-black dark:text-white">KES {item.subtotal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>

                {/* Profile */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Delivery Address</h2>
                <div className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl p-5">
                    <p className="text-sm text-brand-black/70 dark:text-white/70">
                        {profile.default_delivery_address || 'No delivery address set yet.'}
                    </p>
                </div>
            </main>
        </div>
    )
}

export default CustomerDashboard
