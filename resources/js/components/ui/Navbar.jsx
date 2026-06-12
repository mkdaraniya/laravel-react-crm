import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex items-center h-16 px-6 bg-white border-b border-gray-200">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-sm">
                        <p className="font-medium text-gray-700">{user?.name}</p>
                        <p className="text-xs text-gray-400">{user?.role}</p>
                    </div>
                </Link>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700 font-medium ml-2">
                    Log out
                </button>
            </div>
        </div>
    );
}
