import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.css'
import { AuthProvider } from './components/context/AuthContext'
import { CartProvider } from './components/context/CartContext'
import { ThemeProvider } from './components/context/ThemeContext'
import ProtectedRoute from './components/context/ProtectedRoute'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import CustomerRegister from './components/CustomerRegister'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import NotAuthorised from './components/NotAuthorised'
import NotFound from './components/NotFound'
import NearestBranchFinder from './components/NearestBranchFinder'
import Shop from './components/Shop'
import PromotionManager from './components/PromotionManager'
import CustomerLoyaltyLookup from './components/CustomerLoyaltyLookup'

import AdminDashboard from './components/admin/AdminDashboard'
import CreateBranchManager from './components/admin/CreateBranchManager'
import BranchManagerList from './components/admin/BranchManagerList'
import UserManagement from './components/admin/UserManagement'
import AdminAllFeedback from './components/admin/AllFeedback'
import ActivityLogs from './components/admin/ActivityLogs'
import CreateBranch from './components/admin/CreateBranch'
import BranchList from './components/admin/BranchList'
import CategoryManager from './components/admin/CategoryManager'
import ProductManager from './components/admin/ProductManager'
import BranchProductManager from './components/admin/BranchProductManager'

import BranchDashboard from './components/branchmanager/BranchDashboard'
import BranchManagerProfile from './components/branchmanager/Profile'
import ManagerSubmitFeedback from './components/branchmanager/ManagerSubmitFeedback'
import BranchFeedback from './components/branchmanager/BranchFeedback'
import MyBranchProducts from './components/branchmanager/MyBranchProducts'
import BranchOrders from './components/branchmanager/BranchOrders'

import CustomerDashboard from './components/customer/CustomerDashboard'
import CustomerProfile from './components/customer/Profile'
import SubmitFeedback from './components/customer/SubmitFeedback'
import MyFeedback from './components/customer/MyFeedback'
import Cart from './components/customer/Cart'
import Checkout from './components/customer/Checkout'
import MyOrders from './components/customer/MyOrders'
import Loyalty from './components/customer/Loyalty'

import AllOrders from './components/admin/AllOrders'
import AllPayments from './components/admin/AllPayments'
import AdminAnalytics from './components/admin/AdminAnalytics'
import BranchAnalytics from './components/branchmanager/BranchAnalytics'

function App() {
  return (
    <Router>
      {/* AuthProvider must live inside Router - it calls useNavigate internally */}
      <ThemeProvider>
        <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<CustomerRegister />} />
            <Route path='/forgot_password' element={<ForgotPassword />} />
            <Route path='/reset_password' element={<ResetPassword />} />
            <Route path='/not_authorised' element={<NotAuthorised />} />
            <Route path='/find-branch' element={<NearestBranchFinder />} />
            <Route path='/shop' element={<Shop />} />

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
            <Route path='/cart' element={<ProtectedRoute allowedRoles={['customer']}><Cart /></ProtectedRoute>} />
            <Route path='/checkout' element={<ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>} />
            <Route path='/orders/my' element={<ProtectedRoute allowedRoles={['customer']}><MyOrders /></ProtectedRoute>} />
            <Route path='/rewards' element={<ProtectedRoute allowedRoles={['customer']}><Loyalty /></ProtectedRoute>} />

            {/* Branch manager */}
            <Route path='/branch-profile' element={<ProtectedRoute allowedRoles={['branch_manager']}><BranchManagerProfile /></ProtectedRoute>} />
            <Route path='/branch-feedback/submit' element={<ProtectedRoute allowedRoles={['branch_manager']}><ManagerSubmitFeedback /></ProtectedRoute>} />
            <Route path='/branch-feedback' element={<ProtectedRoute allowedRoles={['branch_manager']}><BranchFeedback /></ProtectedRoute>} />
            <Route path='/branch-products' element={<ProtectedRoute allowedRoles={['branch_manager']}><MyBranchProducts /></ProtectedRoute>} />
            <Route path='/branch-orders' element={<ProtectedRoute allowedRoles={['branch_manager']}><BranchOrders /></ProtectedRoute>} />
            <Route path='/branch-analytics' element={<ProtectedRoute allowedRoles={['branch_manager']}><BranchAnalytics /></ProtectedRoute>} />
            <Route path='/branch-promotions' element={<ProtectedRoute allowedRoles={['branch_manager']}><PromotionManager /></ProtectedRoute>} />
            <Route path='/branch-loyalty-lookup' element={<ProtectedRoute allowedRoles={['branch_manager']}><CustomerLoyaltyLookup /></ProtectedRoute>} />

            {/* Admin */}
            <Route path='/admin/users' element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path='/admin/branch-managers' element={<ProtectedRoute allowedRoles={['admin']}><BranchManagerList /></ProtectedRoute>} />
            <Route path='/admin/create-branch-manager' element={<ProtectedRoute allowedRoles={['admin']}><CreateBranchManager /></ProtectedRoute>} />
            <Route path='/admin/feedback' element={<ProtectedRoute allowedRoles={['admin']}><AdminAllFeedback /></ProtectedRoute>} />
            <Route path='/admin/activity' element={<ProtectedRoute allowedRoles={['admin']}><ActivityLogs /></ProtectedRoute>} />
            <Route path='/admin/branches' element={<ProtectedRoute allowedRoles={['admin']}><BranchList /></ProtectedRoute>} />
            <Route path='/admin/create-branch' element={<ProtectedRoute allowedRoles={['admin']}><CreateBranch /></ProtectedRoute>} />
            <Route path='/admin/categories' element={<ProtectedRoute allowedRoles={['admin']}><CategoryManager /></ProtectedRoute>} />
            <Route path='/admin/products' element={<ProtectedRoute allowedRoles={['admin']}><ProductManager /></ProtectedRoute>} />
            <Route path='/admin/branch-products' element={<ProtectedRoute allowedRoles={['admin']}><BranchProductManager /></ProtectedRoute>} />
            <Route path='/admin/orders' element={<ProtectedRoute allowedRoles={['admin']}><AllOrders /></ProtectedRoute>} />
            <Route path='/admin/payments' element={<ProtectedRoute allowedRoles={['admin']}><AllPayments /></ProtectedRoute>} />
            <Route path='/admin/analytics' element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
            <Route path='/admin/promotions' element={<ProtectedRoute allowedRoles={['admin']}><PromotionManager /></ProtectedRoute>} />
            <Route path='/admin/loyalty-lookup' element={<ProtectedRoute allowedRoles={['admin']}><CustomerLoyaltyLookup /></ProtectedRoute>} />

            <Route path='*' element={<NotFound />} />
          </Routes>
        </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App