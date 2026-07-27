import { useState } from 'react'
import api from '../api/api'
import DashboardHeader from '../DashboardHeader'

const CreateBranchManagerPage = () => {
    const [form, setForm] = useState({
        username: '', email: '', phone_number: '', password: '',
        first_name: '', last_name: '', national_id: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(null)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess(null)
        setLoading(true)

        try {
            const res = await api.post('accounts/auth/create_branch_manager/', form)
            setSuccess(res.data)
            setForm({ username: '', email: '', phone_number: '', password: '', first_name: '', last_name: '', national_id: '' })
        } catch (err) {
            // Covers missing fields (400), and duplicate username/email/phone/national_id (400)
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
            <DashboardHeader title="Create Branch Manager" />

            <main className="px-6 md:px-12 py-8 max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl p-5">
                    {error && <div className="mb-3 text-sm text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-center">{error}</div>}
                    {success && (
                        <div className="mb-3 text-sm text-brand-green-deep bg-brand-green/15 p-3 rounded-lg">
                            {success.message} — <strong>{success.user.username}</strong> can now log in with the password you set. This account still needs assigning to a branch (via `assign_manager`).
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
                        type="tel" name="phone_number" placeholder="Phone number" required
                        className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                        value={form.phone_number} onChange={handleChange}
                    />

                    <input
                        type="text" name="national_id" placeholder="National ID" required
                        className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                        value={form.national_id} onChange={handleChange}
                    />

                    <input
                        type="password" name="password" placeholder="Temporary password" required
                        className="w-full px-4 py-3 mb-4 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                        value={form.password} onChange={handleChange}
                    />

                    <button
                        type="submit" disabled={loading}
                        className="bg-brand-green text-brand-black font-display font-semibold px-5 py-2 rounded-lg hover:bg-brand-green-deep hover:text-white transition disabled:opacity-60"
                    >
                        {loading ? 'Creating...' : 'Create Branch Manager'}
                    </button>
                </form>
            </main>
        </div>
    )
}

export default CreateBranchManagerPage
