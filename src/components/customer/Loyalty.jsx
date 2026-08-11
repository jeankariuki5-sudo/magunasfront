import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'
import StatCard from '../StatCard'

const typeBadge = {
    earned: 'badge-active',
    redeemed: 'badge-inactive',
    reversed: 'badge-active',
}

const Loyalty = () => {
    const [account, setAccount] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                const [accountRes, txRes] = await Promise.all([
                    api.get('loyalty/my_account/'),
                    api.get('loyalty/my_transactions/'),
                ])
                setAccount(accountRes.data)
                setTransactions(txRes.data)
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load your loyalty account')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <DashboardLayout title="Rewards">
            <div className="max-w-3xl mx-auto">
                {error && <div className="alert-error mb-4">{error}</div>}

                {loading ? (
                    <p className="text-sm text-muted">Loading your rewards...</p>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            <StatCard label="Points Balance" value={account.points_balance} accent />
                            <StatCard label="Redeemable Value" value={`KES ${account.points_value_kes}`} />
                            <StatCard label="Lifetime Earned" value={account.lifetime_points_earned} />
                        </div>

                        <p className="text-xs text-faint mb-6">
                            1 point = KES 1 off any order, at any branch. Points are earned automatically
                            whenever a payment goes through, and can be redeemed at checkout.
                        </p>

                        <h2 className="section-title">Transaction History</h2>
                        {transactions.length === 0 ? (
                            <div className="card">
                                <p className="text-sm text-brand-black/50 dark:text-white/50">
                                    No loyalty activity yet. Place an order to start earning points.
                                </p>
                            </div>
                        ) : (
                            <div className="card-table">
                                <table className="w-full text-sm text-left">
                                    <thead className="table-head">
                                        <tr>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Order</th>
                                            <th className="px-4 py-3 text-right">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((t) => (
                                            <tr key={t.id} className="table-row">
                                                <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">
                                                    {new Date(t.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={typeBadge[t.type] || 'badge-inactive'}>
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">
                                                    {t.order_id ? `#${t.order_id}` : '—'}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-semibold ${t.points < 0 ? 'text-red-500' : 'text-brand-green-deep dark:text-brand-green'}`}>
                                                    {t.points > 0 ? '+' : ''}{t.points}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}

export default Loyalty
