import React, { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from './api/api'
import { AuthContext } from './context/AuthContext'
import Logo from './Logo'

const CustomerRegister = () => {
    const { setToken, setUser } = useContext(AuthContext)
    const navigate = useNavigate()

    // Matches exactly what CustomerRegister expects in request.data -
    // default_delivery_address is the only optional field on the backend.
    const [form, setForm] = useState({
        username: '',
        email: '',
        phone_number: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        default_delivery_address: '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await api.post('accounts/auth/customer_register/', form)
            setLoading(false)

            // Registration returns tokens directly, so log the user straight
            // in instead of sending them to a separate login screen.
            const { user, tokens } = res.data

            setToken(tokens.access)
            setUser(user)

            localStorage.setItem('access_token', tokens.access)
            localStorage.setItem('refresh', tokens.refresh)
            localStorage.setItem('user', JSON.stringify(user))

            navigate('/customer-dashboard')
        } catch (err) {
            setLoading(false)
            // Covers validation errors (400: passwords don't match, username
            // taken, etc.) and the 3/min IP rate limit (429) - both come back
            // as { error: "..." } on a non-2xx response.
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-black px-4 py-10 transition-colors">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 dark:border dark:border-white/10 p-8 rounded-2xl shadow-sm w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <Logo size="sm" />
                </div>

                <h1 className="text-xl font-display font-semibold text-center mb-6 text-brand-black dark:text-white">
                    Create your account
                </h1>

                {error && (
                    <div className="mb-4 text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                        type="text" name="first_name" placeholder="First name" required
                        className="w-full px-4 py-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                        value={form.first_name} onChange={handleChange}
                    />
                    <input
                        type="text" name="last_name" placeholder="Last name" required
                        className="w-full px-4 py-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                        value={form.last_name} onChange={handleChange}
                    />
                </div>

                <input
                    type="text" name="username" placeholder="Username" required
                    className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    value={form.username} onChange={handleChange}
                />

                <input
                    type="email" name="email" placeholder="Email" required
                    className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    value={form.email} onChange={handleChange}
                />

                <input
                    type="tel" name="phone_number" placeholder="Phone number"
                    className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    value={form.phone_number} onChange={handleChange}
                />

                <input
                    type="text" name="default_delivery_address" placeholder="Delivery address (optional)"
                    className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    value={form.default_delivery_address} onChange={handleChange}
                />

                <input
                    type="password" name="password" placeholder="Password" required
                    className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    value={form.password} onChange={handleChange}
                />

                <input
                    type="password" name="password2" placeholder="Confirm password" required
                    className="w-full px-4 py-3 mb-2 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    value={form.password2} onChange={handleChange}
                />

                <button
                    type="submit" disabled={loading}
                    className="w-full bg-brand-green mt-5 text-brand-black font-display font-semibold p-3 rounded-lg hover:bg-brand-green-deep hover:text-white transition disabled:opacity-60"
                >
                    {loading ? 'Creating account...' : 'Create account'}
                </button>

                <p className="text-center text-sm text-brand-black/60 dark:text-white/60 mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-green-deep dark:text-brand-green font-semibold hover:underline">
                        Sign in
                    </Link>
                </p>
            </form>
        </div>
    )
}

export default CustomerRegister
