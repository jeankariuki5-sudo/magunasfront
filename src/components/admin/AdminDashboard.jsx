import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardHeader from '../DashboardHeader'
import StatCard from '../StatCard'

const AdminDashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('accounts/dashboard/admin/')
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

    const { users, branches, orders, revenue, recent_orders, low_stock_products, recent_suspensions } = data

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
            <DashboardHeader title="Admin Dashboard" />

            <main className="px-6 md:px-12 py-8 max-w-6xl mx-auto">
                {/* Users */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Users</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <StatCard label="Customers" value={users.total_customers} />
                    <StatCard label="Branch Managers" value={users.total_branch_managers} />
                    <StatCard label="Suspended" value={users.total_suspended} />
                </div>

                {/* Branches */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Branches</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total" value={branches.total} />
                    <StatCard label="Active" value={branches.active} accent />
                    <StatCard label="Inactive" value={branches.inactive} />
                </div>

                {/* Orders + Revenue */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Orders & Revenue</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <StatCard label="Total Orders" value={orders.total} />
                    <StatCard label="Pending" value={orders.pending} />
                    <StatCard label="Completed" value={orders.completed} accent />
                    <StatCard label="Cancelled" value={orders.cancelled} />
                    <StatCard label="Revenue" value={`KES ${revenue.total}`} accent />
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
                                    <th className="px-4 py-3">Branch</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Total</th>
                                    <th className="px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_orders.map((order) => (
                                    <tr key={order.id} className="border-t border-brand-black/5 dark:border-white/5">
                                        <td className="px-4 py-3 text-brand-black dark:text-white">{order.customer}</td>
                                        <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">{order.branch}</td>
                                        <td className="px-4 py-3 capitalize text-brand-black/70 dark:text-white/70">{order.status}</td>
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
                <div className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl overflow-hidden mb-8">
                    {low_stock_products.length === 0 ? (
                        <p className="p-5 text-sm text-brand-black/50 dark:text-white/50">Nothing running low.</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-brand-black/5 dark:bg-white/5 text-brand-black/60 dark:text-white/60">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Branch</th>
                                    <th className="px-4 py-3">Stock</th>
                                    <th className="px-4 py-3">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {low_stock_products.map((p, i) => (
                                    <tr key={i} className="border-t border-brand-black/5 dark:border-white/5">
                                        <td className="px-4 py-3 text-brand-black dark:text-white">{p.product}</td>
                                        <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">{p.branch}</td>
                                        <td className="px-4 py-3 text-red-500 font-semibold">{p.stock_quantity}</td>
                                        <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">KES {p.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Recent suspensions */}
                <h2 className="font-display font-semibold text-brand-black dark:text-white mb-3">Recent Suspensions</h2>
                <div className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl overflow-hidden">
                    {recent_suspensions.length === 0 ? (
                        <p className="p-5 text-sm text-brand-black/50 dark:text-white/50">No suspensions.</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-brand-black/5 dark:bg-white/5 text-brand-black/60 dark:text-white/60">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Reason</th>
                                    <th className="px-4 py-3">By</th>
                                    <th className="px-4 py-3">Lift At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_suspensions.map((s, i) => (
                                    <tr key={i} className="border-t border-brand-black/5 dark:border-white/5">
                                        <td className="px-4 py-3 text-brand-black dark:text-white">{s.user}</td>
                                        <td className="px-4 py-3 capitalize text-brand-black/70 dark:text-white/70">{s.suspension_type}</td>
                                        <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">{s.reason}</td>
                                        <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">{s.suspended_by}</td>
                                        <td className="px-4 py-3 text-brand-black/50 dark:text-white/50">
                                            {s.lift_at ? new Date(s.lift_at).toLocaleDateString() : '—'}
                                        </td>
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

export default AdminDashboard
