import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/ui/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Contacts from './pages/Contacts';
import Tasks from './pages/Tasks';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Loading...</span>
            </div>
        </div>
    );
    return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: { borderRadius: '10px', padding: '12px 16px', fontSize: '14px' },
                        success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                    }}
                />
                <Routes>
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="pipeline" element={<Pipeline />} />
                        <Route path="contacts" element={<Contacts />} />
                        <Route path="tasks" element={<Tasks />} />
                        <Route path="billing" element={<Billing />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
