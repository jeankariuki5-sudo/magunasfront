import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from './api/api'
import Logo from './Logo'

const ResetPassword = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        email: location.state?.email || '',
        otp: '',
        new_password: '',
        new_password2: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await api.post('accounts/auth/reset_password/', form)
            navigate('/login', { state: { justReset: true } })
        } catch (err) {
            // Covers invalid email/OTP, mismatched passwords, and expired OTP - all 400
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

                <h1 className="text-xl font-display font-semibold text-center mb-6 text-brand-black dark:text-white">
                    Reset Password
                </h1>

                {error && <div className="mb-4 text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-sm text-center">{error}</div>}

                <input
                    type="email" name="email" placeholder="Email" required
                    className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    value={form.email} onChange={handleChange}
                />

                <input
                    type="text" name="otp" placeholder="6-digit OTP" required maxLength={6}
                    className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    value={form.otp} onChange={handleChange}
                />

                <input
                    type="password" name="new_password" placeholder="New password" required
                    className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    value={form.new_password} onChange={handleChange}
                />

                <input
                    type="password" name="new_password2" placeholder="Confirm new password" required
                    className="w-full px-4 py-3 mb-4 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    value={form.new_password2} onChange={handleChange}
                />

                <button
                    type="submit" disabled={loading}
                    className="w-full bg-brand-green text-brand-black font-display font-semibold p-3 rounded-lg hover:bg-brand-green-deep hover:text-white transition disabled:opacity-60"
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    )
}

export default ResetPassword
