import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

const statusBadge = {
    success: 'badge-resolved',
    pending: 'badge-pending',
    failed: 'badge-inactive',
}

const statuses = ['', 'pending', 'success', 'failed']

const AllPayments = () => {
    const [payments, setPayments] = useState([])
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true)
            try {
                const params = {}
                if (statusFilter) params.status = statusFilter
                const res = await api.get('payments/view_all_payments/', { params })
                setPayments(res.data)
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load payments')
            } finally {
                setLoading(false)
            }
        }
        fetchPayments()
    }, [statusFilter])

    return (
        <DashboardLayout title="Payments">
            <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 mb-4 flex-wrap">
                    {statuses.map((s) => (
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

                <div className="card-table">
                    {loading ? (
                        <p className="p-5 text-sm text-muted">Loading payments...</p>
                    ) : payments.length === 0 ? (
                        <p className="p-5 text-sm text-brand-black/50 dark:text-white/50">No payments found.</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="table-head">
                                <tr>
                                    <th className="px-4 py-3">Order</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Branch</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Receipt</th>
                                    <th className="px-4 py-3">Initiated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p) => (
                                    <tr key={p.id} className="table-row">
                                        <td className="px-4 py-3 text-brand-black dark:text-white">#{p.order_id}</td>
                                        <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">{p.customer}</td>
                                        <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">{p.branch}</td>
                                        <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">{p.phone_number}</td>
                                        <td className="px-4 py-3 text-brand-black dark:text-white">KES {p.amount}</td>
                                        <td className="px-4 py-3">
                                            <span className={statusBadge[p.status] || 'badge-inactive'}>{p.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-brand-black/50 dark:text-white/50">{p.mpesa_receipt || '—'}</td>
                                        <td className="px-4 py-3 text-brand-black/50 dark:text-white/50">
                                            {new Date(p.initiated_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default AllPayments
