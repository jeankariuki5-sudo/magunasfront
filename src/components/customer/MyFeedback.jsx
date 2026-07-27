import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import DashboardHeader from '../DashboardHeader'

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    reviewed: 'bg-blue-100 text-blue-700',
    resolved: 'bg-brand-green/15 text-brand-green-deep',
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
            <div className="min-h-screen bg-brand-cream dark:bg-brand-black flex items-center justify-center transition-colors">
                <p className="text-brand-black/60 dark:text-white/60">Loading feedback...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
            <DashboardHeader title="My Feedback" />

            <main className="px-6 md:px-12 py-8 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-brand-black/60 dark:text-white/60">{feedback.length} submitted</p>
                    <Link to="/feedback/submit" className="text-sm font-semibold text-brand-green-deep dark:text-brand-green hover:underline">
                        + New Feedback
                    </Link>
                </div>

                {error && <div className="mb-3 text-sm text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-center">{error}</div>}

                {feedback.length === 0 ? (
                    <p className="text-sm text-brand-black/50 dark:text-white/50">You haven't submitted any feedback yet.</p>
                ) : (
                    <div className="space-y-3">
                        {feedback.map((f) => (
                            <div key={f.id} className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl p-4">
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
                                            <button onClick={() => handleUpdate(f.id)} className="text-sm font-semibold text-brand-green-deep dark:text-brand-green hover:underline">Save</button>
                                            <button onClick={() => setEditingId(null)} className="text-sm text-brand-black/50 dark:text-white/50 hover:underline">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-brand-black dark:text-white">{f.title}</h3>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColors[f.status]}`}>{f.status}</span>
                                        </div>
                                        <p className="text-sm text-brand-black/70 dark:text-white/70 mb-2">{f.description}</p>
                                        <p className="text-xs text-brand-black/40 dark:text-white/40 mb-2">
                                            {f.feedback_type} {f.branch && `· ${f.branch}`} {f.order_id && `· Order #${f.order_id}`} · {new Date(f.created_at).toLocaleDateString()}
                                        </p>
                                        {f.status === 'pending' && (
                                            <div className="flex gap-3">
                                                <button onClick={() => startEdit(f)} className="text-xs font-semibold text-brand-green-deep dark:text-brand-green hover:underline">Edit</button>
                                                <button onClick={() => handleDelete(f.id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default MyFeedback
