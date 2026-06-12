import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto">
                    <div className="px-6 py-6 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
