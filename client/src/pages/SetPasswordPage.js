import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) setTokenValid(false);
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match.');
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/set-password', { token, password: form.password });
            login(data.token, data.user);
            toast.success('Password set! Welcome aboard.');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to set password.';
            toast.error(msg);
            if (msg.includes('expired') || msg.includes('Invalid')) setTokenValid(false);
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                <div className="card shadow-lg border-0 text-center p-5" style={{ maxWidth: 420, borderRadius: 20 }}>
                    <i className="bi bi-x-circle text-danger" style={{ fontSize: '3rem' }}></i>
                    <h4 className="fw-bold mt-3">Link Invalid or Expired</h4>
                    <p className="text-muted">This password setup link is no longer valid. Please contact your admin to resend the invite.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: 420, borderRadius: 20 }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <i className="bi bi-shield-lock text-primary" style={{ fontSize: '2.5rem' }}></i>
                        <h3 className="fw-bold mt-2">Set Your Password</h3>
                        <p className="text-muted">Create a secure password to activate your account.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">New Password</label>
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Min 6 characters"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-semibold">Confirm Password</label>
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Repeat password"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                            Activate Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
