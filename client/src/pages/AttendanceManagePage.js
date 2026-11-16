import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AttendanceTable from '../components/AttendanceTable';
import api from '../services/api';

const fmtTime = (ts) =>
    ts ? new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

export default function AttendanceManagePage() {
    const [employees, setEmployees] = useState([]);
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState({ date: '', startDate: '', endDate: '' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // Recording form state — only the employee and optional notes.
    // Check-in/out times are captured automatically as the current time.
    const [employeeId, setEmployeeId] = useState('');
    const [notes, setNotes] = useState('');
    const [dayRecord, setDayRecord] = useState(null);
    const [dayLoading, setDayLoading] = useState(false);

    const fetchEmployees = useCallback(async () => {
        try {
            const { data } = await api.get('/users?role=Employee&isActive=true');
            setEmployees(data.users || []);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to load employees.');
        }
    }, []);

    const fetchSummary = useCallback(async () => {
        try {
            const { data } = await api.get('/attendance/admin/summary');
            setSummary(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 30 });
            if (filters.date) params.append('date', filters.date);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const { data } = await api.get(`/attendance/admin/all?${params}`);
            setRecords(data.records);
            setTotalPages(data.pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    // Fetch the selected employee's attendance record for today (the current working day).
    // This drives the Check-In / Check-Out button state so invalid actions are disabled,
    // not rejected with a popup.
    const fetchDayRecord = useCallback(async () => {
        if (!employeeId) { setDayRecord(null); return; }
        setDayLoading(true);
        try {
            const { data } = await api.get(`/attendance/record/${employeeId}`);
            setDayRecord(data.record);
        } catch (err) {
            console.error(err);
            setDayRecord(null);
        } finally {
            setDayLoading(false);
        }
    }, [employeeId]);

    useEffect(() => { fetchEmployees(); fetchSummary(); }, [fetchEmployees, fetchSummary]);
    useEffect(() => { fetchRecords(); }, [fetchRecords]);
    useEffect(() => { fetchDayRecord(); }, [fetchDayRecord]);

    const refreshAll = () => { fetchSummary(); fetchRecords(); };

    const handleCheckIn = async () => {
        if (!employeeId) return toast.error('Please select an employee.');
        setLoading(true);
        try {
            const { data } = await api.post('/attendance/record/check-in', {
                userId: employeeId,
                notes: notes || undefined,
            });
            const emp = employees.find((e) => e._id === employeeId);
            toast.success(`Check-in recorded for ${emp?.name || 'employee'} at ${fmtTime(data.attendance?.checkInTime)}.`);
            setNotes('');
            fetchDayRecord();
            refreshAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-in failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!employeeId) return toast.error('Please select an employee.');
        setLoading(true);
        try {
            const { data } = await api.post('/attendance/record/check-out', { userId: employeeId });
            const emp = employees.find((e) => e._id === employeeId);
            toast.success(`Check-out recorded for ${emp?.name || 'employee'} at ${fmtTime(data.attendance?.checkOutTime)}.`);
            fetchDayRecord();
            refreshAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-out failed.');
        } finally {
            setLoading(false);
        }
    };

    // Button state derives from today's record for the selected employee.
    const canCheckIn = !!employeeId && !dayRecord;
    const canCheckOut = !!employeeId && !!dayRecord && !dayRecord.checkOutTime;

    const handleFilterChange = (field) => (e) => {
        setFilters({ ...filters, [field]: e.target.value });
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ date: '', startDate: '', endDate: '' });
        setPage(1);
    };

    return (
        <div>
            <div className="mb-4">
                <h4 className="fw-bold mb-0">Attendance Management</h4>
                <p className="text-muted">Record and track attendance for all employees</p>
            </div>

            {/* Today's summary */}
            {summary && (
                <div className="row g-3 mb-4">
                    {[
                        { label: 'Present Today', value: summary.present, color: '#198754', icon: 'bi-person-check' },
                        { label: 'Late Today', value: summary.late, color: '#ffc107', icon: 'bi-clock-history' },
                        { label: 'Half-Day', value: summary.halfDay, color: '#0dcaf0', icon: 'bi-hourglass-split' },
                        { label: 'Total Checked In', value: summary.total, color: '#0d6efd', icon: 'bi-people' },
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
            )}

            {/* Record attendance card */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                    <h6 className="fw-bold mb-3"><i className="bi bi-pencil-square me-2"></i>Record Attendance</h6>
                    <p className="text-muted small mb-3">
                        Select an employee and record their check-in or check-out. The current time is captured automatically.
                    </p>

                    <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <label className="form-label small">Employee</label>
                            <select className="form-select" value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}>
                                <option value="">Select an employee…</option>
                                {employees.map((e) => (
                                    <option key={e._id} value={e._id}>
                                        {e.name} · {e.department}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small">Notes</label>
                            <input type="text" className="form-control" placeholder="Optional notes…"
                                value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                    </div>

                    {/* Today's status for the selected employee */}
                    {employeeId && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <small className="text-muted d-block mb-1">Today's status</small>
                            {dayLoading ? (
                                <span className="text-muted small">Loading…</span>
                            ) : dayRecord ? (
                                <div className="small d-flex flex-wrap gap-2 align-items-center">
                                    <span className="badge bg-success">
                                        <i className="bi bi-box-arrow-in-right me-1"></i>
                                        Checked in {fmtTime(dayRecord.checkInTime)}
                                    </span>
                                    {dayRecord.checkOutTime ? (
                                        <span className="badge bg-secondary">
                                            <i className="bi bi-box-arrow-right me-1"></i>
                                            Checked out {fmtTime(dayRecord.checkOutTime)}
                                        </span>
                                    ) : (
                                        <span className="badge bg-warning text-dark">Checked out — Pending</span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-muted small">Not checked in yet today.</span>
                            )}
                        </div>
                    )}

                    <div className="d-flex gap-3 mt-4">
                        <button className="btn btn-success px-4" onClick={handleCheckIn}
                            disabled={loading || !canCheckIn}
                            title={canCheckIn ? 'Record check-in at the current time' : 'Employee is already checked in today'}>
                            <i className="bi bi-box-arrow-in-right me-1"></i> Check In
                        </button>
                        <button className="btn btn-danger px-4" onClick={handleCheckOut}
                            disabled={loading || !canCheckOut}
                            title={canCheckOut ? 'Record check-out at the current time' : 'Employee has not checked in today (or is already checked out)'}>
                            <i className="bi bi-box-arrow-right me-1"></i> Check Out
                        </button>
                        {loading && <div className="spinner-border spinner-border-sm text-primary align-self-center" />}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                    <h6 className="fw-bold mb-3">Filters</h6>
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label small">Specific Date</label>
                            <input type="date" className="form-control" value={filters.date}
                                onChange={handleFilterChange('date')} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">Start Date</label>
                            <input type="date" className="form-control" value={filters.startDate}
                                onChange={handleFilterChange('startDate')} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">End Date</label>
                            <input type="date" className="form-control" value={filters.endDate}
                                onChange={handleFilterChange('endDate')} />
                        </div>
                        <div className="col-md-3">
                            <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                                <i className="bi bi-x-circle me-1"></i> Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Records table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">All Attendance Records</h6>
                        {loading && <div className="spinner-border spinner-border-sm text-primary" />}
                    </div>

                    <AttendanceTable records={records} showEmployee showRecordedBy />

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center gap-2 mt-3">
                            <button className="btn btn-outline-primary btn-sm"
                                disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                                <i className="bi bi-chevron-left"></i>
                            </button>
                            <span className="btn btn-sm disabled">Page {page} of {totalPages}</span>
                            <button className="btn btn-outline-primary btn-sm"
                                disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
