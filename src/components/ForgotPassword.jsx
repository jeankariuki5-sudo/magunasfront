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
        <div className="auth-page">
            <form onSubmit={handleSubmit} className="auth-card">
                <div className="flex justify-center mb-6">
                    <Logo size="sm" />
                </div>

                <h1 className="text-xl font-display font-semibold text-center mb-2 text-brand-black dark:text-white">
                    Forgot Password
                </h1>
                <p className="text-sm text-center text-brand-black/60 dark:text-white/60 mb-6">
                    Enter your email and we'll send you a one-time code to reset your password.
                </p>

                {message && <div className="alert-success mb-4">{message}</div>}
                {error && <div className="alert-error mb-4">{error}</div>}

                <input
                    type="email" placeholder="Email" required
                    className="input-field mb-4"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    type="submit" disabled={loading}
                    className="btn-primary-block"
                >
                    {loading ? 'Sending...' : 'Send OTP'}
                </button>

                <p className="text-center text-sm mt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/reset_password', { state: { email } })}
                        className="link-accent"
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
