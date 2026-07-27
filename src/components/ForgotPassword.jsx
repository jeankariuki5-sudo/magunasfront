import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from './api/api'
import Logo from './Logo'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            // Deliberately always returns the same message whether or not the
            // email exists, so don't branch UI on the response content.
            const res = await api.post('accounts/auth/forgot_password/', { email })
            setMessage(res.data.message)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-black px-4 transition-colors">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 dark:border dark:border-white/10 p-8 rounded-2xl shadow-sm w-full max-w-sm">
                <div className="flex justify-center mb-6">
                    <Logo size="sm" />
                </div>

                <h1 className="text-xl font-display font-semibold text-center mb-2 text-brand-black dark:text-white">
                    Forgot Password
                </h1>
                <p className="text-sm text-center text-brand-black/60 dark:text-white/60 mb-6">
                    Enter your email and we'll send you a one-time code to reset your password.
                </p>

                {message && <div className="mb-4 text-brand-green-deep bg-brand-green/15 p-2 rounded-lg text-sm text-center">{message}</div>}
                {error && <div className="mb-4 text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-sm text-center">{error}</div>}

                <input
                    type="email" placeholder="Email" required
                    className="w-full px-4 py-3 mb-4 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    type="submit" disabled={loading}
                    className="w-full bg-brand-green text-brand-black font-display font-semibold p-3 rounded-lg hover:bg-brand-green-deep hover:text-white transition disabled:opacity-60"
                >
                    {loading ? 'Sending...' : 'Send OTP'}
                </button>

                <p className="text-center text-sm mt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/reset_password', { state: { email } })}
                        className="text-brand-green-deep dark:text-brand-green font-semibold hover:underline"
                    >
                        Already have a code?
                    </button>
                </p>

                <p className="text-center text-sm text-brand-black/60 dark:text-white/60 mt-2">
                    <Link to="/login" className="hover:underline">Back to sign in</Link>
                </p>
            </form>
        </div>
    )
}

export default ForgotPassword
