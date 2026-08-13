import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/api'
import { CartContext } from '../context/CartContext'
import DashboardLayout from '../DashboardLayout'
import LocationPicker from '../LocationPicker'
import PaymentPanel from './PaymentPanel'

const Checkout = () => {
    const { cart, refreshCart } = useContext(CartContext)
    const navigate = useNavigate()

    const [fulfillmentType, setFulfillmentType] = useState('pickup')
    const [deliveryLocation, setDeliveryLocation] = useState(null) // { address, lat, lng }
    const [deliveryFee, setDeliveryFee] = useState(0)
    const [distanceKm, setDistanceKm] = useState(null)
    const [feeLoading, setFeeLoading] = useState(false)
    const [feeError, setFeeError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [placedOrder, setPlacedOrder] = useState(null)
    const [paid, setPaid] = useState(false)

    const [pointsBalance, setPointsBalance] = useState(0)
    const [pointsToRedeem, setPointsToRedeem] = useState('')

    const branchId = cart.branch?.id
    const feeRequestId = useRef(0)

    useEffect(() => {
        api.get('loyalty/my_account/')
            .then((res) => setPointsBalance(res.data.points_balance))
            .catch(() => {}) // non-critical - redemption section just won't offer points
    }, [])

    // Quote the delivery fee (KES 150 within 10km, +KES 50 per extra 10km)
    // any time the customer moves the pin. Debounced a little since manual
    // lat/lng entry can fire a change per keystroke.
    useEffect(() => {
        if (fulfillmentType !== 'delivery' || !branchId || !deliveryLocation?.lat || !deliveryLocation?.lng) {
            setDeliveryFee(0)
            setDistanceKm(null)
            return
        }

        const requestId = ++feeRequestId.current
        setFeeLoading(true)
        setFeeError('')

        const timer = setTimeout(() => {
            api.get('branches/delivery_fee/', {
                params: { branch_id: branchId, lat: deliveryLocation.lat, lng: deliveryLocation.lng },
            })
                .then((res) => {
                    if (requestId !== feeRequestId.current) return // a newer request superseded this one
                    setDeliveryFee(Number(res.data.delivery_fee))
                    setDistanceKm(res.data.distance_km)
                })
                .catch((err) => {
                    if (requestId !== feeRequestId.current) return
                    setFeeError(err.response?.data?.error || 'Could not calculate delivery fee for this location')
                    setDeliveryFee(0)
                    setDistanceKm(null)
                })
                .finally(() => {
                    if (requestId === feeRequestId.current) setFeeLoading(false)
                })
        }, 400)

        return () => clearTimeout(timer)
    }, [fulfillmentType, branchId, deliveryLocation?.lat, deliveryLocation?.lng])

    const preDiscountTotal = Number(cart.total) + (fulfillmentType === 'delivery' ? deliveryFee : 0)

    // 1 point = KES 1. Can't redeem more points than you have, and can't
    // redeem more than the order is actually worth - mirrors the backend check.
    const maxRedeemable = Math.min(pointsBalance, Math.floor(preDiscountTotal))
    const redeemedPoints = Math.min(Number(pointsToRedeem) || 0, maxRedeemable)
    const grandTotal = preDiscountTotal - redeemedPoints

    const handlePlaceOrder = async () => {
        setError('')

        if (fulfillmentType === 'delivery' && (!deliveryLocation?.lat || !deliveryLocation?.lng)) {
            setError('Please pin your delivery location on the map')
            return
        }
        if (fulfillmentType === 'delivery' && !deliveryLocation?.address?.trim()) {
            setError('Please enter a delivery address')
            return
        }
        if (fulfillmentType === 'delivery' && feeLoading) {
            setError('Still calculating your delivery fee - one moment')
            return
        }

        setSubmitting(true)
        try {
            const payload = { fulfillment_type: fulfillmentType }
            if (fulfillmentType === 'delivery') {
                payload.delivery_address = deliveryLocation.address
                payload.delivery_latitude = deliveryLocation.lat
                payload.delivery_longitude = deliveryLocation.lng
            }
            if (redeemedPoints > 0) {
                payload.points_to_redeem = redeemedPoints
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
                <div className="max-w-md mx-auto space-y-4">
                    <div className="card text-center py-8">
                        <i className="bi bi-check-circle text-4xl text-brand-green-deep dark:text-brand-green mb-3" />
                        <h2 className="section-title">Order #{placedOrder.id} placed!</h2>
                        <p className="text-sm text-muted mb-1">{placedOrder.branch}</p>
                        <p className="text-sm text-muted mb-4 capitalize">{placedOrder.fulfillment_type}</p>
                        <p className="text-2xl font-display font-semibold text-brand-black dark:text-white">
                            KES {placedOrder.total_amount}
                        </p>
                        {Number(placedOrder.points_redeemed) > 0 && (
                            <p className="text-xs text-muted mt-1">
                                {placedOrder.points_redeemed} points redeemed (KES {placedOrder.points_discount} off)
                            </p>
                        )}
                        {placedOrder.delivery_distance_km != null && (
                            <p className="text-xs text-faint mt-1">
                                {placedOrder.delivery_distance_km} km from {placedOrder.branch} · KES {placedOrder.delivery_fee} delivery
                            </p>
                        )}
                    </div>

                    {!paid ? (
                        <PaymentPanel
                            orderId={placedOrder.id}
                            amount={placedOrder.total_amount}
                            onPaid={() => setPaid(true)}
                        />
                    ) : (
                        <div className="flex gap-3 justify-center">
                            <Link to="/orders/my" className="btn-primary">View My Orders</Link>
                            <Link to="/shop" className="btn-ghost">Continue Shopping</Link>
                        </div>
                    )}

                    {!paid && (
                        <p className="text-xs text-faint text-center">
                            Not ready to pay? Your order is saved — you can pay anytime from{' '}
                            <Link to="/orders/my" className="link-accent">My Orders</Link>.
                        </p>
                    )}
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
                            <label className="text-sm text-muted block mb-1">Delivery location</label>
                            <LocationPicker value={deliveryLocation} onChange={setDeliveryLocation} height="220px" />
                        </div>
                        {feeError && <p className="text-xs text-red-500">{feeError}</p>}
                        {!feeError && deliveryLocation?.lat && (
                            <p className="text-xs text-faint">
                                {feeLoading
                                    ? 'Calculating delivery fee...'
                                    : distanceKm != null
                                        ? `${distanceKm} km from ${cart.branch?.branch_name} · KES ${deliveryFee} delivery fee`
                                        : null}
                            </p>
                        )}
                        <p className="text-xs text-faint">
                            KES 150 within 10km, +KES 50 for every extra 10km.
                        </p>
                    </div>
                )}

                {pointsBalance > 0 && (
                    <div className="card">
                        <div className="flex justify-between items-center mb-2">
                            <p className="section-title text-sm mb-0">Redeem points</p>
                            <span className="text-xs text-muted">{pointsBalance} available</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="number" min="0" max={maxRedeemable}
                                placeholder="0"
                                value={pointsToRedeem}
                                onChange={(e) => setPointsToRedeem(e.target.value)}
                                className="input-field-sm flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => setPointsToRedeem(String(maxRedeemable))}
                                className="btn-ghost text-xs whitespace-nowrap"
                            >
                                Use max ({maxRedeemable})
                            </button>
                        </div>
                        <p className="text-xs text-faint mt-1">1 point = KES 1 off this order</p>
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
                        {fulfillmentType === 'delivery' && deliveryFee > 0 && (
                            <div className="flex justify-between text-brand-black/70 dark:text-white/70">
                                <span>Delivery fee</span>
                                <span>KES {deliveryFee.toFixed(2)}</span>
                            </div>
                        )}
                        {redeemedPoints > 0 && (
                            <div className="flex justify-between text-brand-green-deep dark:text-brand-green">
                                <span>Points redeemed ({redeemedPoints})</span>
                                <span>-KES {redeemedPoints.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between mt-3 pt-3 border-t border-brand-black/10 dark:border-white/10 font-semibold text-brand-black dark:text-white">
                        <span>Total</span>
                        <span>KES {grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handlePlaceOrder}
                    disabled={submitting || (fulfillmentType === 'delivery' && feeLoading)}
                    className="btn-primary-block"
                >
                    {submitting ? 'Placing order...' : 'Place Order'}
                </button>
                <p className="text-xs text-faint text-center">Payment via M-Pesa happens after your order is confirmed.</p>
            </div>
        </DashboardLayout>
    )
}

export default Checkout