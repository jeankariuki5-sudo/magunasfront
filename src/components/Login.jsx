import React, { useContext, useState } from 'react'
import api from './api/api'
import { AuthContext } from './context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import Logo from './Logo'

const Login = () => {

    const { setToken, setUser } = useContext(AuthContext)

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    // hook to allow programatic navigation
    const navigate = useNavigate()

    // Function to handle login requests
    const handleLogin = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        // prepare our data to send to backend
        const data = { username, password }

        try {
            const res = await api.post("accounts/auth/login/", data)
            setLoading(false)

            // Your backend nests the real payload under "user" and "tokens" -
            // not flat access_token/role/username like before.
            const { user, tokens } = res.data

            // save them to our context
            setToken(tokens.access)
            setUser(user)

            // saving to the localstorage
            localStorage.setItem("access_token", tokens.access)
            localStorage.setItem("refresh", tokens.refresh)
            localStorage.setItem("user", JSON.stringify(user))

            // Role based redirects
            if (user.role === 'admin') {
                navigate('/admin-dashboard')
            }
            else if (user.role === 'branch_manager') {
                navigate('/branch-dashboard')
            }
            else if (user.role === 'customer') {
                navigate('/customer-dashboard')
            }

        }
        catch (err) {
            setLoading(false)
            // Django returns 401 (bad credentials), 403 (suspended), or 429
            // (rate limited) - all land here, not in a res.data.error check,
            // since axios throws on any non-2xx response.
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        }
    }

    return (
        <div className="auth-page">
            <form onSubmit={handleLogin} className="auth-card">
                <div className="flex justify-center mb-6">
                    <Logo size="sm" />
                </div>

                <h1 className="text-xl font-display font-semibold text-center mb-6 text-brand-black dark:text-white">
                    Sign in
                </h1>

                {/* our hook messages */}
                {success && (<div className="alert-success mb-4">{success}</div>)}
                {error && (<div className="alert-error mb-4">{error}</div>)}

                <input type="text"
                    placeholder='Username'
                    required
                    className="input-field mb-4"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} />

                <input type="password"
                    placeholder='Password'
                    required
                    className="input-field mb-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />

                <p className="text-right text-xs mt-1">
                    <Link to="/forgot_password" className="text-brand-black/50 dark:text-white/50 hover:underline">
                        Forgot password?
                    </Link>
                </p>

                <button type='submit'
                    disabled={loading}
                    className="btn-primary-block mt-5">
                    {loading ? "Signing in..." : "Login"}
                </button>

                <p className="text-center text-sm text-brand-black/60 dark:text-white/60 mt-4">
                    Don't have an account?{' '}
                    <Link to="/register" className="link-accent">
                        Sign up
                    </Link>
                </p>
            </form>
        </div>
    )
}

export default Login
