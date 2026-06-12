import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updatePassword, deleteAccount } from '../api/profile';
import { apiError } from '../api/client';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Profile() {
    const { user, fetchUser, logout } = useAuth();
    const navigate = useNavigate();

    const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [savingProfile, setSavingProfile] = useState(false);

    const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [savingPw, setSavingPw] = useState(false);

    const [showDelete, setShowDelete] = useState(false);
    const [deletePw, setDeletePw] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await updateProfile(profileForm);
            toast.success('Profile updated.');
            fetchUser();
        } catch (err) { toast.error(apiError(err)); }
        finally { setSavingProfile(false); }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setSavingPw(true);
        try {
            await updatePassword(pwForm);
            toast.success('Password updated.');
            setPwForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) { toast.error(apiError(err)); }
        finally { setSavingPw(false); }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await deleteAccount(deletePw);
            toast.success('Account deleted.');
            await logout();
            navigate('/login');
        } catch (err) { toast.error(apiError(err)); }
        finally { setDeleting(false); }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <h2 className="text-xl font-semibold text-gray-800">Profile</h2>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" required value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="pt-2">
                        <Button type="submit" loading={savingProfile}>Save Changes</Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input type="password" required value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" required value={pwForm.password} onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" required value={pwForm.password_confirmation} onChange={(e) => setPwForm({ ...pwForm, password_confirmation: e.target.value })}
                            className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="pt-2">
                        <Button type="submit" loading={savingPw}>Update Password</Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-red-200 p-6">
                <h3 className="text-lg font-semibold text-red-700 mb-2">Delete Account</h3>
                <p className="text-sm text-gray-600 mb-4">Once your account is deleted, all of your data will be permanently removed. This action cannot be undone.</p>
                <Button variant="danger" onClick={() => setShowDelete(true)}>Delete Account</Button>
            </div>

            <ConfirmDialog open={showDelete} onClose={() => { setShowDelete(false); setDeletePw(''); }} onConfirm={handleDeleteAccount}
                title="Delete Account" message="This will permanently delete your account and all associated data."
                confirmText="Delete My Account" loading={deleting}
                onCancel={() => { setShowDelete(false); setDeletePw(''); }}>
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">Enter your password to confirm deletion.</p>
                    <input type="password" placeholder="Enter your password" value={deletePw}
                        onChange={(e) => setDeletePw(e.target.value)}
                        className="w-full rounded-lg border-gray-300 text-sm px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        onClick={(e) => e.stopPropagation()} />
                </div>
            </ConfirmDialog>
        </div>
    );
}
