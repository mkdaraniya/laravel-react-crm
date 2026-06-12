import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { apiError } from '../api/client';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.password_confirmation) {
            toast.error('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.password_confirmation);
            toast.success('Account created successfully!');
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
                    <p className="text-gray-500 mt-2">Create your account</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="you@company.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Min. 8 characters" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                            <input type="password" required value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                                className="w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Repeat password" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
