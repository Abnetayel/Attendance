import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', form);
            login(data.token, data.user);
            toast.success(`Welcome back, ${data.user.name}!`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: 420, borderRadius: 20 }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <i className="bi bi-clock-history text-primary" style={{ fontSize: '2.5rem' }}></i>
                        <h3 className="fw-bold mt-2">AttendMS</h3>
                        <p className="text-muted">Attendance Management System</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Email</label>
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="you@company.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold">Password</label>
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 fw-semibold"
                            disabled={loading}
                        >
                            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                            Sign In
                        </button>
                    </form>

                    <p className="text-center mt-3 text-muted small">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-decoration-none fw-semibold">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
