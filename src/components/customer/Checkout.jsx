import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/api'
import { CartContext } from '../context/CartContext'
import DashboardLayout from '../DashboardLayout'

const Checkout = () => {
    const { cart, refreshCart } = useContext(CartContext)
    const navigate = useNavigate()

    const [fulfillmentType, setFulfillmentType] = useState('pickup')
    const [zones, setZones] = useState([])
    const [zoneId, setZoneId] = useState('')
    const [address, setAddress] = useState('')
    const [zonesLoading, setZonesLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [placedOrder, setPlacedOrder] = useState(null)

    const branchId = cart.branch?.id

    // Only fetch zones once the customer actually picks delivery -
    // no point loading them upfront for a pickup order.
    useEffect(() => {
        if (fulfillmentType !== 'delivery' || !branchId) return
        setZonesLoading(true)
        api.get(`branches/delivery_zones/${branchId}/`)
            .then((res) => setZones(res.data.delivery_zones || []))
            .catch(() => setError('Could not load delivery zones for this branch'))
            .finally(() => setZonesLoading(false))
    }, [fulfillmentType, branchId])

    const selectedZone = zones.find((z) => String(z.id) === String(zoneId))
    const deliveryFee = fulfillmentType === 'delivery' && selectedZone ? Number(selectedZone.delivery_fee) : 0
    const grandTotal = Number(cart.total) + deliveryFee

    const handlePlaceOrder = async () => {
        setError('')

        if (fulfillmentType === 'delivery' && !zoneId) {
            setError('Please select a delivery zone')
            return
        }
        if (fulfillmentType === 'delivery' && !address.trim()) {
            setError('Please enter a delivery address')
            return
        }

        setSubmitting(true)
        try {
            const payload = { fulfillment_type: fulfillmentType }
            if (fulfillmentType === 'delivery') {
                payload.delivery_zone_id = zoneId
                payload.delivery_address = address
            }
            const res = await api.post('orders/place_order/', payload)
            setPlacedOrder(res.data.order)
            refreshCart() // cart is now empty server-side
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to place order')
        } finally {
            setSubmitting(false)
        }
    }

    if (placedOrder) {
        return (
            <DashboardLayout title="Order Placed">
                <div className="max-w-md mx-auto card text-center py-10">
                    <i className="bi bi-check-circle text-4xl text-brand-green-deep dark:text-brand-green mb-3" />
                    <h2 className="section-title">Order #{placedOrder.id} placed!</h2>
                    <p className="text-sm text-muted mb-1">{placedOrder.branch}</p>
                    <p className="text-sm text-muted mb-4 capitalize">{placedOrder.fulfillment_type}</p>
                    <p className="text-2xl font-display font-semibold text-brand-black dark:text-white mb-6">
                        KES {placedOrder.total_amount}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link to="/orders/my" className="btn-primary">View My Orders</Link>
                        <Link to="/shop" className="btn-ghost">Continue Shopping</Link>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (cart.items.length === 0) {
        return (
            <DashboardLayout title="Checkout">
                <div className="max-w-md mx-auto card text-center py-10">
                    <p className="text-muted mb-4">Your cart is empty.</p>
                    <Link to="/shop" className="btn-primary inline-block">Browse Shop</Link>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Checkout">
            <div className="max-w-md mx-auto space-y-4">
                {error && <div className="alert-error">{error}</div>}

                <div className="card">
                    <p className="section-title text-sm">Fulfillment</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFulfillmentType('pickup')}
                            className={fulfillmentType === 'pickup' ? 'filter-pill-active flex-1 py-2' : 'filter-pill-inactive flex-1 py-2'}
                        >
                            <i className="bi bi-shop mr-1" /> Pickup
                        </button>
                        <button
                            onClick={() => setFulfillmentType('delivery')}
                            className={fulfillmentType === 'delivery' ? 'filter-pill-active flex-1 py-2' : 'filter-pill-inactive flex-1 py-2'}
                        >
                            <i className="bi bi-truck mr-1" /> Delivery
                        </button>
                    </div>
                </div>

                {fulfillmentType === 'pickup' ? (
                    <div className="card">
                        <p className="text-sm text-muted mb-1">Pickup from</p>
                        <p className="font-semibold text-brand-black dark:text-white">{cart.branch?.branch_name}</p>
                    </div>
                ) : (
                    <div className="card space-y-3">
                        <div>
                            <label className="text-sm text-muted block mb-1">Delivery zone</label>
                            {zonesLoading ? (
                                <p className="text-sm text-muted">Loading zones...</p>
                            ) : (
                                <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="select-field">
                                    <option value="" className="text-black">Select a zone</option>
                                    {zones.map((z) => (
                                        <option key={z.id} value={z.id} className="text-black">
                                            {z.zone_name} — KES {z.delivery_fee}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {!zonesLoading && zones.length === 0 && (
                                <p className="text-xs text-faint mt-1">No delivery zones available for this branch yet.</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-muted block mb-1">Delivery address</label>
                            <textarea
                                value={address} onChange={(e) => setAddress(e.target.value)} rows={3}
                                placeholder="Street, building, landmark..."
                                className="input-field resize-none"
                            />
                        </div>
                    </div>
                )}

                <div className="card">
                    <p className="section-title text-sm">Order summary</p>
                    <div className="space-y-1 text-sm">
                        {cart.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-brand-black/70 dark:text-white/70">
                                <span>{item.quantity} × {item.product_name}</span>
                                <span>KES {item.subtotal}</span>
                            </div>
                        ))}
                        {deliveryFee > 0 && (
                            <div className="flex justify-between text-brand-black/70 dark:text-white/70">
                                <span>Delivery fee</span>
                                <span>KES {deliveryFee.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between mt-3 pt-3 border-t border-brand-black/10 dark:border-white/10 font-semibold text-brand-black dark:text-white">
                        <span>Total</span>
                        <span>KES {grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                <button onClick={handlePlaceOrder} disabled={submitting} className="btn-primary-block">
                    {submitting ? 'Placing order...' : 'Place Order'}
                </button>
                <p className="text-xs text-faint text-center">Payment via M-Pesa happens after your order is confirmed.</p>
            </div>
        </DashboardLayout>
    )
}

export default Checkout
