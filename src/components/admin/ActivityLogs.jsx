import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'
import StatCard from '../StatCard'

const ActivityLogs = () => {
    const [tab, setTab] = useState('all') // 'all' | 'failed' | 'user'
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [emailQuery, setEmailQuery] = useState('')
    const [userLookup, setUserLookup] = useState(null)
    const [flagged, setFlagged] = useState([])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const res = await api.get('accounts/users/activity/')
            setLogs(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load activity')
        } finally {
            setLoading(false)
        }
    }

    const fetchFailed = async () => {
        setLoading(true)
        try {
            const res = await api.get('accounts/users/activity/failed_logins/')
            setLogs(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load failed logins')
        } finally {
            setLoading(false)
        }
    }

    const fetchFlagged = async () => {
        setLoading(true)
        try {
            const res = await api.get('accounts/users/flagged/')
            setFlagged(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load flagged accounts')
        } finally {
            setLoading(false)
        }
    }

    const lookupUser = async (e) => {
        e.preventDefault()
        if (!emailQuery) return
        setError('')
        setLoading(true)
        try {
            // There's no lookup-by-email endpoint on the backend, so this
            // resolves the email to a user ID via list_users first, then
            // calls the real by-ID endpoint transparently.
            const usersRes = await api.get('accounts/auth/list_users/')
            const match = usersRes.data.find(
                (u) => u.email.toLowerCase() === emailQuery.trim().toLowerCase()
            )
            if (!match) {
                setError('No user found with that email')
                setUserLookup(null)
                return
            }
            const res = await api.get(`accounts/users/activity/${match.id}/`)
            setUserLookup(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'User not found')
            setUserLookup(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setError('')
        if (tab === 'all') fetchAll()
        else if (tab === 'failed') fetchFailed()
        else if (tab === 'flagged') fetchFlagged()
        else setUserLookup(null)
    }, [tab])

    return (
        <DashboardLayout title="Activity Logs">
            <div className="max-w-3xl mx-auto">
                <div className="flex gap-2 mb-4">
                    {[
                        { key: 'all', label: 'All Activity' },
                        { key: 'failed', label: 'Failed Logins' },
                        { key: 'flagged', label: 'Flagged Accounts' },
                        { key: 'user', label: 'Look Up User' },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${tab === t.key ? 'bg-brand-green text-brand-black' : 'bg-white dark:bg-white/5 text-brand-black/60 dark:text-white/60'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {error && <div className="alert-error mb-3">{error}</div>}

                {tab === 'user' && (
                    <form onSubmit={lookupUser} className="flex gap-2 mb-5">
                        <input
                            type="email" placeholder="User's email" value={emailQuery}
                            onChange={(e) => setEmailQuery(e.target.value)}
                            className="input-field-sm px-3 py-2 flex-1 max-w-xs"
                        />
                        <button type="submit" className="text-sm font-semibold bg-brand-green text-brand-black px-4 py-2 rounded-lg hover:bg-brand-green-deep hover:text-white transition">
                            Look Up
                        </button>
                    </form>
                )}

                {loading ? (
                    <p className="text-sm text-muted">Loading...</p>
                ) : tab === 'user' && userLookup ? (
                    <div>
                        <h2 className="font-display font-semibold text-brand-black dark:text-white mb-1">
                            {userLookup.user} <span className="text-sm font-normal text-brand-black/40 dark:text-white/40 capitalize">({userLookup.role})</span>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 my-4">
                            <StatCard label="Logins" value={userLookup.summary.total_logins} accent />
                            <StatCard label="Failed Logins" value={userLookup.summary.failed_logins} />
                            <StatCard label="Orders Placed" value={userLookup.summary.orders_placed} />
                            <StatCard label="Orders Cancelled" value={userLookup.summary.orders_cancelled} />
                            <StatCard label="Feedback" value={userLookup.summary.feedback_submitted} />
                        </div>
                        <ActivityTable rows={userLookup.activity} showUser={false} />
                    </div>
                ) : tab === 'user' ? (
                    <p className="text-sm text-brand-black/50 dark:text-white/50">Enter a user's email to look up their activity.</p>
                ) : tab === 'flagged' ? (
                    <FlaggedAccountsList rows={flagged} onActionTaken={fetchFlagged} />
                ) : tab === 'failed' ? (
                    <FailedLoginsTable rows={logs} />
                ) : (
                    <ActivityTable rows={logs} showUser={true} />
                )}
            </div>
        </DashboardLayout>
    )
}

const ActivityTable = ({ rows, showUser }) => {
    if (rows.length === 0) return <p className="text-sm text-brand-black/50 dark:text-white/50">No activity found.</p>
    return (
        <div className="card-table">
            <table className="w-full text-sm text-left">
                <thead className="table-head">
                    <tr>
                        {showUser && <th className="px-4 py-3">User</th>}
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Detail</th>
                        <th className="px-4 py-3">IP</th>
                        <th className="px-4 py-3">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((log) => (
                        <tr key={log.id} className="table-row">
                            {showUser && <td className="px-4 py-3 text-brand-black dark:text-white">{log.user}</td>}
                            <td className="px-4 py-3 capitalize text-brand-black/70 dark:text-white/70">{log.action.replace(/_/g, ' ')}</td>
                            <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">{log.detail}</td>
                            <td className="px-4 py-3 text-brand-black/50 dark:text-white/50">{log.ip_address}</td>
                            <td className="px-4 py-3 text-brand-black/50 dark:text-white/50">{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const FailedLoginsTable = ({ rows }) => {
    if (rows.length === 0) return <p className="text-sm text-brand-black/50 dark:text-white/50">No failed logins.</p>
    return (
        <div className="card-table">
            <table className="w-full text-sm text-left">
                <thead className="table-head">
                    <tr>
                        <th className="px-4 py-3">Targeted Username</th>
                        <th className="px-4 py-3">Detail</th>
                        <th className="px-4 py-3">IP</th>
                        <th className="px-4 py-3">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((log) => (
                        <tr key={log.id} className="table-row">
                            <td className="px-4 py-3 text-brand-black dark:text-white">{log.targeted_username}</td>
                            <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">{log.detail}</td>
                            <td className="px-4 py-3 text-brand-black/50 dark:text-white/50">{log.ip_address}</td>
                            <td className="px-4 py-3 text-brand-black/50 dark:text-white/50">{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const FlaggedAccountsList = ({ rows, onActionTaken }) => {
    const [error, setError] = useState('')

    const quickSuspend = async (user) => {
        const reason = window.prompt(`Reason for suspending ${user.username}?`, 'Flagged for suspicious activity')
        if (!reason) return
        try {
            await api.post(`accounts/auth/suspend_user/${user.id}/`, {
                suspension_type: 'temporary',
                reason,
                lift_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h default
            })
            onActionTaken()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to suspend user')
        }
    }

    if (rows.length === 0) {
        return <p className="text-sm text-brand-black/50 dark:text-white/50">No accounts currently flagged - nothing suspicious detected.</p>
    }

    return (
        <div className="space-y-3">
            {error && <div className="alert-error mb-3">{error}</div>}
            {rows.map((u) => (
                <div key={u.id} className="card">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-semibold text-brand-black dark:text-white">
                                {u.username} <span className="text-xs font-normal text-faint capitalize">· {u.role}</span>
                            </p>
                            <p className="text-xs text-muted">{u.email}</p>
                        </div>
                        <span className={u.is_active ? 'badge-active' : 'badge-inactive'}>
                            {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                    </div>
                    <ul className="text-sm text-red-500 mb-3 list-disc list-inside">
                        {u.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                    {u.is_active && (
                        <button onClick={() => quickSuspend(u)} className="btn-text-danger">
                            Suspend this account
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}

export default ActivityLogs