import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'
import PaymentPanel from './PaymentPanel'

const statusBadge = {
    placed: 'badge-pending',
    packed: 'badge-reviewed',
    out_for_delivery: 'badge-reviewed',
    ready_for_pickup: 'badge-reviewed',
    delivered: 'badge-resolved',
    cancelled: 'badge-inactive',
}

const paymentBadge = {
    success: 'badge-resolved',
    pending: 'badge-pending',
    failed: 'badge-inactive',
}

const statusLabel = (s) => s.replace(/_/g, ' ')

const statuses = ['', 'placed', 'packed', 'out_for_delivery', 'ready_for_pickup', 'delivered', 'cancelled']

const MyOrders = () => {
    const [orders, setOrders] = useState([])
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedId, setExpandedId] = useState(null)
    const [cancellingId, setCancellingId] = useState(null)
    const [payments, setPayments] = useState({}) // orderId -> payment status data
    const [payingId, setPayingId] = useState(null)

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const params = {}
            if (statusFilter) params.status = statusFilter
            const res = await api.get('orders/my_orders/', { params })
            setOrders(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchOrders() }, [statusFilter])

    const fetchPaymentStatus = async (orderId) => {
        try {
            const res = await api.get(`payments/payment_status/${orderId}/`)
            setPayments((prev) => ({ ...prev, [orderId]: res.data }))
        } catch {
            // silently skip - payment status is a nice-to-have, not critical
        }
    }

    const handleExpand = (order) => {
        const willExpand = expandedId !== order.id
        setExpandedId(willExpand ? order.id : null)
        if (willExpand && order.status !== 'cancelled' && !payments[order.id]) {
            fetchPaymentStatus(order.id)
        }
    }

    const handleCancel = async (orderId) => {
        if (!window.confirm('Cancel this order?')) return
        setCancellingId(orderId)
        setError('')
        try {
            await api.post(`orders/cancel_order/${orderId}/`)
            fetchOrders()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to cancel order')
        } finally {
            setCancellingId(null)
        }
    }

    const canCancel = (status) => !['delivered', 'cancelled'].includes(status)

    return (
        <DashboardLayout title="My Orders">
            <div className="max-w-2xl mx-auto">
                <div className="flex gap-2 mb-4 flex-wrap">
                    {statuses.map((s) => (
                        <button
                            key={s || 'all'}
                            onClick={() => setStatusFilter(s)}
                            className={statusFilter === s ? 'filter-pill-active' : 'filter-pill-inactive'}
                        >
                            {s ? statusLabel(s) : 'All'}
                        </button>
                    ))}
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
                            const payment = payments[order.id]
                            const unpaid = payment && ['no payment initiated', 'failed'].includes(payment.payment_status)
                            return (
                                <div key={order.id} className="card">
                                    <div
                                        className="flex justify-between items-start cursor-pointer"
                                        onClick={() => handleExpand(order)}
                                    >
                                        <div>
                                            <p className="font-semibold text-brand-black dark:text-white">
                                                Order #{order.id} · {order.branch}
                                            </p>
                                            <p className="text-xs text-faint capitalize mt-0.5">
                                                {order.fulfillment_type} · {new Date(order.created_at).toLocaleDateString()}
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

                                            {order.status !== 'cancelled' && payment && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-xs text-muted">Payment:</span>
                                                    <span className={paymentBadge[payment.payment_status] || 'badge-inactive'}>
                                                        {payment.payment_status === 'no payment initiated' ? 'unpaid' : payment.payment_status}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-3 items-center">
                                                {unpaid && payingId !== order.id && (
                                                    <button onClick={() => setPayingId(order.id)} className="btn-primary text-xs px-4 py-1.5">
                                                        {payment.payment_status === 'failed' ? 'Pay again' : 'Pay now'}
                                                    </button>
                                                )}
                                                {canCancel(order.status) && (
                                                    <button
                                                        onClick={() => handleCancel(order.id)}
                                                        disabled={cancellingId === order.id}
                                                        className="btn-text-danger"
                                                    >
                                                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel order'}
                                                    </button>
                                                )}
                                            </div>

                                            {payingId === order.id && (
                                                <div className="mt-3">
                                                    <PaymentPanel
                                                        orderId={order.id}
                                                        amount={order.total_amount}
                                                        onPaid={() => {
                                                            setPayingId(null)
                                                            fetchPaymentStatus(order.id)
                                                        }}
                                                    />
                                                </div>
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

export default MyOrders
