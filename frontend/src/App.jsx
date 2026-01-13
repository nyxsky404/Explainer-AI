import { Routes, Route } from 'react-router'
import { Toaster } from '@/components/ui/sonner'

import Landing from './pages/public/landing'
import Login from './pages/public/login'
import Signup from './pages/public/signup'
import ForgotPassword from './pages/public/forgot-password/forgot-password'
import ResetPassword from './pages/public/reset-password/reset-password'
import VerifyEmail from './pages/public/verify-email'
import NotFound from './pages/public/error-page'
import PublicLayout from './Layouts/PublicLayout'
import ProtectedLayout from './Layouts/ProtectedLayout'
import Dashboard from './pages/protected/dashboard'
import Library from './pages/protected/Library'
import PodcastDetail from './pages/protected/PodcastDetail'
import PodcastGenerate from './pages/protected/PodcastGenerate'
import Profile from './pages/protected/Profile'

function App() {
  return (
    <>
      <Routes>
        {/* Public routes - redirect to dashboard if logged in */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Protected routes - redirect to login if not authenticated */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/podcast/generate" element={<PodcastGenerate />} />
          <Route path="/dashboard/podcast/:id" element={<PodcastDetail />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Landing page - accessible to all */}
        <Route path="/" element={<Landing />} />

        {/* 404 - Catch all undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  )
}

export default App
