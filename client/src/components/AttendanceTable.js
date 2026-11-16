import StatusBadge from './StatusBadge';

const fmt = (ts) => ts ? new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

export default function AttendanceTable({ records, showEmployee = false, showRecordedBy = false }) {
    if (!records?.length) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="bi bi-calendar-x fs-1"></i>
                <p className="mt-2">No attendance records found.</p>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <thead className="table-dark">
                    <tr>
                        <th>Date</th>
                        {showEmployee && <th>Employee</th>}
                        {showEmployee && <th>Department</th>}
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Total Hours</th>
                        <th>Status</th>
                        {showRecordedBy && <th>Recorded By</th>}
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((r) => (
                        <tr key={r._id}>
                            <td className="fw-semibold">{r.date}</td>
                            {showEmployee && <td>{r.userId?.name || '—'}</td>}
                            {showEmployee && <td><span className="badge bg-secondary">{r.userId?.department}</span></td>}
                            <td>{fmt(r.checkInTime)}</td>
                            <td>{fmt(r.checkOutTime)}</td>
                            <td>
                                {r.totalHours > 0
                                    ? <span className="fw-semibold">{r.totalHours}h</span>
                                    : '—'}
                            </td>
                            <td><StatusBadge status={r.status} /></td>
                            {showRecordedBy && <td className="text-muted small">{r.recordedBy?.name || '—'}</td>}
                            <td className="text-muted small">{r.notes || '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
