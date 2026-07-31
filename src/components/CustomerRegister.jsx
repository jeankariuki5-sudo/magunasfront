import React, { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from './api/api'
import { AuthContext } from './context/AuthContext'
import Logo from './Logo'
import LocationPicker from './LocationPicker'

const CustomerRegister = () => {
    const { setToken, setUser } = useContext(AuthContext)
    const navigate = useNavigate()

    const [form, setForm] = useState({
        username: '',
        email: '',
        phone_number: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
    })
    // Delivery address is captured via the map picker instead of a plain text
    // field - gives us lat/lng alongside the formatted address.
    const [location, setLocation] = useState(null)
    const [pictureFile, setPictureFile] = useState(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // FormData because a photo may be attached - CustomerRegister reads
        // it via request.FILES on the backend.
        const payload = new FormData()
        Object.entries(form).forEach(([key, value]) => payload.append(key, value))
        if (location) {
            payload.append('default_delivery_address', location.address)
            payload.append('latitude', location.lat)
            payload.append('longitude', location.lng)
        }
        if (pictureFile) payload.append('profile_picture', pictureFile)

        try {
            const res = await api.post('accounts/auth/customer_register/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setLoading(false)

            const { user, tokens } = res.data
            setToken(tokens.access)
            setUser(user)

            localStorage.setItem('access_token', tokens.access)
            localStorage.setItem('refresh', tokens.refresh)
            localStorage.setItem('user', JSON.stringify(user))

            navigate('/customer-dashboard')
        } catch (err) {
            setLoading(false)
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        }
    }

    return (
        <div className="auth-page py-10">
            <form onSubmit={handleSubmit} className="auth-card max-w-md">
                <div className="flex justify-center mb-6">
                    <Logo size="sm" />
                </div>

                <h1 className="text-xl font-display font-semibold text-center mb-6 text-brand-black dark:text-white">
                    Create your account
                </h1>

                {error && <div className="alert-error mb-4">{error}</div>}

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                        type="text" name="first_name" placeholder="First name" required
                        className="input-field"
                        value={form.first_name} onChange={handleChange}
                    />
                    <input
                        type="text" name="last_name" placeholder="Last name" required
                        className="input-field"
                        value={form.last_name} onChange={handleChange}
                    />
                </div>

                <input
                    type="text" name="username" placeholder="Username" required
                    className="input-field mb-3"
                    value={form.username} onChange={handleChange}
                />

                <input
                    type="email" name="email" placeholder="Email" required
                    className="input-field mb-3"
                    value={form.email} onChange={handleChange}
                />

                <input
                    type="tel" name="phone_number" placeholder="Phone number"
                    className="input-field mb-3"
                    value={form.phone_number} onChange={handleChange}
                />

                <label className="block text-sm text-muted mb-1">
                    Delivery address (optional)
                </label>
                <div className="mb-3">
                    <LocationPicker value={location} onChange={setLocation} height="220px" />
                </div>

                <label className="block text-sm text-muted mb-1">
                    Profile picture (optional)
                </label>
                <input
                    type="file" accept="image/*"
                    onChange={(e) => setPictureFile(e.target.files[0])}
                    className="block text-sm mb-3"
                />

                <input
                    type="password" name="password" placeholder="Password" required
                    className="input-field mb-3"
                    value={form.password} onChange={handleChange}
                />

                <input
                    type="password" name="password2" placeholder="Confirm password" required
                    className="input-field mb-2"
                    value={form.password2} onChange={handleChange}
                />

                <button type="submit" disabled={loading} className="btn-primary-block mt-5">
                    {loading ? 'Creating account...' : 'Create account'}
                </button>

                <p className="text-center text-sm text-brand-black/60 dark:text-white/60 mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="link-accent">Sign in</Link>
                </p>
            </form>
        </div>
    )
}

export default CustomerRegister
