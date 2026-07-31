import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'
import DeliveryZoneManager from '../DeliveryZoneManager'
import LocationPicker from '../LocationPicker'

const emptyEdit = { branch_name: '', phone_number: '', is_active: true }

const BranchList = () => {
    const [branches, setBranches] = useState([])
    const [managers, setManagers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState(emptyEdit)
    const [editLocation, setEditLocation] = useState(null)
    const [assigningId, setAssigningId] = useState(null)
    const [managerToAssign, setManagerToAssign] = useState('')
    const [expandedZonesId, setExpandedZonesId] = useState(null)

    const fetchBranches = async () => {
        setLoading(true)
        try {
            // ?include_inactive=true only takes effect for authenticated admins -
            // customers/public callers still only ever see active branches.
            const res = await api.get('branches/branch_list/', { params: { include_inactive: 'true' } })
            setBranches(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load branches')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBranches()
        api.get('branches/list_managers/').then((res) => setManagers(res.data)).catch(() => {})
    }, [])

    const startEdit = (b) => {
        setEditingId(b.id)
        setAssigningId(null)
        setExpandedZonesId(null)
        setEditForm({
            branch_name: b.branch_name,
            phone_number: b.phone_number,
            is_active: b.is_active,
        })
        setEditLocation({ address: b.address, lat: b.latitude, lng: b.longitude })
    }

    const saveEdit = async (id) => {
        try {
            const payload = { ...editForm }
            if (editLocation) {
                payload.address = editLocation.address
                payload.latitude = editLocation.lat
                payload.longitude = editLocation.lng
            }
            await api.put(`branches/update_branch/${id}/`, payload)
            setEditingId(null)
            fetchBranches()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update branch')
        }
    }

    const startAssign = (b) => {
        setAssigningId(b.id)
        setEditingId(null)
        setExpandedZonesId(null)
        const current = managers.find((m) => m.username === b.branch_manager)
        setManagerToAssign(current ? String(current.id) : '')
    }

    const saveAssign = async (branchId) => {
        if (!managerToAssign) return
        try {
            await api.post(`branches/assign_manager/${branchId}/`, { manager_id: managerToAssign })
            setAssigningId(null)
            fetchBranches()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to assign manager')
        }
    }

    const handleDelete = async (b) => {
        if (!window.confirm(`Permanently delete "${b.branch_name}"? This cannot be undone.`)) return
        try {
            await api.delete(`branches/delete_branch/${b.id}/`)
            fetchBranches()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete branch')
        }
    }

    return (
        <DashboardLayout title="Branches">
            <div className="max-w-4xl mx-auto">
                {error && <div className="alert-error mb-4">{error}</div>}

                {loading ? (
                    <p className="text-sm text-muted">Loading branches...</p>
                ) : branches.length === 0 ? (
                    <p className="text-sm text-brand-black/50 dark:text-white/50">No branches found.</p>
                ) : (
                    <div className="space-y-4">
                        {branches.map((b) => (
                            <div key={b.id} className="card">
                                {editingId === b.id ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text" placeholder="Branch name" value={editForm.branch_name}
                                            onChange={(e) => setEditForm({ ...editForm, branch_name: e.target.value })}
                                            className="input-field-sm w-full"
                                        />
                                        <input
                                            type="tel" placeholder="Phone number" value={editForm.phone_number}
                                            onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                                            className="input-field-sm w-full"
                                        />

                                        <label className="block text-xs text-muted">Location</label>
                                        <LocationPicker value={editLocation} onChange={setEditLocation} height="220px" />

                                        <label className="flex items-center gap-2 text-sm text-muted">
                                            <input
                                                type="checkbox" checked={editForm.is_active}
                                                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                                            />
                                            Active (unchecking hides this branch from every list until reactivated by ID)
                                        </label>
                                        <div className="flex gap-3 pt-1">
                                            <button onClick={() => saveEdit(b.id)} className="btn-text-action">Save</button>
                                            <button onClick={() => setEditingId(null)} className="link-muted text-sm">Cancel</button>
                                        </div>
                                    </div>
                                ) : assigningId === b.id ? (
                                    <div>
                                        <p className="text-sm font-semibold text-brand-black dark:text-white mb-2">Assign manager</p>
                                        <select
                                            value={managerToAssign}
                                            onChange={(e) => setManagerToAssign(e.target.value)}
                                            className="select-field mb-3"
                                        >
                                            <option value="" className="text-black">Select a manager</option>
                                            {managers.map((m) => (
                                                <option key={m.id} value={m.id} className="text-black">
                                                    {m.username}{m.assigned ? ` (currently at ${m.branch})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex gap-3">
                                            <button onClick={() => saveAssign(b.id)} className="btn-text-action">Confirm</button>
                                            <button onClick={() => setAssigningId(null)} className="link-muted text-sm">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="page-title">{b.branch_name}</p>
                                                <p className="text-sm text-muted">{b.address}</p>
                                            </div>
                                            <span className={b.is_active ? 'badge-active' : 'badge-inactive'}>
                                                {b.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted mb-1">{b.phone_number}</p>
                                        <p className="text-xs text-faint mb-3">
                                            {b.latitude}, {b.longitude}
                                        </p>
                                        <p className="text-xs font-semibold mb-4">
                                            {b.branch_manager ? (
                                                <span className="link-accent"><i className="bi bi-person-badge" /> {b.branch_manager}</span>
                                            ) : (
                                                <span className="text-faint">No manager assigned</span>
                                            )}
                                        </p>
                                        <div className="flex gap-4 flex-wrap">
                                            <button onClick={() => startEdit(b)} className="btn-text-action">Edit</button>
                                            <button onClick={() => startAssign(b)} className="btn-text-muted">
                                                {b.branch_manager ? 'Reassign Manager' : 'Assign Manager'}
                                            </button>
                                            <button
                                                onClick={() => setExpandedZonesId(expandedZonesId === b.id ? null : b.id)}
                                                className="btn-text-muted"
                                            >
                                                {expandedZonesId === b.id ? 'Hide Delivery Zones' : 'Delivery Zones'}
                                            </button>
                                            <button onClick={() => handleDelete(b)} className="btn-text-danger">Delete</button>
                                        </div>

                                        {expandedZonesId === b.id && (
                                            <div className="mt-4">
                                                <DeliveryZoneManager branchId={b.id} branchName={b.branch_name} />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default BranchList
