import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

const emptyEditForm = { email: '', phone_number: '', first_name: '', last_name: '', national_id: '' }

const BranchManagerList = () => {
    const [managers, setManagers] = useState([])
    const [branches, setBranches] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState(emptyEditForm)
    const [assigningId, setAssigningId] = useState(null)
    const [branchToAssign, setBranchToAssign] = useState('')

    const fetchManagers = async () => {
        setLoading(true)
        try {
            // list_users gives full profile detail (national_id etc) but doesn't
            // say which branch a manager is assigned to. list_managers has the
            // opposite gap (assigned + branch name, no profile detail). Merge both.
            const [usersRes, assignmentRes] = await Promise.all([
                api.get('accounts/auth/list_users/', { params: { role: 'branch_manager' } }),
                api.get('branches/list_managers/'),
            ])
            const assignmentById = Object.fromEntries(assignmentRes.data.map((a) => [a.id, a]))
            const merged = usersRes.data.map((m) => ({
                ...m,
                assignedBranch: assignmentById[m.id]?.branch || null,
            }))
            setManagers(merged)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load branch managers')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchManagers()
        api.get('branches/branch_list/').then((res) => setBranches(res.data)).catch(() => {})
    }, [])

    // No backend search param exists for list_users, so this filters client-side
    // against whatever ListUsers already returned.
    const filtered = managers.filter((m) => {
        const q = search.toLowerCase()
        const name = `${m.profile.first_name || ''} ${m.profile.last_name || ''}`.toLowerCase()
        return (
            m.username.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            name.includes(q)
        )
    })

    const startEdit = (m) => {
        setEditingId(m.id)
        setAssigningId(null)
        setEditForm({
            email: m.email,
            phone_number: m.phone_number,
            first_name: m.profile.first_name || '',
            last_name: m.profile.last_name || '',
            national_id: m.profile.national_id || '',
        })
    }

    const saveEdit = async (id) => {
        try {
            await api.put(`accounts/auth/update_user/${id}/`, editForm)
            setEditingId(null)
            fetchManagers()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update branch manager')
        }
    }

    const startAssign = (m) => {
        setAssigningId(m.id)
        setEditingId(null)
        const current = branches.find((b) => b.branch_name === m.assignedBranch)
        setBranchToAssign(current ? String(current.id) : '')
    }

    const saveAssign = async (userId) => {
        if (!branchToAssign) return
        try {
            await api.post(`branches/assign_manager/${branchToAssign}/`, { manager_id: userId })
            setAssigningId(null)
            fetchManagers()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to assign branch')
        }
    }

    const handleDelete = async (m) => {
        if (!window.confirm(`Permanently delete ${m.username}'s account? This cannot be undone.`)) return
        try {
            await api.delete(`accounts/auth/delete_user/${m.id}/`)
            fetchManagers()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete branch manager')
        }
    }

    return (
        <DashboardLayout title="Branch Managers">
            <div className="max-w-4xl mx-auto">
                <input
                    type="text"
                    placeholder="Search by name, username, or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 mb-5 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                />

                {error && <div className="mb-4 text-sm text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-center">{error}</div>}

                {loading ? (
                    <p className="text-sm text-muted">Loading branch managers...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-sm text-brand-black/50 dark:text-white/50">No branch managers found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((m) => (
                            <div key={m.id} className="card">
                                {editingId === m.id ? (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text" placeholder="First name" value={editForm.first_name}
                                                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                                className="input-field-sm"
                                            />
                                            <input
                                                type="text" placeholder="Last name" value={editForm.last_name}
                                                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                                className="input-field-sm"
                                            />
                                        </div>
                                        <input
                                            type="email" placeholder="Email" value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="input-field-sm w-full"
                                        />
                                        <input
                                            type="tel" placeholder="Phone number" value={editForm.phone_number}
                                            onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                                            className="input-field-sm w-full"
                                        />
                                        <input
                                            type="text" placeholder="National ID" value={editForm.national_id}
                                            onChange={(e) => setEditForm({ ...editForm, national_id: e.target.value })}
                                            className="input-field-sm w-full"
                                        />
                                        <div className="flex gap-3 pt-1">
                                            <button onClick={() => saveEdit(m.id)} className="link-accent text-sm">Save</button>
                                            <button onClick={() => setEditingId(null)} className="link-muted text-sm">Cancel</button>
                                        </div>
                                    </div>
                                ) : assigningId === m.id ? (
                                    <div>
                                        <p className="text-sm font-semibold text-brand-black dark:text-white mb-2">Assign branch</p>
                                        <select
                                            value={branchToAssign}
                                            onChange={(e) => setBranchToAssign(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg outline-none mb-3"
                                        >
                                            <option value="" className="text-black">Select a branch</option>
                                            {branches.map((b) => (
                                                <option key={b.id} value={b.id} className="text-black">{b.branch_name}</option>
                                            ))}
                                        </select>
                                        <div className="flex gap-3">
                                            <button onClick={() => saveAssign(m.id)} className="link-accent text-sm">Confirm</button>
                                            <button onClick={() => setAssigningId(null)} className="link-muted text-sm">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="page-title">
                                                    {m.profile.first_name} {m.profile.last_name}
                                                </p>
                                                <p className="text-xs text-brand-black/50 dark:text-white/50">@{m.username}</p>
                                            </div>
                                            <span className={m.is_active ? 'badge-active' : 'badge-inactive'}>
                                                {m.is_active ? 'Active' : 'Suspended'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-brand-black/70 dark:text-white/70">{m.email}</p>
                                        <p className="text-sm text-brand-black/70 dark:text-white/70 mb-3">{m.phone_number}</p>
                                        <p className="text-xs text-brand-black/40 dark:text-white/40 mb-2">
                                            National ID: {m.profile.national_id}
                                        </p>
                                        <p className="text-xs font-semibold mb-4">
                                            {m.assignedBranch ? (
                                                <span className="text-brand-green-deep dark:text-brand-green">
                                                    <i className="bi bi-shop" /> {m.assignedBranch}
                                                </span>
                                            ) : (
                                                <span className="text-brand-black/40 dark:text-white/40">Not assigned to a branch</span>
                                            )}
                                        </p>
                                        <div className="flex gap-4">
                                            <button onClick={() => startEdit(m)} className="btn-text-action">Edit</button>
                                            <button onClick={() => startAssign(m)} className="btn-text-muted">
                                                {m.assignedBranch ? 'Reassign Branch' : 'Assign Branch'}
                                            </button>
                                            <button onClick={() => handleDelete(m)} className="btn-text-danger">Delete</button>
                                        </div>
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

export default BranchManagerList
