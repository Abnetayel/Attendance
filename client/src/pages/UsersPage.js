import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'General'];
const EMPTY_NEW = { name: '', email: '', role: 'Employee', department: 'General' };

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newUser, setNewUser] = useState(EMPTY_NEW);
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data.users);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/users', newUser);
            toast.success(`Employee added. Default password: ${data.defaultPassword}`);
            setShowAdd(false);
            setNewUser(EMPTY_NEW);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add employee.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/users/${editUser._id}`, {
                name: editUser.name,
                department: editUser.department,
                role: editUser.role,
                isActive: editUser.isActive,
            });
            toast.success('User updated.');
            setEditUser(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    const setEdit = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setEditUser({ ...editUser, [field]: value });
    };

    const setNew = (field) => (e) => setNewUser({ ...newUser, [field]: e.target.value });

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-0">Employees</h4>
                    <p className="text-muted">Manage user accounts and roles</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    <i className="bi bi-person-plus me-2"></i>Add Employee
                </button>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td className="fw-semibold">{u.name}</td>
                                        <td className="text-muted small">{u.email}</td>
                                        <td>
                                            <span className={`badge ${u.role === 'Admin' ? 'bg-danger' : u.role === 'Manager' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>{u.department}</td>
                                        <td>
                                            <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => setEditUser({ ...u })}>
                                                <i className="bi bi-pencil"></i> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Employee Modal */}
            {showAdd && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0" style={{ borderRadius: 16 }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Add Employee</h5>
                                <button className="btn-close" onClick={() => { setShowAdd(false); setNewUser(EMPTY_NEW); }} />
                            </div>
                            <form onSubmit={handleAdd}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label">Full Name</label>
                                            <input type="text" className="form-control" value={newUser.name}
                                                onChange={setNew('name')} required />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" value={newUser.email}
                                                onChange={setNew('email')} required />
                                        </div>
                                        <div className="col-12">
                                            <p className="text-muted small mb-0">
                                                <i className="bi bi-info-circle me-1"></i>
                                                The employee is assigned the default password and can log in immediately.
                                            </p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Role</label>
                                            <select className="form-select" value={newUser.role} onChange={setNew('role')}>
                                                <option>Employee</option>
                                                <option>Manager</option>
                                                <option>AttendanceManager</option>
                                                <option>Admin</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Department</label>
                                            <select className="form-select" value={newUser.department} onChange={setNew('department')}>
                                                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-outline-secondary"
                                        onClick={() => { setShowAdd(false); setNewUser(EMPTY_NEW); }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                                        Add Employee
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editUser && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0" style={{ borderRadius: 16 }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Edit User</h5>
                                <button className="btn-close" onClick={() => setEditUser(null)} />
                            </div>
                            <form onSubmit={handleUpdate}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label">Full Name</label>
                                            <input type="text" className="form-control" value={editUser.name} onChange={setEdit('name')} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Role</label>
                                            <select className="form-select" value={editUser.role} onChange={setEdit('role')}>
                                                <option>Employee</option>
                                                <option>Manager</option>
                                                <option>AttendanceManager</option>
                                                <option>Admin</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Department</label>
                                            <select className="form-select" value={editUser.department} onChange={setEdit('department')}>
                                                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" id="isActive"
                                                    checked={editUser.isActive} onChange={setEdit('isActive')} />
                                                <label className="form-check-label" htmlFor="isActive">Active Account</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setEditUser(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
