import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

const statusBadge = {
    pending: 'badge-pending',
    reviewed: 'badge-reviewed',
    resolved: 'badge-resolved',
}

const AllFeedback = () => {
    const [feedback, setFeedback] = useState([])
    const [statusFilter, setStatusFilter] = useState('')
    const [branchFilter, setBranchFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchFeedback = async () => {
        setLoading(true)
        try {
            const params = {}
            if (statusFilter) params.status = statusFilter
            if (branchFilter) params.branch = branchFilter
            if (typeFilter) params.feedback_type = typeFilter

            const res = await api.get('accounts/feedback/admin/', { params })
            setFeedback(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load feedback')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchFeedback() }, [statusFilter, branchFilter, typeFilter])

    const updateStatus = async (id, status) => {
        try {
            await api.put(`accounts/feedback/admin/update_feedback_status/${id}/`, { status })
            fetchFeedback()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update status')
        }
    }

    return (
        <DashboardLayout title="All Feedback">
            <div className="max-w-3xl mx-auto">
                <div className="flex gap-2 mb-3 flex-wrap">
                    {['', 'pending', 'reviewed', 'resolved'].map((s) => (
                        <button
                            key={s || 'all'}
                            onClick={() => setStatusFilter(s)}
                            className={statusFilter === s ? 'filter-pill-active' : 'filter-pill-inactive'}
                        >
                            {s || 'All statuses'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 mb-4">
                    <input
                        type="text" placeholder="Filter by branch ID"
                        value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
                        className="input-field-sm px-3 py-1.5"
                    />
                    <select
                        value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                        className="input-field-sm px-3 py-1.5"
                    >
                        <option value="" className="text-black">All types</option>
                        <option value="general" className="text-black">General</option>
                        <option value="order" className="text-black">Order</option>
                        <option value="branch" className="text-black">Branch</option>
                        <option value="product" className="text-black">Product</option>
                    </select>
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
                                    {f.customer} {f.branch && `· ${f.branch}`} · {f.feedback_type} {f.order_id && `· Order #${f.order_id}`} · {new Date(f.created_at).toLocaleDateString()}
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

export default AllFeedback
