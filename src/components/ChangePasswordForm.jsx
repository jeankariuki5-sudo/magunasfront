import { useState } from 'react'
import api from './api/api'

// Same endpoint and rules for every role - IsAuthenticated only, not role-gated -
// so this lives here rather than duplicated in customer/ and branch_manager/.
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
        <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl p-5">
            <h3 className="font-display font-semibold text-brand-black dark:text-white mb-4">Change Password</h3>

            {success && <div className="mb-3 text-sm text-brand-green-deep bg-brand-green/15 p-2 rounded-lg text-center">{success}</div>}
            {error && <div className="mb-3 text-sm text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-center">{error}</div>}

            <input
                type="password" name="old_password" placeholder="Current password" required
                className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                value={form.old_password} onChange={handleChange}
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
                className="bg-brand-green text-brand-black font-display font-semibold px-5 py-2 rounded-lg hover:bg-brand-green-deep hover:text-white transition disabled:opacity-60"
            >
                {loading ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    )
}

export default ChangePasswordForm
