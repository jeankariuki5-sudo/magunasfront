import { jwtDecode } from "jwt-decode";
import { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Create context - special hook that allows variables, functions to be available globally/anywhere
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    // Allows programatic navigation from one component to another based on their path
    const navigate = useNavigate()

    // Initial state auth by loading the token
    const [token, setToken] = useState(
        () => localStorage.getItem("access_token") || ""
    )

    const [user, setUser] = useState(
        () => {
            try {
                const stored = localStorage.getItem("user")
                return stored ? JSON.parse(stored) : null;
            }
            catch (error) {
                return null
            }
        }
    )

    // logout function - clears all the data from the localstorage and takes you back to the login component
    // Dependencies are passed to the callback so as to be accessible
    const Logout = useCallback(() => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
        localStorage.removeItem("refresh")

        setToken("")
        setUser(null)
        navigate("/login")
    }, [navigate])

    // Checking if the token is expired
    // runs anytime token changes
    // the jwt-decode will check the expiry
    useEffect(() => {
        if (!token) return

        try {
            // Decode the access token which was stored in the local storage which came from the backend
            const decode = jwtDecode(token)

            const isExpired = decode.exp * 1000 < Date.now()

            // FIX: this was being computed but never acted on before - a dead
            // token would just sit there silently instead of logging the user out.
            if (isExpired) {
                Logout()
            }
        } catch (error) {
            Logout()
        }
    }, [token, Logout])

    // Provider value - global value
    // Everything inside the "value" becomes accessible in the app
    return (
        <AuthContext.Provider
            value={{
                token,
                setToken,
                user,
                setUser,
                Logout
            }}>
            {children}
        </AuthContext.Provider>
    )

}
