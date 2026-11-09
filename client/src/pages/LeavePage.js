import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const LEAVE_TYPES = ['Sick', 'Casual', 'Annual', 'Maternity', 'Paternity', 'Unpaid'];

export default function LeavePage() {
    const [leaves, setLeaves] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ leaveType: 'Sick', startDate: '', endDate: '', reason: '' });
    const [loading, setLoading] = useState(false);

    const fetchLeaves = useCallback(async () => {
        try {
            const { data } = await api.get('/leaves/my');
            setLeaves(data.leaves);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.endDate < form.startDate) {
            return toast.error('End date cannot be before start date.');
        }
        setLoading(true);
        try {
            await api.post('/leaves', form);
            toast.success('Leave application submitted!');
            setForm({ leaveType: 'Sick', startDate: '', endDate: '', reason: '' });
            setShowForm(false);
            fetchLeaves();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit.');
        } finally {
            setLoading(false);
        }
    };

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-0">My Leave Requests</h4>
                    <p className="text-muted">Apply and track your leave applications</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <i className="bi bi-plus-circle me-2"></i>Apply for Leave
                </button>
            </div>

            {/* Apply Form */}
            {showForm && (
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-3">New Leave Application</h6>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">Leave Type</label>
                                    <select className="form-select" value={form.leaveType} onChange={set('leaveType')}>
                                        {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Start Date</label>
                                    <input type="date" className="form-control" value={form.startDate}
                                        onChange={set('startDate')} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">End Date</label>
                                    <input type="date" className="form-control" value={form.endDate}
                                        onChange={set('endDate')} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Reason</label>
                                    <textarea className="form-control" rows={3} placeholder="Please provide reason..."
                                        value={form.reason} onChange={set('reason')} required />
                                </div>
                                <div className="col-12 d-flex gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading && <span className="spinner-border spinner-border-sm me-2" />}
                                        Submit Application
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary"
                                        onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Leaves Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                    {leaves.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-calendar-x fs-1"></i>
                            <p className="mt-2">No leave requests yet.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Type</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Review Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((l) => (
                                        <tr key={l._id}>
                                            <td><span className="badge bg-info text-dark">{l.leaveType}</span></td>
                                            <td>{l.startDate}</td>
                                            <td>{l.endDate}</td>
                                            <td className="text-muted small" style={{ maxWidth: 200 }}>{l.reason}</td>
                                            <td><StatusBadge status={l.status} /></td>
                                            <td className="text-muted small">{l.reviewNote || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
