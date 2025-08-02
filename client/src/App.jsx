import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import PostJob from './pages/PostJob'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import SessionWarning from './components/SessionWarning'

function App() {
  const { isAuthenticated, cleanExpiredSessions, checkAuth } = useAuthStore()

  useEffect(() => {
    // Clean expired sessions on app initialization
    cleanExpiredSessions()
    
    // Check auth status if user appears to be authenticated
    if (isAuthenticated) {
      checkAuth()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionWarning />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route 
            path="post-job" 
            element={
              <ProtectedRoute>
                <PostJob />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </div>
  )
}

export default App 