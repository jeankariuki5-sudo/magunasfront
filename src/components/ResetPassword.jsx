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
        <div className="auth-page">
            <form onSubmit={handleSubmit} className="auth-card">
                <div className="flex justify-center mb-6">
                    <Logo size="sm" />
                </div>

                <h1 className="text-xl font-display font-semibold text-center mb-6 text-brand-black dark:text-white">
                    Reset Password
                </h1>

                {error && <div className="alert-error mb-4">{error}</div>}

                <input
                    type="email" name="email" placeholder="Email" required
                    className="input-field mb-3"
                    value={form.email} onChange={handleChange}
                />

                <input
                    type="text" name="otp" placeholder="6-digit OTP" required maxLength={6}
                    className="input-field mb-3"
                    value={form.otp} onChange={handleChange}
                />

                <input
                    type="password" name="new_password" placeholder="New password" required
                    className="input-field mb-3"
                    value={form.new_password} onChange={handleChange}
                />

                <input
                    type="password" name="new_password2" placeholder="Confirm new password" required
                    className="input-field mb-4"
                    value={form.new_password2} onChange={handleChange}
                />

                <button
                    type="submit" disabled={loading}
                    className="btn-primary-block"
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    )
}

export default ResetPassword
