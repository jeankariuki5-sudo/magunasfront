import { useContext, useEffect, useState } from 'react'
import api from '../api/api'
import { AuthContext } from '../context/AuthContext'
import DashboardLayout from '../DashboardLayout'
import ChangePasswordForm from '../ChangePasswordForm'
import DeleteAccountForm from '../DeleteAccountForm'
import LocationPicker from '../LocationPicker'

const Profile = () => {
    const { setUser } = useContext(AuthContext)
    const [form, setForm] = useState(null)
    const [location, setLocation] = useState(null)
    const [currentPicture, setCurrentPicture] = useState(null)
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
                })
                if (res.data.profile.default_delivery_address || res.data.profile.latitude) {
                    setLocation({
                        address: res.data.profile.default_delivery_address,
                        lat: res.data.profile.latitude,
                        lng: res.data.profile.longitude,
                    })
                }
                setCurrentPicture(res.data.profile.profile_picture)
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

        const payload = new FormData()
        Object.entries(form).forEach(([key, value]) => payload.append(key, value))
        if (location) {
            payload.append('default_delivery_address', location.address)
            payload.append('latitude', location.lat)
            payload.append('longitude', location.lng)
        }
        if (pictureFile) payload.append('profile_picture', pictureFile)

        try {
            const res = await api.put('accounts/auth/me/update_my_profile/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setSuccess(res.data.message)
            setCurrentPicture(res.data.profile.profile_picture)
            setUser((prev) => ({ ...prev, email: res.data.user.email, phone_number: res.data.user.phone_number }))
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <p className="text-muted">Loading profile...</p>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout title="My Profile">
            <div className="max-w-2xl mx-auto space-y-6">
                <form onSubmit={handleSubmit} className="card">
                    <h3 className="font-display font-semibold text-brand-black dark:text-white mb-4">Profile Details</h3>

                    {success && <div className="alert-success mb-3">{success}</div>}
                    {error && <div className="alert-error mb-3">{error}</div>}

                    <div className="flex items-center gap-4 mb-4">
                        {currentPicture ? (
                            <img src={currentPicture} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-brand-black/10 dark:border-white/10" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-brand-black/5 dark:bg-white/5 flex items-center justify-center text-faint">
                                <i className="bi bi-person text-2xl" />
                            </div>
                        )}
                        <label className="text-sm text-muted">
                            Change photo
                            <input
                                type="file" accept="image/*"
                                onChange={(e) => setPictureFile(e.target.files[0])}
                                className="block mt-1 text-sm"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            type="text" name="first_name" placeholder="First name"
                            className="input-field"
                            value={form.first_name} onChange={handleChange}
                        />
                        <input
                            type="text" name="last_name" placeholder="Last name"
                            className="input-field"
                            value={form.last_name} onChange={handleChange}
                        />
                    </div>

                    <input
                        type="email" name="email" placeholder="Email"
                        className="input-field mb-3"
                        value={form.email} onChange={handleChange}
                    />

                    <input
                        type="tel" name="phone_number" placeholder="Phone number"
                        className="input-field mb-3"
                        value={form.phone_number} onChange={handleChange}
                    />

                    <label className="block text-sm text-muted mb-1">Delivery address</label>
                    <div className="mb-4">
                        <LocationPicker value={location} onChange={setLocation} height="220px" />
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                <ChangePasswordForm />
                <DeleteAccountForm />
            </div>
        </DashboardLayout>
    )
}

export default Profile
