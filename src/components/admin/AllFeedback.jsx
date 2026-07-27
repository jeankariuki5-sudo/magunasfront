import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardHeader from '../DashboardHeader'

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    reviewed: 'bg-blue-100 text-blue-700',
    resolved: 'bg-brand-green/15 text-brand-green-deep',
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
        <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
            <DashboardHeader title="All Feedback" />

            <main className="px-6 md:px-12 py-8 max-w-3xl mx-auto">
                <div className="flex gap-2 mb-3 flex-wrap">
                    {['', 'pending', 'reviewed', 'resolved'].map((s) => (
                        <button
                            key={s || 'all'}
                            onClick={() => setStatusFilter(s)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition ${statusFilter === s ? 'bg-brand-green text-brand-black' : 'bg-white dark:bg-white/5 text-brand-black/60 dark:text-white/60'}`}
                        >
                            {s || 'All statuses'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 mb-4">
                    <input
                        type="text" placeholder="Filter by branch ID"
                        value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
                        className="text-sm border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg px-3 py-1.5 outline-none"
                    />
                    <select
                        value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                        className="text-sm border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg px-3 py-1.5 outline-none"
                    >
                        <option value="" className="text-black">All types</option>
                        <option value="general" className="text-black">General</option>
                        <option value="order" className="text-black">Order</option>
                        <option value="branch" className="text-black">Branch</option>
                        <option value="product" className="text-black">Product</option>
                    </select>
                </div>

                {error && <div className="mb-3 text-sm text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-center">{error}</div>}

                {loading ? (
                    <p className="text-sm text-brand-black/60 dark:text-white/60">Loading...</p>
                ) : feedback.length === 0 ? (
                    <p className="text-sm text-brand-black/50 dark:text-white/50">No feedback found.</p>
                ) : (
                    <div className="space-y-3">
                        {feedback.map((f) => (
                            <div key={f.id} className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-brand-black dark:text-white">{f.title}</h3>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColors[f.status]}`}>{f.status}</span>
                                </div>
                                <p className="text-sm text-brand-black/70 dark:text-white/70 mb-2">{f.description}</p>
                                <p className="text-xs text-brand-black/40 dark:text-white/40 mb-3">
                                    {f.customer} {f.branch && `· ${f.branch}`} · {f.feedback_type} {f.order_id && `· Order #${f.order_id}`} · {new Date(f.created_at).toLocaleDateString()}
                                </p>
                                <select
                                    value={f.status}
                                    onChange={(e) => updateStatus(f.id, e.target.value)}
                                    className="text-xs border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg px-2 py-1 outline-none"
                                >
                                    <option value="pending" className="text-black">Pending</option>
                                    <option value="reviewed" className="text-black">Reviewed</option>
                                    <option value="resolved" className="text-black">Resolved</option>
                                </select>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default AllFeedback
