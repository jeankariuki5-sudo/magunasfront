import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

const roleFilters = [
    { label: 'All', value: '' },
    { label: 'Customers', value: 'customer' },
    { label: 'Branch Managers', value: 'branch_manager' },
    { label: 'Admins', value: 'admin' },
]

const UserManagement = () => {
    const [users, setUsers] = useState([])
    const [roleFilter, setRoleFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedId, setExpandedId] = useState(null)
    const [suspendForm, setSuspendForm] = useState({ suspension_type: 'temporary', reason: '', lift_at: '' })

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await api.get('accounts/auth/list_users/', {
                params: roleFilter ? { role: roleFilter } : {},
            })
            setUsers(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUsers() }, [roleFilter])

    const handleSuspend = async (userId) => {
        if (suspendForm.suspension_type === 'temporary' && !suspendForm.lift_at) {
            setError('lift_at is required for temporary suspensions')
            return
        }
        try {
            await api.post(`accounts/auth/suspend_user/${userId}/`, suspendForm)
            setExpandedId(null)
            setSuspendForm({ suspension_type: 'temporary', reason: '', lift_at: '' })
            fetchUsers()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to suspend user')
        }
    }

    const handleUnsuspend = async (userId, isPermanent) => {
        // Permanent suspensions require an explicit confirm='yes' on the backend -
        // window.confirm here stands in for that extra step.
        if (isPermanent && !window.confirm('This is a permanent suspension. Lift it anyway?')) return
        try {
            await api.post(`accounts/auth/unsuspend_user/${userId}/`, { confirm: 'yes' })
            fetchUsers()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to unsuspend user')
        }
    }

    return (
        <DashboardLayout title="User Management">
            <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 mb-4 flex-wrap">
                    {roleFilters.map((r) => (
                        <button
                            key={r.value || 'all'}
                            onClick={() => setRoleFilter(r.value)}
                            className={roleFilter === r.value ? 'filter-pill-active' : 'filter-pill-inactive'}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                {error && <div className="alert-error mb-3">{error}</div>}

                {loading ? (
                    <p className="text-sm text-muted">Loading users...</p>
                ) : (
                    <div className="card-table">
                        {users.map((u) => (
                            <div key={u.id} className="border-t first:border-t-0 border-brand-black/5 dark:border-white/5">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <p className="font-semibold text-brand-black dark:text-white">
                                            {u.username} <span className="text-xs font-normal text-brand-black/40 dark:text-white/40 capitalize">· {u.role}</span>
                                        </p>
                                        <p className="text-xs text-brand-black/50 dark:text-white/50">{u.email} · {u.phone_number}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={u.is_active ? 'badge-active' : 'badge-inactive'}>
                                            {u.is_active ? 'Active' : 'Suspended'}
                                        </span>
                                        {u.is_active ? (
                                            <button
                                                onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                                                className="btn-text-danger"
                                            >
                                                Suspend
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUnsuspend(u.id, u.suspension_type === 'permanent')}
                                                className="btn-text-action"
                                            >
                                                Unsuspend
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {expandedId === u.id && (
                                    <div className="px-4 pb-4 bg-brand-black/5 dark:bg-white/5">
                                        <select
                                            value={suspendForm.suspension_type}
                                            onChange={(e) => setSuspendForm({ ...suspendForm, suspension_type: e.target.value })}
                                            className="text-xs border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg px-2 py-1 outline-none mb-2 mr-2"
                                        >
                                            <option value="temporary" className="text-black">Temporary</option>
                                            <option value="permanent" className="text-black">Permanent</option>
                                        </select>
                                        {suspendForm.suspension_type === 'temporary' && (
                                            <input
                                                type="datetime-local"
                                                onChange={(e) => setSuspendForm({ ...suspendForm, lift_at: new Date(e.target.value).toISOString() })}
                                                className="text-xs border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg px-2 py-1 outline-none mb-2"
                                            />
                                        )}
                                        <input
                                            type="text" placeholder="Reason" value={suspendForm.reason}
                                            onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
                                            className="w-full text-xs border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg px-2 py-2 outline-none mb-2"
                                        />
                                        <button
                                            onClick={() => handleSuspend(u.id)}
                                            className="text-xs font-semibold bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
                                        >
                                            Confirm Suspension
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default UserManagement
