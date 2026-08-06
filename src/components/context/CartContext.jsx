import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../api/api'
import { AuthContext } from './AuthContext'

export const CartContext = createContext()

const emptyCart = { cart_id: null, branch: null, item_count: 0, items: [], total: '0.00' }

export const CartProvider = ({ children }) => {
    const { user, token } = useContext(AuthContext)
    const [cart, setCart] = useState(emptyCart)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const isCustomer = user?.role === 'customer'

    const refreshCart = useCallback(async () => {
        if (!isCustomer) return
        setLoading(true)
        try {
            const res = await api.get('orders/view_cart/')
            setCart(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load cart')
        } finally {
            setLoading(false)
        }
    }, [isCustomer])

    // Load the cart once we know we're dealing with a logged-in customer,
    // and clear it back out if they log out / switch roles.
    useEffect(() => {
        if (isCustomer) {
            refreshCart()
        } else {
            setCart(emptyCart)
        }
    }, [isCustomer, token, refreshCart])

    const addToCart = async (branchProductId, quantity = 1) => {
        setError('')
        try {
            await api.post('orders/add_to_cart/', { branch_product_id: branchProductId, quantity })
            await refreshCart()
            return { ok: true }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to add item to cart'
            setError(message)
            return { ok: false, error: message }
        }
    }

    const updateCartItem = async (cartItemId, quantity) => {
        setError('')
        try {
            await api.put(`orders/update_cart_item/${cartItemId}/`, { quantity })
            await refreshCart()
            return { ok: true }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to update item'
            setError(message)
            return { ok: false, error: message }
        }
    }

    const removeCartItem = async (cartItemId) => {
        setError('')
        try {
            await api.delete(`orders/remove_cart_item/${cartItemId}/`)
            await refreshCart()
            return { ok: true }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to remove item'
            setError(message)
            return { ok: false, error: message }
        }
    }

    const clearCart = async () => {
        setError('')
        try {
            await api.delete('orders/clear_cart/')
            setCart(emptyCart)
            return { ok: true }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to clear cart'
            setError(message)
            return { ok: false, error: message }
        }
    }

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                error,
                setError,
                refreshCart,
                addToCart,
                updateCartItem,
                removeCartItem,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}
