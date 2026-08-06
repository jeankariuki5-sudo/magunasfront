import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CartContext } from '../context/CartContext'
import DashboardLayout from '../DashboardLayout'

const Cart = () => {
    const { cart, loading, error, updateCartItem, removeCartItem, clearCart } = useContext(CartContext)
    const navigate = useNavigate()

    const handleQuantity = (item, delta) => {
        const next = item.quantity + delta
        if (next < 1) return
        updateCartItem(item.id, next)
    }

    const handleClear = async () => {
        if (!window.confirm('Clear your entire cart?')) return
        await clearCart()
    }

    if (loading && cart.items.length === 0) {
        return (
            <DashboardLayout title="Cart">
                <p className="text-muted">Loading cart...</p>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="Cart">
            <div className="max-w-2xl mx-auto">
                {error && <div className="alert-error mb-4">{error}</div>}

                {cart.items.length === 0 ? (
                    <div className="card text-center py-10">
                        <p className="text-muted mb-4">Your cart is empty.</p>
                        <Link to="/shop" className="btn-primary inline-block">Browse Shop</Link>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-muted">
                                {cart.item_count} item{cart.item_count !== 1 && 's'} · {cart.branch?.branch_name}
                            </p>
                            <button onClick={handleClear} className="btn-text-danger">Clear cart</button>
                        </div>

                        <div className="space-y-3 mb-6">
                            {cart.items.map((item) => (
                                <div key={item.id} className="card flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-brand-black dark:text-white truncate">{item.product_name}</p>
                                        <p className="text-sm text-muted">KES {item.price} each</p>
                                        {!item.in_stock && <span className="badge-inactive mt-1 inline-block">Out of stock</span>}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantity(item, -1)}
                                            className="w-7 h-7 rounded-full border border-brand-black/15 dark:border-white/20 text-brand-black dark:text-white flex items-center justify-center"
                                        >
                                            −
                                        </button>
                                        <span className="w-6 text-center text-sm font-semibold text-brand-black dark:text-white">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantity(item, 1)}
                                            disabled={item.quantity >= item.stock_quantity}
                                            className="w-7 h-7 rounded-full border border-brand-black/15 dark:border-white/20 text-brand-black dark:text-white flex items-center justify-center disabled:opacity-40"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <p className="w-20 text-right text-sm font-semibold link-accent">KES {item.subtotal}</p>

                                    <button onClick={() => removeCartItem(item.id)} className="text-red-500 hover:text-red-600">
                                        <i className="bi bi-trash" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="card flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted">Total</p>
                                <p className="text-xl font-display font-semibold text-brand-black dark:text-white">KES {cart.total}</p>
                            </div>
                            <button onClick={() => navigate('/checkout')} className="btn-primary">
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}

export default Cart
