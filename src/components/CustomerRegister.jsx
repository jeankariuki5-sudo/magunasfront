import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from './api/api'
import { AuthContext } from './context/AuthContext'
import Logo from './Logo'
import LocationPicker from './LocationPicker'
import PasswordInput from './PasswordInput'
import PhotoUpload from './PhotoUpload'

// Turns "Jane" + "Wanjiru" into a reasonable starting username. Just a
// starting point - the person can freely overwrite it, at which point we
// stop touching the field for them (see usernameTouched below).
const suggestUsername = (firstName, lastName) => {
    return `${firstName}${lastName}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
}

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
    const [location, setLocation] = useState(null)
    const [pictureFile, setPictureFile] = useState(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Once the person types into the username field themselves, the
    // auto-suggestion effect below stops overwriting it.
    const [usernameTouched, setUsernameTouched] = useState(false)
    // The effect below is async (it awaits network calls), so by the time it
    // resolves, `usernameTouched` from its closure could be stale if the
    // person started typing mid-check. A ref always gives the live value.
    const usernameTouchedRef = useRef(false)
    useEffect(() => { usernameTouchedRef.current = usernameTouched }, [usernameTouched])

    // 'idle' | 'checking' | 'available' | 'taken' - drives the red-glow
    // border and inline message under each field.
    const [usernameStatus, setUsernameStatus] = useState('idle')
    const [emailStatus, setEmailStatus] = useState('idle')
    const [phoneStatus, setPhoneStatus] = useState('idle')

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    }

    // --- Username auto-suggestion from first/last name ---
    // Not just generating a name and hoping - actually checks availability,
    // and if the base name is taken, tries base1, base2, ... until it finds
    // one that's free (capped at 20 tries so this can't loop forever).
    useEffect(() => {
        if (usernameTouched) return
        const base = suggestUsername(form.first_name, form.last_name)
        if (!base) return

        let cancelled = false

        const findAvailable = async () => {
            let candidate = base
            let suffix = 0

            while (suffix <= 20) {
                if (cancelled || usernameTouchedRef.current) return
                try {
                    const res = await api.get('accounts/auth/check_availability/', {
                        params: { username: candidate },
                    })
                    if (res.data.username_available) break
                } catch {
                    return // fail open on a network hiccup rather than looping forever
                }
                suffix += 1
                candidate = `${base}${suffix}`
            }

            if (!cancelled && !usernameTouchedRef.current) {
                setForm((f) => ({ ...f, username: candidate }))
            }
        }

        findAvailable()
        return () => { cancelled = true }
    }, [form.first_name, form.last_name, usernameTouched])

    // --- Live username availability (debounced) ---
    useEffect(() => {
        if (!form.username) {
            setUsernameStatus('idle')
            return
        }
        setUsernameStatus('checking')
        const timer = setTimeout(async () => {
            try {
                const res = await api.get('accounts/auth/check_availability/', {
                    params: { username: form.username },
                })
                setUsernameStatus(res.data.username_available ? 'available' : 'taken')
            } catch {
                setUsernameStatus('idle') // fail open - don't block typing on a network hiccup
            }
        }, 500) // debounce: wait for a pause in typing before hitting the API

        return () => clearTimeout(timer)
    }, [form.username])

    // --- Live email availability (debounced) ---
    useEffect(() => {
        if (!form.email || !form.email.includes('@')) {
            setEmailStatus('idle')
            return
        }
        setEmailStatus('checking')
        const timer = setTimeout(async () => {
            try {
                const res = await api.get('accounts/auth/check_availability/', {
                    params: { email: form.email },
                })
                setEmailStatus(res.data.email_available ? 'available' : 'taken')
            } catch {
                setEmailStatus('idle')
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [form.email])

    // --- Live phone number availability (debounced) ---
    useEffect(() => {
        // Phone number is optional on this form, so an empty field just
        // stays idle rather than showing an error.
        if (!form.phone_number) {
            setPhoneStatus('idle')
            return
        }
        setPhoneStatus('checking')
        const timer = setTimeout(async () => {
            try {
                const res = await api.get('accounts/auth/check_availability/', {
                    params: { phone_number: form.phone_number },
                })
                setPhoneStatus(res.data.phone_number_available ? 'available' : 'taken')
            } catch {
                setPhoneStatus('idle')
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [form.phone_number])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (usernameStatus === 'taken') {
            setError('That username is already taken - pick another one.')
            return
        }
        if (emailStatus === 'taken') {
            setError('That email is already registered - try signing in instead.')
            return
        }
        if (phoneStatus === 'taken') {
            setError('That phone number is already registered to another account.')
            return
        }

        setLoading(true)

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

    // Red glow only kicks in once we've actually confirmed it's taken -
    // never while still checking or on a fresh/empty field.
    const fieldClass = (status) =>
        status === 'taken'
            ? 'input-field mb-1 border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'input-field mb-1'

    // Green glow only - no red state here, since "not matching yet" is just
    // the normal state while someone's still typing the confirmation.
    const passwordsMatch = form.password.length > 0 && form.password === form.password2
    const confirmPasswordClass = passwordsMatch
        ? 'input-field mb-1 border-brand-green focus:ring-brand-green focus:border-brand-green'
        : 'input-field mb-1'

    return (
        <div className="auth-page py-10">
            <form onSubmit={handleSubmit} autoComplete="off" className="auth-card max-w-md">
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
                        autoComplete="off"
                        className="input-field"
                        value={form.first_name} onChange={handleChange}
                    />
                    <input
                        type="text" name="last_name" placeholder="Last name" required
                        autoComplete="off"
                        className="input-field"
                        value={form.last_name} onChange={handleChange}
                    />
                </div>

                <input
                    type="text" name="username" placeholder="Username" required
                    autoComplete="off"
                    className={fieldClass(usernameStatus)}
                    value={form.username}
                    onChange={(e) => {
                        setUsernameTouched(true)
                        handleChange(e)
                    }}
                />
                <p className="text-xs mb-2 h-4">
                    {usernameStatus === 'checking' && <span className="text-faint">Checking availability...</span>}
                    {usernameStatus === 'taken' && <span className="text-red-500">Username already taken</span>}
                    {usernameStatus === 'available' && <span className="text-brand-green-deep dark:text-brand-green">Available</span>}
                </p>

                <input
                    type="email" name="email" placeholder="Email" required
                    autoComplete="off"
                    className={fieldClass(emailStatus)}
                    value={form.email} onChange={handleChange}
                />
                <p className="text-xs mb-2 h-4">
                    {emailStatus === 'checking' && <span className="text-faint">Checking availability...</span>}
                    {emailStatus === 'taken' && <span className="text-red-500">Email already registered</span>}
                    {emailStatus === 'available' && <span className="text-brand-green-deep dark:text-brand-green">Available</span>}
                </p>

                <input
                    type="tel" name="phone_number" placeholder="Phone number"
                    autoComplete="off"
                    className={fieldClass(phoneStatus)}
                    value={form.phone_number} onChange={handleChange}
                />
                <p className="text-xs mb-2 h-4">
                    {phoneStatus === 'checking' && <span className="text-faint">Checking availability...</span>}
                    {phoneStatus === 'taken' && <span className="text-red-500">Phone number already registered</span>}
                    {phoneStatus === 'available' && <span className="text-brand-green-deep dark:text-brand-green">Available</span>}
                </p>

                <label className="block text-sm text-muted mb-1">
                    Delivery address (optional)
                </label>
                <div className="mb-3">
                    <LocationPicker value={location} onChange={setLocation} height="220px" />
                </div>

                <label className="block text-sm text-muted mb-2">
                    Profile picture (optional)
                </label>
                <div className="mb-4">
                    <PhotoUpload label="Profile picture" onChange={setPictureFile} />
                </div>

                <PasswordInput
                    name="password" placeholder="Password" required
                    autoComplete="new-password"
                    className="input-field mb-3"
                    value={form.password} onChange={handleChange}
                />

                <PasswordInput
                    name="password2" placeholder="Confirm password" required
                    autoComplete="new-password"
                    className={confirmPasswordClass}
                    value={form.password2} onChange={handleChange}
                />
                <p className="text-xs mb-3 h-4">
                    {passwordsMatch && <span className="text-brand-green-deep dark:text-brand-green">Passwords match</span>}
                </p>

                <button
                    type="submit"
                    disabled={loading || usernameStatus === 'taken' || emailStatus === 'taken' || phoneStatus === 'taken'}
                    className="btn-primary-block mt-5"
                >
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
