import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from './AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(AuthContext)

    if (!user) {
        return <Navigate to="/login" />
    }

    // Role check
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/not_authorised" />
    }

    return children
}

export default ProtectedRoute
