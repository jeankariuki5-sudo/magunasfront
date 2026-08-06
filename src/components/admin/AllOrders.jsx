import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

const statusBadge = {
    placed: 'badge-pending',
    packed: 'badge-reviewed',
    out_for_delivery: 'badge-reviewed',
    ready_for_pickup: 'badge-reviewed',
    delivered: 'badge-resolved',
    cancelled: 'badge-inactive',
}

const statusLabel = (s) => s.replace(/_/g, ' ')
const statusFilters = ['', 'placed', 'packed', 'out_for_delivery', 'ready_for_pickup', 'delivered', 'cancelled']

const nextOptions = (order) => {
    const { status, fulfillment_type } = order
    if (status === 'placed') return ['packed', 'cancelled']
    if (status === 'packed') {
        return fulfillment_type === 'delivery' ? ['out_for_delivery', 'cancelled'] : ['ready_for_pickup', 'cancelled']
    }
    if (status === 'out_for_delivery' || status === 'ready_for_pickup') return ['delivered', 'cancelled']
    return []
}

const AllOrders = () => {
    const [orders, setOrders] = useState([])
    const [branches, setBranches] = useState([])
    const [statusFilter, setStatusFilter] = useState('')
    const [fulfillmentFilter, setFulfillmentFilter] = useState('')
    const [branchFilter, setBranchFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedId, setExpandedId] = useState(null)
    const [updatingId, setUpdatingId] = useState(null)

    useEffect(() => {
        api.get('branches/branch_list/').then((res) => setBranches(res.data)).catch(() => {})
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const params = {}
            if (statusFilter) params.status = statusFilter
            if (fulfillmentFilter) params.fulfillment_type = fulfillmentFilter
            if (branchFilter) params.branch = branchFilter
            const res = await api.get('orders/all_orders/', { params })
            setOrders(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchOrders() }, [statusFilter, fulfillmentFilter, branchFilter])

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId)
        setError('')
        try {
            await api.put(`orders/update_order_status/${orderId}/`, { status: newStatus })
            fetchOrders()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update order status')
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <DashboardLayout title="All Orders">
            <div className="max-w-3xl mx-auto">
                <div className="flex gap-2 mb-3 flex-wrap">
                    {statusFilters.map((s) => (
                        <button
                            key={s || 'all'}
                            onClick={() => setStatusFilter(s)}
                            className={statusFilter === s ? 'filter-pill-active' : 'filter-pill-inactive'}
                        >
                            {s ? statusLabel(s) : 'All statuses'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 mb-4 flex-wrap">
                    <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="input-field-sm px-3 py-1.5">
                        <option value="" className="text-black">All branches</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id} className="text-black">{b.branch_name}</option>
                        ))}
                    </select>
                    <select value={fulfillmentFilter} onChange={(e) => setFulfillmentFilter(e.target.value)} className="input-field-sm px-3 py-1.5">
                        <option value="" className="text-black">All types</option>
                        <option value="pickup" className="text-black">Pickup</option>
                        <option value="delivery" className="text-black">Delivery</option>
                    </select>
                </div>

                {error && <div className="alert-error mb-3">{error}</div>}

                {loading ? (
                    <p className="text-sm text-muted">Loading orders...</p>
                ) : orders.length === 0 ? (
                    <p className="text-sm text-brand-black/50 dark:text-white/50">No orders found.</p>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => {
                            const expanded = expandedId === order.id
                            const options = nextOptions(order)
                            return (
                                <div key={order.id} className="card">
                                    <div
                                        className="flex justify-between items-start cursor-pointer"
                                        onClick={() => setExpandedId(expanded ? null : order.id)}
                                    >
                                        <div>
                                            <p className="font-semibold text-brand-black dark:text-white">
                                                Order #{order.id} · {order.customer}
                                            </p>
                                            <p className="text-xs text-faint capitalize mt-0.5">
                                                {order.branch} · {order.fulfillment_type} · {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={statusBadge[order.status]}>{statusLabel(order.status)}</span>
                                            <p className="text-sm font-semibold text-brand-black dark:text-white mt-1">KES {order.total_amount}</p>
                                        </div>
                                    </div>

                                    {expanded && (
                                        <div className="mt-4 pt-4 border-t border-brand-black/10 dark:border-white/10">
                                            <div className="space-y-1 text-sm mb-3">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-brand-black/70 dark:text-white/70">
                                                        <span>{item.quantity} × {item.product_name}</span>
                                                        <span>KES {item.subtotal}</span>
                                                    </div>
                                                ))}
                                                {Number(order.delivery_fee) > 0 && (
                                                    <div className="flex justify-between text-brand-black/70 dark:text-white/70">
                                                        <span>Delivery fee ({order.delivery_zone})</span>
                                                        <span>KES {order.delivery_fee}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {order.fulfillment_type === 'delivery' && order.delivery_address && (
                                                <p className="text-xs text-faint mb-3">Deliver to: {order.delivery_address}</p>
                                            )}

                                            {options.length > 0 ? (
                                                <select
                                                    value=""
                                                    disabled={updatingId === order.id}
                                                    onChange={(e) => e.target.value && handleStatusChange(order.id, e.target.value)}
                                                    className="input-field-sm text-xs px-2 py-1"
                                                >
                                                    <option value="" className="text-black">
                                                        {updatingId === order.id ? 'Updating...' : 'Move to...'}
                                                    </option>
                                                    {options.map((opt) => (
                                                        <option key={opt} value={opt} className="text-black">{statusLabel(opt)}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="text-xs text-faint">No further updates possible.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default AllOrders
