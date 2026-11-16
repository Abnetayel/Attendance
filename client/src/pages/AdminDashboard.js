import { useCallback, useEffect, useState } from 'react';
import AttendanceTable from '../components/AttendanceTable';
import api from '../services/api';

const DEPARTMENTS = ['', 'Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'General'];

export default function AdminDashboard() {
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState({ date: '', startDate: '', endDate: '', department: '' });
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
            if (filters.department) params.append('department', filters.department);

            const { data } = await api.get(`/attendance/admin/all?${params}`);
            setRecords(data.records);
            setTotalPages(data.pages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);
    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const handleFilterChange = (field) => (e) => {
        setFilters({ ...filters, [field]: e.target.value });
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ date: '', startDate: '', endDate: '', department: '' });
        setPage(1);
    };

    return (
        <div>
            <div className="mb-4">
                <h4 className="fw-bold mb-0">Attendance Overview</h4>
                <p className="text-muted">Monitor team attendance in real time</p>
            </div>

            {/* Today's summary */}
            {summary && (
                <div className="row g-3 mb-4">
                    {[
                        { label: "Present Today", value: summary.present, color: '#198754', icon: 'bi-person-check' },
                        { label: "Late Today", value: summary.late, color: '#ffc107', icon: 'bi-clock-history' },
                        { label: "Half-Day", value: summary.halfDay, color: '#0dcaf0', icon: 'bi-hourglass-split' },
                        { label: "Total Checked In", value: summary.total, color: '#0d6efd', icon: 'bi-people' },
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

            {/* Filters */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                    <h6 className="fw-bold mb-3">Filters</h6>
                    <div className="row g-3 align-items-end">
                        <div className="col-md-2">
                            <label className="form-label small">Specific Date</label>
                            <input type="date" className="form-control" value={filters.date}
                                onChange={handleFilterChange('date')} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small">Start Date</label>
                            <input type="date" className="form-control" value={filters.startDate}
                                onChange={handleFilterChange('startDate')} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small">End Date</label>
                            <input type="date" className="form-control" value={filters.endDate}
                                onChange={handleFilterChange('endDate')} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small">Department</label>
                            <select className="form-select" value={filters.department}
                                onChange={handleFilterChange('department')}>
                                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d || 'All Departments'}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                                <i className="bi bi-x-circle me-1"></i> Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Records Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">All Attendance Records</h6>
                        {loading && <div className="spinner-border spinner-border-sm text-primary" />}
                    </div>

                    <AttendanceTable records={records} showEmployee showRecordedBy />

                    {/* Pagination */}
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
