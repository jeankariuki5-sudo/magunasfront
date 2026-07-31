import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

const statusBadge = {
    pending: 'badge-pending',
    reviewed: 'badge-reviewed',
    resolved: 'badge-resolved',
}

const BranchFeedback = () => {
    const [feedback, setFeedback] = useState([])
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchFeedback = async () => {
        setLoading(true)
        try {
            const res = await api.get('accounts/feedback/branch/', {
                params: statusFilter ? { status: statusFilter } : {},
            })
            setFeedback(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load feedback')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchFeedback() }, [statusFilter])

    const updateStatus = async (id, status) => {
        try {
            await api.put(`accounts/feedback/branch/update_feedback_status/${id}/`, { status })
            fetchFeedback()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update status')
        }
    }

    return (
        <DashboardLayout title="Branch Feedback">
            <div className="max-w-2xl mx-auto">
                <div className="flex gap-2 mb-4">
                    {['', 'pending', 'reviewed', 'resolved'].map((s) => (
                        <button
                            key={s || 'all'}
                            onClick={() => setStatusFilter(s)}
                            className={statusFilter === s ? 'filter-pill-active' : 'filter-pill-inactive'}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>

                {error && <div className="alert-error mb-3">{error}</div>}

                {loading ? (
                    <p className="text-sm text-muted">Loading...</p>
                ) : feedback.length === 0 ? (
                    <p className="text-sm text-brand-black/50 dark:text-white/50">No feedback found.</p>
                ) : (
                    <div className="space-y-3">
                        {feedback.map((f) => (
                            <div key={f.id} className="card p-4">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-brand-black dark:text-white">{f.title}</h3>
                                    <span className={statusBadge[f.status]}>{f.status}</span>
                                </div>
                                <p className="text-sm text-brand-black/70 dark:text-white/70 mb-2">{f.description}</p>
                                <p className="text-xs text-brand-black/40 dark:text-white/40 mb-3">
                                    {f.customer} · {f.feedback_type} {f.order_id && `· Order #${f.order_id}`} · {new Date(f.created_at).toLocaleDateString()}
                                </p>
                                <select
                                    value={f.status}
                                    onChange={(e) => updateStatus(f.id, e.target.value)}
                                    className="input-field-sm text-xs px-2 py-1"
                                >
                                    <option value="pending" className="text-black">Pending</option>
                                    <option value="reviewed" className="text-black">Reviewed</option>
                                    <option value="resolved" className="text-black">Resolved</option>
                                </select>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default BranchFeedback
