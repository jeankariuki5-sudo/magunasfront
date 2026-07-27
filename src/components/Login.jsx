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
        <div className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-black px-4 transition-colors">
            <form onSubmit={handleLogin} className="bg-white dark:bg-white/5 dark:border dark:border-white/10 p-8 rounded-2xl shadow-sm w-full max-w-sm">
                <div className="flex justify-center mb-6">
                    <Logo size="sm" />
                </div>

                <h1 className="text-xl font-display font-semibold text-center mb-6 text-brand-black dark:text-white">
                    Sign in
                </h1>

                {/* our hook messages */}
                {success && (<div className='mb-4 text-brand-green-deep bg-brand-green/15 p-2 rounded-lg text-sm text-center'>{success}</div>)}
                {error && (<div className='mb-4 text-red-600 bg-red-100 dark:bg-red-500/10 p-2 rounded-lg text-sm text-center'>{error}</div>)}

                <input type="text"
                    placeholder='Username'
                    required
                    className='w-full px-4 py-3 mb-4 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} />

                <input type="password"
                    placeholder='Password'
                    required
                    className='w-full px-4 py-3 mb-2 border border-brand-black/15 dark:border-white/15 bg-transparent dark:text-white rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green transition outline-none'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />

                <p className="text-right text-xs mt-1">
                    <Link to="/forgot_password" className="text-brand-black/50 dark:text-white/50 hover:underline">
                        Forgot password?
                    </Link>
                </p>

                <button type='submit'
                    disabled={loading}
                    className='w-full bg-brand-green mt-5 text-brand-black font-display font-semibold p-3 rounded-lg hover:bg-brand-green-deep hover:text-white transition disabled:opacity-60'>
                    {loading ? "Signing in..." : "Login"}
                </button>

                <p className="text-center text-sm text-brand-black/60 dark:text-white/60 mt-4">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-brand-green-deep dark:text-brand-green font-semibold hover:underline">
                        Sign up
                    </Link>
                </p>
            </form>
        </div>
    )
}

export default Login
