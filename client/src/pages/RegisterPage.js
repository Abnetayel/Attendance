import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'General'];

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: 'Employee', department: 'General',
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match.');
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                department: form.department,
            });
            login(data.token, data.user);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center py-4"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: 480, borderRadius: 20 }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <i className="bi bi-person-plus text-primary" style={{ fontSize: '2rem' }}></i>
                        <h4 className="fw-bold mt-2">Create Account</h4>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label fw-semibold">Full Name</label>
                                <input type="text" className="form-control" placeholder="John Doe"
                                    value={form.name} onChange={set('name')} required />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-semibold">Email</label>
                                <input type="email" className="form-control" placeholder="you@company.com"
                                    value={form.email} onChange={set('email')} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Password</label>
                                <input type="password" className="form-control" placeholder="Min 6 chars"
                                    value={form.password} onChange={set('password')} required minLength={6} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Confirm Password</label>
                                <input type="password" className="form-control" placeholder="Repeat"
                                    value={form.confirmPassword} onChange={set('confirmPassword')} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Role</label>
                                <select className="form-select" value={form.role} onChange={set('role')}>
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Department</label>
                                <select className="form-select" value={form.department} onChange={set('department')}>
                                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mt-4" disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                            Create Account
                        </button>
                    </form>

                    <p className="text-center mt-3 text-muted small">
                        Already have an account?{' '}
                        <Link to="/login" className="text-decoration-none fw-semibold">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
