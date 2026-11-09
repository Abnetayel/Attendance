import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'Admin' || user?.role === 'Manager';

    return (
        <div>
            {/* Sidebar */}
            <nav className="sidebar d-flex flex-column">
                <div className="px-4 py-3 mb-2">
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <i className="bi bi-clock-history text-info fs-4"></i>
                        <span className="text-white fw-bold fs-5">AttendMS</span>
                    </div>
                    <small className="text-white-50">{user?.department}</small>
                </div>

                <ul className="nav flex-column flex-grow-1">
                    <li className="nav-item">
                        <NavLink to="/dashboard" className="nav-link" end>
                            <i className="bi bi-speedometer2 me-2"></i> Dashboard
                        </NavLink>
                    </li>

                    {!isAdmin && (
                        <li className="nav-item">
                            <NavLink to="/my-attendance" className="nav-link">
                                <i className="bi bi-calendar-check me-2"></i> My Attendance
                            </NavLink>
                        </li>
                    )}

                    <li className="nav-item">
                        <NavLink to="/leaves" className="nav-link">
                            <i className="bi bi-calendar2-x me-2"></i> My Leaves
                        </NavLink>
                    </li>

                    {isAdmin && (
                        <>
                            <li className="nav-item mt-2">
                                <small className="text-white-50 px-4 text-uppercase" style={{ fontSize: '0.7rem' }}>Admin</small>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/admin/attendance" className="nav-link">
                                    <i className="bi bi-table me-2"></i> All Attendance
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/admin/leaves" className="nav-link">
                                    <i className="bi bi-envelope-paper me-2"></i> Leave Requests
                                </NavLink>
                            </li>
                            {user?.role === 'Admin' && (
                                <li className="nav-item">
                                    <NavLink to="/admin/users" className="nav-link">
                                        <i className="bi bi-people me-2"></i> Employees
                                    </NavLink>
                                </li>
                            )}
                        </>
                    )}
                </ul>

                {/* User info at bottom */}
                <div className="px-4 py-3 border-top border-secondary">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="rounded-circle bg-info d-flex align-items-center justify-content-center"
                            style={{ width: 36, height: 36 }}>
                            <span className="fw-bold text-dark">{user?.name?.[0]}</span>
                        </div>
                        <div>
                            <div className="text-white small fw-semibold">{user?.name}</div>
                            <div className="text-white-50" style={{ fontSize: '0.75rem' }}>{user?.role}</div>
                        </div>
                    </div>
                    <button className="btn btn-outline-danger btn-sm w-100" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-1"></i> Logout
                    </button>
                </div>
            </nav>

            {/* Main content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
