import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { apiError } from '../api/client';
import { sanitize, RULES, validate } from '../utils/validation';

const VALIDATION_RULES = {
    name: [RULES.required, RULES.name, RULES.maxLength(255)],
    email: [RULES.required, RULES.email, RULES.maxLength(255)],
    password: [RULES.required, RULES.minLength(8), RULES.maxLength(255)],
    password_confirmation: [RULES.required, RULES.passwordMatch],
};

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors(null);

        const formErrors = validate(VALIDATION_RULES, {
            name: sanitize(form.name),
            email: sanitize(form.email),
            password: form.password,
            password_confirmation: form.password_confirmation,
        });
        if (formErrors) {
            setErrors(formErrors);
            return;
        }

        setLoading(true);
        try {
            await register(sanitize(form.name), sanitize(form.email), form.password, form.password_confirmation);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(apiError(err));
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600">ReactCRM</h1>
                    <p className="text-gray-500 mt-2">Create your account</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                            <input type="text" required value={form.name} onChange={(e) => updateField('name', e.target.value)}
                                className={`w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors?.name ? 'border-red-400 focus:ring-red-500' : ''}`}
                                placeholder="John Doe" autoComplete="name" />
                            {errors?.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input type="email" required value={form.email} onChange={(e) => updateField('email', e.target.value)}
                                className={`w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors?.email ? 'border-red-400 focus:ring-red-500' : ''}`}
                                placeholder="you@company.com" autoComplete="email" />
                            {errors?.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <input type="password" required minLength={8} value={form.password} onChange={(e) => updateField('password', e.target.value)}
                                className={`w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors?.password ? 'border-red-400 focus:ring-red-500' : ''}`}
                                placeholder="Min. 8 characters" autoComplete="new-password" />
                            {errors?.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                            <input type="password" required value={form.password_confirmation} onChange={(e) => updateField('password_confirmation', e.target.value)}
                                className={`w-full rounded-xl border-gray-300 text-sm px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors?.password_confirmation ? 'border-red-400 focus:ring-red-500' : ''}`}
                                placeholder="Repeat password" autoComplete="new-password" />
                            {errors?.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
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
