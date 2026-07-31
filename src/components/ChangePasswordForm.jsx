import { useState } from 'react'
import api from './api/api'

// Same endpoint and rules for every role - IsAuthenticated only, not role-gated -
// so this lives here rather than duplicated in customer/ and branchmanager/.
const ChangePasswordForm = () => {
    const [form, setForm] = useState({ old_password: '', new_password: '', new_password2: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const res = await api.post('accounts/auth/change_password/', form)
            setSuccess(res.data.message)
            setForm({ old_password: '', new_password: '', new_password2: '' })
        } catch (err) {
            // Covers wrong old_password (400), mismatched new passwords (400),
            // and the 5/min per-user rate limit (429).
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card">
            <h3 className="font-display font-semibold text-brand-black dark:text-white mb-4">Change Password</h3>

            {success && <div className="alert-success mb-3">{success}</div>}
            {error && <div className="alert-error mb-3">{error}</div>}

            <input
                type="password" name="old_password" placeholder="Current password" required
                className="input-field mb-3"
                value={form.old_password} onChange={handleChange}
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
                className="btn-primary"
            >
                {loading ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    )
}

export default ChangePasswordForm
