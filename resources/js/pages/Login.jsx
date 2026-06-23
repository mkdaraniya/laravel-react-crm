import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { apiError } from '../api/client';
import { sanitize, RULES, validate } from '../utils/validation';

const DEMO_CREDENTIALS = { email: 'demo@reactcrm.com', password: 'demo1234' };

const VALIDATION_RULES = {
    email: [RULES.required, RULES.email],
    password: [RULES.required, RULES.minLength(1)],
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors(null);

        const formErrors = validate(VALIDATION_RULES, { email: sanitize(email), password });
        if (formErrors) {
            setErrors(formErrors);
            return;
        }

        setLoading(true);
        try {
            await login(sanitize(email), password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(apiError(err));
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = () => {
        setEmail(DEMO_CREDENTIALS.email);
        setPassword(DEMO_CREDENTIALS.password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600">ReactCRM</h1>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                    <p className="text-sm font-medium text-amber-800 mb-2">Demo Credentials</p>
                    <p className="text-xs text-amber-700">
                        Email: <span className="font-mono">{DEMO_CREDENTIALS.email}</span><br />
                        Password: <span className="font-mono">{DEMO_CREDENTIALS.password}</span>
                    </p>
                    <button type="button" onClick={fillDemo}
                        className="mt-2 text-xs font-medium text-amber-700 underline hover:text-amber-800">
                        Auto-fill credentials
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setErrors(null); }}
                                className={`w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors?.email ? 'border-red-400 focus:ring-red-500' : ''}`}
                                placeholder="you@company.com" autoComplete="email" />
                            {errors?.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <input type="password" required value={password} onChange={(e) => { setPassword(e.target.value); setErrors(null); }}
                                className={`w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors?.password ? 'border-red-400 focus:ring-red-500' : ''}`}
                                placeholder="Pass" autoComplete="current-password" />
                            {errors?.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
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
