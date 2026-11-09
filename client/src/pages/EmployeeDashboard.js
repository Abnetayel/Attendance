import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AttendanceTable from '../components/AttendanceTable';
import LiveClock from '../components/LiveClock';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [today, setToday] = useState(null);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ present: 0, late: 0, absent: 0, totalHours: 0 });
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');

    const fetchToday = useCallback(async () => {
        try {
            const { data } = await api.get('/attendance/today');
            setToday(data.record);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            const { data } = await api.get('/attendance/my-history?limit=20');
            setHistory(data.records);
            // Compute stats
            const present = data.records.filter((r) => r.status === 'Present').length;
            const late = data.records.filter((r) => r.status === 'Late').length;
            const absent = data.records.filter((r) => r.status === 'Absent').length;
            const totalHours = data.records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
            setStats({ present, late, absent, totalHours: totalHours.toFixed(1) });
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchToday();
        fetchHistory();
    }, [fetchToday, fetchHistory]);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            await api.post('/attendance/check-in', { notes });
            toast.success('Checked in successfully!');
            setNotes('');
            fetchToday();
            fetchHistory();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-in failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            await api.post('/attendance/check-out');
            toast.success('Checked out successfully!');
            fetchToday();
            fetchHistory();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-out failed.');
        } finally {
            setLoading(false);
        }
    };

    const canCheckIn = !today;
    const canCheckOut = today && !today.checkOutTime;

    return (
        <div>
            <div className="mb-4">
                <h4 className="fw-bold mb-0">Welcome back, {user?.name} 👋</h4>
                <p className="text-muted">{user?.department} · {user?.role}</p>
            </div>

            {/* Stats Row */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Present Days', value: stats.present, color: '#198754', icon: 'bi-check-circle' },
                    { label: 'Late Arrivals', value: stats.late, color: '#ffc107', icon: 'bi-clock' },
                    { label: 'Absences', value: stats.absent, color: '#dc3545', icon: 'bi-x-circle' },
                    { label: 'Total Hours', value: `${stats.totalHours}h`, color: '#0d6efd', icon: 'bi-hourglass' },
                ].map((s) => (
                    <div key={s.label} className="col-6 col-md-3">
                        <div className="stat-card" style={{ background: s.color }}>
                            <i className={`bi ${s.icon} fs-3 mb-2 d-block`}></i>
                            <div className="fs-2 fw-bold">{s.value}</div>
                            <div className="small opacity-75">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4 mb-4">
                {/* Clock & Check-in/out */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                        <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center">
                            <LiveClock />

                            <div className="d-flex gap-4 mt-4">
                                <button
                                    className="checkin-btn btn btn-success"
                                    onClick={handleCheckIn}
                                    disabled={!canCheckIn || loading}
                                    style={{ borderColor: '#198754', opacity: canCheckIn ? 1 : 0.4 }}
                                >
                                    <i className="bi bi-box-arrow-in-right d-block fs-2 mb-1"></i>
                                    Check In
                                </button>
                                <button
                                    className="checkin-btn btn btn-danger"
                                    onClick={handleCheckOut}
                                    disabled={!canCheckOut || loading}
                                    style={{ borderColor: '#dc3545', opacity: canCheckOut ? 1 : 0.4 }}
                                >
                                    <i className="bi bi-box-arrow-right d-block fs-2 mb-1"></i>
                                    Check Out
                                </button>
                            </div>

                            {canCheckIn && (
                                <div className="mt-3 w-100">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Optional notes..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Today's status card */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                                Today's Summary
                            </h6>
                            {today ? (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-muted">Status</span>
                                        <StatusBadge status={today.status} />
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Check In</span>
                                        <span className="fw-semibold">
                                            {today.checkInTime ? new Date(today.checkInTime).toLocaleTimeString() : '—'}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Check Out</span>
                                        <span className="fw-semibold">
                                            {today.checkOutTime ? new Date(today.checkOutTime).toLocaleTimeString() : '—'}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Total Hours</span>
                                        <span className="fw-semibold">
                                            {today.totalHours > 0 ? `${today.totalHours}h` : 'In Progress...'}
                                        </span>
                                    </div>
                                    {today.notes && (
                                        <div className="mt-3 p-2 bg-light rounded">
                                            <small className="text-muted"><i className="bi bi-chat-left-text me-1"></i>{today.notes}</small>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <i className="bi bi-clock fs-1"></i>
                                    <p className="mt-2">You haven't checked in yet today.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                    <h6 className="fw-bold mb-3">Recent Attendance History</h6>
                    <AttendanceTable records={history} />
                </div>
            </div>
        </div>
    );
}
