import { useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

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
        <DashboardLayout title="Submit Feedback to Admin">
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
                        className="w-full px-4 py-3 mb-4 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none resize-none"
                        value={form.description} onChange={handleChange}
                    />

                    <button
                        type="submit" disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    )
}

export default ManagerSubmitFeedback
