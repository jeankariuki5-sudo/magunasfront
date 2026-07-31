import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'
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
            <DashboardLayout>
                <p className="text-muted">Loading dashboard...</p>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <p className="text-red-500">{error}</p>
            </DashboardLayout>
        )
    }

    const { branch, orders, revenue, products, recent_orders, low_stock_products } = data

    return (
        <DashboardLayout title={branch.branch_name}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <p className="text-sm text-muted">{branch.address}</p>
                    <p className="text-sm text-muted">{branch.phone_number}</p>
                    <span className={`inline-block mt-1 ${branch.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {branch.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* Revenue */}
                <h2 className="section-title">Revenue</h2>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard label="Today" value={`KES ${revenue.today}`} accent />
                    <StatCard label="This Month" value={`KES ${revenue.this_month}`} />
                    <StatCard label="All Time" value={`KES ${revenue.total}`} />
                </div>

                {/* Orders */}
                <h2 className="section-title">Orders</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total" value={orders.total} />
                    <StatCard label="Pending" value={orders.pending} />
                    <StatCard label="Packed" value={orders.packed} />
                    <StatCard label="Out for Delivery" value={orders.out_for_delivery} />
                    <StatCard label="Ready for Pickup" value={orders.ready_for_pickup} />
                    <StatCard label="Completed" value={orders.completed} accent />
                </div>

                {/* Products */}
                <h2 className="section-title">Products</h2>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total" value={products.total} />
                    <StatCard label="Available" value={products.available} accent />
                    <StatCard label="Low Stock" value={products.low_stock_count} />
                </div>

                {/* Recent orders */}
                <h2 className="section-title">Recent Orders</h2>
                <div className="card-table mb-8">
                    {recent_orders.length === 0 ? (
                        <p className="p-5 text-sm text-brand-black/50 dark:text-white/50">No orders yet.</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="table-head">
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
                                    <tr key={order.id} className="table-row">
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
                <h2 className="section-title">Low Stock Products</h2>
                <div className="card-table">
                    {low_stock_products.length === 0 ? (
                        <p className="p-5 text-sm text-brand-black/50 dark:text-white/50">Nothing running low.</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="table-head">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Stock</th>
                                    <th className="px-4 py-3">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {low_stock_products.map((p, i) => (
                                    <tr key={i} className="table-row">
                                        <td className="px-4 py-3 text-brand-black dark:text-white">{p.product}</td>
                                        <td className="px-4 py-3 text-red-500 font-semibold">{p.stock_quantity}</td>
                                        <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">KES {p.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default BranchDashboard
