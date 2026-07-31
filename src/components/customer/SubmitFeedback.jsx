import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

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
        <DashboardLayout title="Submit Feedback">
            <div className="max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="card">
                    {success && <div className="alert-success mb-3">{success}</div>}
                    {error && <div className="alert-error mb-3">{error}</div>}

                    <input
                        type="text" name="title" placeholder="Title" required
                        className="input-field mb-3"
                        value={form.title} onChange={handleChange}
                    />

                    <select
                        name="feedback_type" value={form.feedback_type} onChange={handleChange}
                        className="input-field mb-3"
                    >
                        <option value="general" className="text-black">General</option>
                        <option value="order" className="text-black">Order</option>
                        <option value="branch" className="text-black">Branch</option>
                        <option value="product" className="text-black">Product</option>
                    </select>

                    <textarea
                        name="description" placeholder="Describe your feedback" required rows={4}
                        className="input-field mb-3 resize-none"
                        value={form.description} onChange={handleChange}
                    />

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <input
                            type="number" name="branch_id" placeholder="Branch ID (optional)"
                            className="input-field"
                            value={form.branch_id} onChange={handleChange}
                        />
                        <input
                            type="number" name="order_id" placeholder="Order ID (optional)"
                            className="input-field"
                            value={form.order_id} onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>

                <p className="text-center text-sm mt-4">
                    <Link to="/feedback/my" className="link-accent">
                        View my feedback
                    </Link>
                </p>
            </div>
        </DashboardLayout>
    )
}

export default SubmitFeedback
