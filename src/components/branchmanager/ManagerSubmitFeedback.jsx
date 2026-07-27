import { useState } from 'react'
import api from '../api/api'
import DashboardHeader from '../DashboardHeader'

const ManagerSubmitFeedback = () => {
    const [form, setForm] = useState({ title: '', description: '', feedback_type: 'general' })
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
            // ManagerSubmitFeedback pulls the branch from request.user.managed_branch
            // itself, so unlike the customer version there's no branch_id/order_id here.
            const res = await api.post('accounts/feedback/Manager_submit/', form)
            setSuccess(res.data.message)
            setForm({ title: '', description: '', feedback_type: 'general' })
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
            <DashboardHeader title="Submit Feedback to Admin" />

            <main className="px-6 md:px-12 py-8 max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl p-5">
                    {success && <div className="mb-3 text-sm text-brand-green-deep bg-brand-green/15 p-2 rounded-lg text-center">{success}</div>}
                    {error && <div className="mb-3 text-sm text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-center">{error}</div>}

                    <input
                        type="text" name="title" placeholder="Title" required
                        className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                        value={form.title} onChange={handleChange}
                    />

                    <select
                        name="feedback_type" value={form.feedback_type} onChange={handleChange}
                        className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                    >
                        <option value="general" className="text-black">General</option>
                        <option value="order" className="text-black">Order</option>
                        <option value="branch" className="text-black">Branch</option>
                        <option value="product" className="text-black">Product</option>
                    </select>

                    <textarea
                        name="description" placeholder="Describe your feedback" required rows={4}
                        className="w-full px-4 py-3 mb-4 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none resize-none"
                        value={form.description} onChange={handleChange}
                    />

                    <button
                        type="submit" disabled={loading}
                        className="bg-brand-green text-brand-black font-display font-semibold px-5 py-2 rounded-lg hover:bg-brand-green-deep hover:text-white transition disabled:opacity-60"
                    >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </main>
        </div>
    )
}

export default ManagerSubmitFeedback
