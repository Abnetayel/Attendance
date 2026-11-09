import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

export default function AdminLeavePage() {
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState('');
    const [reviewModal, setReviewModal] = useState(null); // { leave, action }
    const [reviewNote, setReviewNote] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchLeaves = useCallback(async () => {
        try {
            const params = filter ? `?status=${filter}` : '';
            const { data } = await api.get(`/leaves/admin/all${params}`);
            setLeaves(data.leaves);
        } catch (err) {
            console.error(err);
        }
    }, [filter]);

    useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

    const handleReview = async (status) => {
        setLoading(true);
        try {
            await api.patch(`/leaves/${reviewModal.leave._id}/review`, { status, reviewNote });
            toast.success(`Leave ${status.toLowerCase()}.`);
            setReviewModal(null);
            setReviewNote('');
            fetchLeaves();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-4">
                <h4 className="fw-bold mb-0">Leave Requests</h4>
                <p className="text-muted">Review and manage team leave applications</p>
            </div>

            {/* Filter */}
            <div className="d-flex gap-2 mb-4">
                {['', 'Pending', 'Approved', 'Rejected'].map((s) => (
                    <button
                        key={s}
                        className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFilter(s)}
                    >
                        {s || 'All'}
                    </button>
                ))}
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                    {leaves.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-inbox fs-1"></i>
                            <p className="mt-2">No leave requests.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Employee</th>
                                        <th>Dept</th>
                                        <th>Type</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((l) => (
                                        <tr key={l._id}>
                                            <td className="fw-semibold">{l.userId?.name}</td>
                                            <td><span className="badge bg-secondary">{l.userId?.department}</span></td>
                                            <td><span className="badge bg-info text-dark">{l.leaveType}</span></td>
                                            <td>{l.startDate}</td>
                                            <td>{l.endDate}</td>
                                            <td className="text-muted small" style={{ maxWidth: 160 }}>{l.reason}</td>
                                            <td><StatusBadge status={l.status} /></td>
                                            <td>
                                                {l.status === 'Pending' ? (
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => setReviewModal({ leave: l })}
                                                    >
                                                        Review
                                                    </button>
                                                ) : (
                                                    <span className="text-muted small">{l.reviewNote || '—'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {reviewModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0" style={{ borderRadius: 16 }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Review Leave Request</h5>
                                <button className="btn-close" onClick={() => setReviewModal(null)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3 p-3 bg-light rounded">
                                    <div><strong>{reviewModal.leave.userId?.name}</strong></div>
                                    <div className="text-muted small">{reviewModal.leave.leaveType} · {reviewModal.leave.startDate} → {reviewModal.leave.endDate}</div>
                                    <div className="mt-1 small">{reviewModal.leave.reason}</div>
                                </div>
                                <label className="form-label">Review Note (optional)</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    placeholder="Add a note..."
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button className="btn btn-outline-secondary" onClick={() => setReviewModal(null)}>Cancel</button>
                                <button className="btn btn-danger" disabled={loading} onClick={() => handleReview('Rejected')}>
                                    {loading ? <span className="spinner-border spinner-border-sm" /> : 'Reject'}
                                </button>
                                <button className="btn btn-success" disabled={loading} onClick={() => handleReview('Approved')}>
                                    {loading ? <span className="spinner-border spinner-border-sm" /> : 'Approve'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
