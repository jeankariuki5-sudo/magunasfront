import { useState } from 'react'
import api from './api/api'
import DashboardLayout from './DashboardLayout'

// Shared by both the branch manager and admin routes - the backend endpoint
// (IsAdminOrBranchManager) doesn't distinguish between them, and points
// aren't tied to a branch, so there's nothing role-specific to render here.
const CustomerLoyaltyLookup = () => {
    const [mode, setMode] = useState('phone') // 'phone' or 'id'
    const [query, setQuery] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return
        setError('')
        setLoading(true)
        setSearched(true)
        try {
            const params = mode === 'phone' ? { phone: query.trim() } : { customer_id: query.trim() }
            const res = await api.get('loyalty/customer_account/', { params })
            setResult(res.data)
        } catch (err) {
            setResult(null)
            setError(err.response?.data?.error || 'Failed to look up customer')
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="Customer Points Lookup">
            <div className="max-w-md mx-auto">
                <p className="text-sm text-muted mb-4">
                    Check a customer's loyalty balance on their behalf, e.g. at the till.
                    Points aren't tied to any branch, so this works for any customer regardless of where they're checking.
                </p>

                <form onSubmit={handleSearch} className="card space-y-3 mb-6">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => { setMode('phone'); setQuery(''); setResult(null); setSearched(false) }}
                            className={mode === 'phone' ? 'filter-pill-active flex-1 py-2' : 'filter-pill-inactive flex-1 py-2'}
                        >
                            By Phone
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('id'); setQuery(''); setResult(null); setSearched(false) }}
                            className={mode === 'id' ? 'filter-pill-active flex-1 py-2' : 'filter-pill-inactive flex-1 py-2'}
                        >
                            By Customer ID
                        </button>
                    </div>
                    <input
                        type={mode === 'phone' ? 'tel' : 'number'}
                        placeholder={mode === 'phone' ? 'e.g. 0712345678' : 'e.g. 42'}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="input-field"
                    />
                    <button type="submit" disabled={loading} className="btn-primary-block">
                        {loading ? 'Searching...' : 'Check Balance'}
                    </button>
                </form>

                {error && <div className="alert-error mb-4">{error}</div>}

                {result && (
                    <div className="card space-y-3">
                        <div>
                            <p className="font-semibold text-brand-black dark:text-white">{result.username}</p>
                            <p className="text-xs text-faint">{result.phone_number}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-black/10 dark:border-white/10">
                            <div>
                                <p className="text-xs text-muted mb-1">Points Balance</p>
                                <p className="text-xl font-display font-bold text-brand-green-deep dark:text-brand-green">
                                    {result.points_balance}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted mb-1">Redeemable Value</p>
                                <p className="text-xl font-display font-bold text-brand-black dark:text-white">
                                    KES {result.points_value_kes}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-faint pt-1">
                            Lifetime earned: {result.lifetime_points_earned} points
                        </p>
                    </div>
                )}

                {!loading && !error && !result && searched && (
                    <p className="text-sm text-muted text-center">No customer found.</p>
                )}
            </div>
        </DashboardLayout>
    )
}

export default CustomerLoyaltyLookup
