import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.css'
import { AuthProvider } from './components/context/AuthContext'
import { ThemeProvider } from './components/context/ThemeContext'
import ProtectedRoute from './components/context/ProtectedRoute'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import CustomerRegister from './components/CustomerRegister'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import NotAuthorised from './components/NotAuthorised'
import NotFound from './components/NotFound'

import AdminDashboard from './components/admin/AdminDashboard'
import CreateBranchManager from './components/admin/CreateBranchManager'
import UserManagement from './components/admin/UserManagement'
import AdminAllFeedback from './components/admin/AllFeedback'
import ActivityLogs from './components/admin/ActivityLogs'

import BranchDashboard from './components/branchmanager/BranchDashboard'
import BranchManagerProfile from './components/branchmanager/Profile'
import ManagerSubmitFeedback from './components/branchmanager/ManagerSubmitFeedback'
import BranchFeedback from './components/branchmanager/BranchFeedback'

import CustomerDashboard from './components/customer/CustomerDashboard'
import CustomerProfile from './components/customer/Profile'
import SubmitFeedback from './components/customer/SubmitFeedback'
import MyFeedback from './components/customer/MyFeedback'

function App() {
  return (
    <Router>
      {/* AuthProvider must live inside Router - it calls useNavigate internally */}
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<CustomerRegister />} />
            <Route path='/forgot_password' element={<ForgotPassword />} />
            <Route path='/reset_password' element={<ResetPassword />} />
            <Route path='/not_authorised' element={<NotAuthorised />} />

            {/* Role-based dashboards, matching the roles Login.jsx redirects to */}
            <Route
              path='/admin-dashboard'
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/branch-dashboard'
              element={
                <ProtectedRoute allowedRoles={['branch_manager']}>
                  <BranchDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/customer-dashboard'
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Customer */}
            <Route path='/profile' element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfile /></ProtectedRoute>} />
            <Route path='/feedback/submit' element={<ProtectedRoute allowedRoles={['customer']}><SubmitFeedback /></ProtectedRoute>} />
            <Route path='/feedback/my' element={<ProtectedRoute allowedRoles={['customer']}><MyFeedback /></ProtectedRoute>} />

            {/* Branch manager */}
            <Route path='/branch-profile' element={<ProtectedRoute allowedRoles={['branch_manager']}><BranchManagerProfile /></ProtectedRoute>} />
            <Route path='/branch-feedback/submit' element={<ProtectedRoute allowedRoles={['branch_manager']}><ManagerSubmitFeedback /></ProtectedRoute>} />
            <Route path='/branch-feedback' element={<ProtectedRoute allowedRoles={['branch_manager']}><BranchFeedback /></ProtectedRoute>} />

            {/* Admin */}
            <Route path='/admin/users' element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path='/admin/create-branch-manager' element={<ProtectedRoute allowedRoles={['admin']}><CreateBranchManager /></ProtectedRoute>} />
            <Route path='/admin/feedback' element={<ProtectedRoute allowedRoles={['admin']}><AdminAllFeedback /></ProtectedRoute>} />
            <Route path='/admin/activity' element={<ProtectedRoute allowedRoles={['admin']}><ActivityLogs /></ProtectedRoute>} />

            <Route path='*' element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
