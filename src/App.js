import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GeneratedUrlPage from './pages/GeneratedUrlPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminPanel from './pages/AdminPanel';
import UserManagement from './pages/UserManagement';
import AdminAnalytics from './pages/AdminAnalytics';
import RedirectHandler from './pages/RedirectHandler';
import { useAuth } from './context/AuthContext';
import './App.css';

// New public pages
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  // Redirect admin users trying to access regular dashboard to admin panel
  if (!requireAdmin && user.role === 'admin') {
    return <Navigate to="/admin" />;
  }
  
  return children;
};

// Admin can access regular routes if needed
const AdminOrUserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      {/* app-scale-root is a wrapper used to apply a visual scale on very small screens.
          This preserves all existing behavior while allowing a 50% visual zoom fallback
          when the viewport is below the threshold defined in App.css. */}
      <div className="app-scale-root">
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/faq" element={<FAQ />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/generated-urls" 
              element={
                <AdminOrUserRoute>
                  <GeneratedUrlPage />
                </AdminOrUserRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <AdminOrUserRoute>
                  <AnalyticsPage />
                </AdminOrUserRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAdmin>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminAnalytics />
                </ProtectedRoute>
              } 
            />
            {/* Add this as the LAST route in your Routes component */}
            <Route path="/:shortId" element={<RedirectHandler />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
