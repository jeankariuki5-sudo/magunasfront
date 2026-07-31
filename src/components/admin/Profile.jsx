import { useContext, useEffect, useState } from 'react'
import api from '../api/api'
import { AuthContext } from '../context/AuthContext'
import ChangePasswordForm from '../ChangePasswordForm'
import DeleteAccountForm from '../DeleteAccountForm'

const Profile = () => {
    const { setUser } = useContext(AuthContext)
    const [form, setForm] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [pictureFile, setPictureFile] = useState(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('accounts/auth/me/')
                setForm({
                    email: res.data.email,
                    phone_number: res.data.phone_number,
                    first_name: res.data.profile.first_name || '',
                    last_name: res.data.profile.last_name || '',
                    default_delivery_address: res.data.profile.default_delivery_address || '',
                })
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load profile')
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSaving(true)

        // UpdateMyProfile reads request.FILES for profile_picture, so this has
        // to go as multipart/form-data whenever a new picture is attached.
        const payload = new FormData()
        Object.entries(form).forEach(([key, value]) => payload.append(key, value))
        if (pictureFile) payload.append('profile_picture', pictureFile)

        try {
            const res = await api.put('accounts/auth/me/update_my_profile/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setSuccess(res.data.message)
            setUser((prev) => ({ ...prev, email: res.data.user.email, phone_number: res.data.user.phone_number }))
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-cream dark:bg-brand-black flex items-center justify-center transition-colors">
                <p className="text-brand-black/60 dark:text-white/60">Loading profile...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
            <DashboardHeader title="My Profile" />

            <main className="px-6 md:px-12 py-8 max-w-2xl mx-auto space-y-6">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl p-5">
                    <h3 className="font-display font-semibold text-brand-black dark:text-white mb-4">Profile Details</h3>

                    {success && <div className="mb-3 text-sm text-brand-green-deep bg-brand-green/15 p-2 rounded-lg text-center">{success}</div>}
                    {error && <div className="mb-3 text-sm text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-center">{error}</div>}

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            type="text" name="first_name" placeholder="First name"
                            className="w-full px-4 py-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                            value={form.first_name} onChange={handleChange}
                        />
                        <input
                            type="text" name="last_name" placeholder="Last name"
                            className="w-full px-4 py-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                            value={form.last_name} onChange={handleChange}
                        />
                    </div>

                    <input
                        type="email" name="email" placeholder="Email"
                        className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                        value={form.email} onChange={handleChange}
                    />

                    <input
                        type="tel" name="phone_number" placeholder="Phone number"
                        className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                        value={form.phone_number} onChange={handleChange}
                    />

                    <input
                        type="text" name="default_delivery_address" placeholder="Delivery address"
                        className="w-full px-4 py-3 mb-3 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none"
                        value={form.default_delivery_address} onChange={handleChange}
                    />

                    <label className="block text-sm text-brand-black/60 dark:text-white/60 mb-4">
                        Profile picture
                        <input
                            type="file" accept="image/*"
                            onChange={(e) => setPictureFile(e.target.files[0])}
                            className="block mt-1 text-sm"
                        />
                    </label>

                    <button
                        type="submit" disabled={saving}
                        className="bg-brand-green text-brand-black font-display font-semibold px-5 py-2 rounded-lg hover:bg-brand-green-deep hover:text-white transition disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                <ChangePasswordForm />
                <DeleteAccountForm />
            </main>
        </div>
    )
}

export default Profile
