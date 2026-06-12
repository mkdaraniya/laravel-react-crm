import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { apiError } from '../api/client';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(apiError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600">ReactCRM</h1>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="you@company.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-700">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
