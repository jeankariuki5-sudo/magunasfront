import { useContext, useState } from 'react'
import api from './api/api'
import { AuthContext } from './context/AuthContext'

const DeleteAccountForm = () => {
    const { Logout } = useContext(AuthContext)
    const [password, setPassword] = useState('')
    const [confirming, setConfirming] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleDelete = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // DeleteMyAccount uses request.data.get('password'), sent as JSON here
            await api.delete('accounts/auth/me/delete/', { data: { password } })
            Logout()
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    if (!confirming) {
        return (
            <div className="bg-white dark:bg-white/5 dark:border dark:border-red-500/20 rounded-xl p-5">
                <h3 className="font-display font-semibold text-red-500 mb-2">Delete Account</h3>
                <p className="text-sm text-brand-black/60 dark:text-white/60 mb-4">
                    This permanently deletes your account. This cannot be undone.
                </p>
                <button
                    onClick={() => setConfirming(true)}
                    className="text-sm font-semibold text-red-500 border border-red-500/30 rounded-lg px-4 py-2 hover:bg-red-500/10 transition"
                >
                    Delete my account
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleDelete} className="bg-white dark:bg-white/5 dark:border dark:border-red-500/20 rounded-xl p-5">
            <h3 className="font-display font-semibold text-red-500 mb-2">Confirm Deletion</h3>
            <p className="text-sm text-brand-black/60 dark:text-white/60 mb-4">
                Enter your password to permanently delete your account.
            </p>

            {error && <div className="mb-3 text-sm text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-center">{error}</div>}

            <input
                type="password" placeholder="Password" required
                className="w-full px-4 py-3 mb-4 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex gap-3">
                <button
                    type="submit" disabled={loading}
                    className="bg-red-500 text-white font-display font-semibold px-5 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-60"
                >
                    {loading ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                    type="button" onClick={() => setConfirming(false)}
                    className="text-sm font-semibold text-brand-black/60 dark:text-white/60 px-4 py-2 hover:text-brand-black dark:hover:text-white transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

export default DeleteAccountForm
