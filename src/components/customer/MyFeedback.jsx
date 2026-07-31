import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

const statusBadge = {
    pending: 'badge-pending',
    reviewed: 'badge-reviewed',
    resolved: 'badge-resolved',
}

const MyFeedback = () => {
    const [feedback, setFeedback] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({ title: '', description: '', feedback_type: '' })

    const fetchFeedback = async () => {
        try {
            const res = await api.get('accounts/feedback/my/')
            setFeedback(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load feedback')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchFeedback() }, [])

    const startEdit = (f) => {
        setEditingId(f.id)
        setEditForm({ title: f.title, description: f.description, feedback_type: f.feedback_type })
    }

    const handleUpdate = async (id) => {
        try {
            // Only pending feedback can be edited - the backend enforces this
            // too, but the button is hidden for non-pending items already.
            await api.put(`accounts/feedback/my/update/${id}/`, editForm)
            setEditingId(null)
            fetchFeedback()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update feedback')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this feedback?')) return
        try {
            await api.delete(`accounts/feedback/my/delete/${id}/`)
            fetchFeedback()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete feedback')
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <p className="text-muted">Loading feedback...</p>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="My Feedback">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted">{feedback.length} submitted</p>
                    <Link to="/feedback/submit" className="link-accent text-sm">
                        + New Feedback
                    </Link>
                </div>

                {error && <div className="alert-error mb-3">{error}</div>}

                {feedback.length === 0 ? (
                    <p className="text-sm text-brand-black/50 dark:text-white/50">You haven't submitted any feedback yet.</p>
                ) : (
                    <div className="space-y-3">
                        {feedback.map((f) => (
                            <div key={f.id} className="card p-4">
                                {editingId === f.id ? (
                                    <div>
                                        <input
                                            type="text" value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="w-full px-3 py-2 mb-2 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg outline-none"
                                        />
                                        <textarea
                                            value={editForm.description} rows={3}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="w-full px-3 py-2 mb-2 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg outline-none resize-none"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleUpdate(f.id)} className="link-accent text-sm">Save</button>
                                            <button onClick={() => setEditingId(null)} className="link-muted text-sm">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-brand-black dark:text-white">{f.title}</h3>
                                            <span className={statusBadge[f.status]}>{f.status}</span>
                                        </div>
                                        <p className="text-sm text-brand-black/70 dark:text-white/70 mb-2">{f.description}</p>
                                        <p className="text-xs text-brand-black/40 dark:text-white/40 mb-2">
                                            {f.feedback_type} {f.branch && `· ${f.branch}`} {f.order_id && `· Order #${f.order_id}`} · {new Date(f.created_at).toLocaleDateString()}
                                        </p>
                                        {f.status === 'pending' && (
                                            <div className="flex gap-3">
                                                <button onClick={() => startEdit(f)} className="btn-text-action">Edit</button>
                                                <button onClick={() => handleDelete(f.id)} className="btn-text-danger">Delete</button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default MyFeedback
