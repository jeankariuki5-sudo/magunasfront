import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardHeader from '../DashboardHeader'
import StatCard from '../StatCard'

const BranchDashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('accounts/dashboard/branch_manager/')
                setData(res.data)
            } catch (err) {
                // The view returns a real 404 with a specific message if this
                // manager isn't assigned to a branch yet - worth showing as-is
                // rather than a generic error.
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

    const { branch, orders, revenue, products, recent_orders, low_stock_products } = data

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
            <DashboardHeader title={branch.branch_name} />

            <main className="px-6 md:px-12 py-8 max-w-6xl mx-auto">
                <div className="mb-6">
                    <p className="text-sm text-brand-black/60 dark:text-white/60">{branch.address}</p>
                    <p className="text-sm text-brand-black/60 dark:text-white/60">{branch.phone_number}</p>
                    <span className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-full ${branch.is_active ? 'bg-brand-green/15 text-brand-green-deep' : 'bg-red-100 text-red-600'}`}>
                        {branch.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* Revenue */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Revenue</h2>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard label="Today" value={`KES ${revenue.today}`} accent />
                    <StatCard label="This Month" value={`KES ${revenue.this_month}`} />
                    <StatCard label="All Time" value={`KES ${revenue.total}`} />
                </div>

                {/* Orders */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Orders</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total" value={orders.total} />
                    <StatCard label="Pending" value={orders.pending} />
                    <StatCard label="Packed" value={orders.packed} />
                    <StatCard label="Out for Delivery" value={orders.out_for_delivery} />
                    <StatCard label="Ready for Pickup" value={orders.ready_for_pickup} />
                    <StatCard label="Completed" value={orders.completed} accent />
                </div>

                {/* Products */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Products</h2>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total" value={products.total} />
                    <StatCard label="Available" value={products.available} accent />
                    <StatCard label="Low Stock" value={products.low_stock_count} />
                </div>

                {/* Recent orders */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Recent Orders</h2>
                <div className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl overflow-hidden mb-8">
                    {recent_orders.length === 0 ? (
                        <p className="p-5 text-sm text-brand-black/50 dark:text-white/50">No orders yet.</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-brand-black/5 dark:bg-white/5 text-brand-black/60 dark:text-white/60">
                                <tr>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Fulfillment</th>
                                    <th className="px-4 py-3">Total</th>
                                    <th className="px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_orders.map((order) => (
                                    <tr key={order.id} className="border-t border-brand-black/5 dark:border-white/5">
                                        <td className="px-4 py-3 text-brand-black dark:text-white">{order.customer}</td>
                                        <td className="px-4 py-3 capitalize text-brand-black/70 dark:text-white/70">{order.status}</td>
                                        <td className="px-4 py-3 capitalize text-brand-black/70 dark:text-white/70">{order.fulfillment_type}</td>
                                        <td className="px-4 py-3 text-brand-black dark:text-white">KES {order.total_amount}</td>
                                        <td className="px-4 py-3 text-brand-black/50 dark:text-white/50">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Low stock */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Low Stock Products</h2>
                <div className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl overflow-hidden">
                    {low_stock_products.length === 0 ? (
                        <p className="p-5 text-sm text-brand-black/50 dark:text-white/50">Nothing running low.</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-brand-black/5 dark:bg-white/5 text-brand-black/60 dark:text-white/60">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Stock</th>
                                    <th className="px-4 py-3">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {low_stock_products.map((p, i) => (
                                    <tr key={i} className="border-t border-brand-black/5 dark:border-white/5">
                                        <td className="px-4 py-3 text-brand-black dark:text-white">{p.product}</td>
                                        <td className="px-4 py-3 text-red-500 font-semibold">{p.stock_quantity}</td>
                                        <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">KES {p.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    )
}

export default BranchDashboard
