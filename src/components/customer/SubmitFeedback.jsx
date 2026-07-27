import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import DashboardHeader from '../DashboardHeader'

const SubmitFeedback = () => {
    const [form, setForm] = useState({ title: '', description: '', feedback_type: 'general', branch_id: '', order_id: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        // branch_id/order_id are optional on the backend - drop them if empty
        // rather than sending empty strings for what should be nullable IDs.
        const payload = { title: form.title, description: form.description, feedback_type: form.feedback_type }
        if (form.branch_id) payload.branch_id = form.branch_id
        if (form.order_id) payload.order_id = form.order_id

        try {
            const res = await api.post('accounts/feedback/submit/', payload)
            setSuccess(res.data.message)
            setForm({ title: '', description: '', feedback_type: 'general', branch_id: '', order_id: '' })
        } catch (err) {
            // Covers missing title/description (400), invalid branch/order id
            // (404), and the 10/hour per-user rate limit (429).
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
            <DashboardHeader title="Submit Feedback" />

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
                        className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none resize-none"
                        value={form.description} onChange={handleChange}
                    />

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <input
                            type="number" name="branch_id" placeholder="Branch ID (optional)"
                            className="w-full px-4 py-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                            value={form.branch_id} onChange={handleChange}
                        />
                        <input
                            type="number" name="order_id" placeholder="Order ID (optional)"
                            className="w-full px-4 py-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                            value={form.order_id} onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="bg-brand-green text-brand-black font-display font-semibold px-5 py-2 rounded-lg hover:bg-brand-green-deep hover:text-white transition disabled:opacity-60"
                    >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>

                <p className="text-center text-sm mt-4">
                    <Link to="/feedback/my" className="text-brand-green-deep dark:text-brand-green font-semibold hover:underline">
                        View my feedback
                    </Link>
                </p>
            </main>
        </div>
    )
}

export default SubmitFeedback
