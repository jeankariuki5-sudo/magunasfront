import { useEffect, useState } from 'react'
import api from './api/api'
import LocationPicker from './LocationPicker'

// mode is derived from whether a branchId was passed in:
// - admin usage:          <DeliveryZoneManager branchId={5} branchName="Kilimani" />
// - branch manager usage:  <DeliveryZoneManager />   (endpoints figure out "my branch" server-side)
const DeliveryZoneManager = ({ branchId, branchName }) => {
    const isAdminMode = branchId != null

    const [zones, setZones] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showAddForm, setShowAddForm] = useState(false)
    const [newZone, setNewZone] = useState({ zone_name: '', delivery_fee: '' })
    const [newZoneLocation, setNewZoneLocation] = useState(null)

    const [editingId, setEditingId] = useState(null)
    const [editZone, setEditZone] = useState({ zone_name: '', delivery_fee: '', is_active: true })
    const [editZoneLocation, setEditZoneLocation] = useState(null)

    const fetchZones = async () => {
        setLoading(true)
        try {
            const res = isAdminMode
                ? await api.get(`branches/delivery_zones/${branchId}/`)
                : await api.get('branches/delivery_zones/my_branch/')
            setZones(res.data.delivery_zones)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load delivery zones')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchZones() }, [branchId])

    const handleAdd = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const payload = isAdminMode ? { ...newZone, branch_id: branchId } : { ...newZone }
            if (newZoneLocation) {
                payload.latitude = newZoneLocation.lat
                payload.longitude = newZoneLocation.lng
            }
            await api.post('branches/delivery_zones/create/', payload)
            setNewZone({ zone_name: '', delivery_fee: '' })
            setNewZoneLocation(null)
            setShowAddForm(false)
            fetchZones()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create zone')
        }
    }

    const startEdit = (z) => {
        setEditingId(z.id)
        setEditZone({ zone_name: z.zone_name, delivery_fee: z.delivery_fee, is_active: z.is_active })
        setEditZoneLocation(z.latitude ? { address: z.zone_name, lat: z.latitude, lng: z.longitude } : null)
    }

    const saveEdit = async (zoneId) => {
        try {
            const payload = { ...editZone }
            if (editZoneLocation) {
                payload.latitude = editZoneLocation.lat
                payload.longitude = editZoneLocation.lng
            }
            await api.put(`branches/delivery_zones/update/${zoneId}/`, payload)
            setEditingId(null)
            fetchZones()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update zone')
        }
    }

    const handleDelete = async (zone) => {
        if (!window.confirm(`Delete delivery zone "${zone.zone_name}"?`)) return
        try {
            await api.delete(`branches/delivery_zones/delete/${zone.id}/`)
            fetchZones()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete zone')
        }
    }

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-3">
                <h3 className="section-title mb-0">
                    Delivery Zones{branchName ? ` — ${branchName}` : ''}
                </h3>
                <button onClick={() => setShowAddForm(!showAddForm)} className="btn-text-action">
                    {showAddForm ? 'Cancel' : '+ Add Zone'}
                </button>
            </div>

            {error && <div className="alert-error mb-3">{error}</div>}

            {showAddForm && (
                <form onSubmit={handleAdd} className="space-y-2 mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text" placeholder="Zone name" required
                            value={newZone.zone_name}
                            onChange={(e) => setNewZone({ ...newZone, zone_name: e.target.value })}
                            className="input-field-sm flex-1"
                        />
                        <input
                            type="number" placeholder="Fee (KES)" required step="0.01"
                            value={newZone.delivery_fee}
                            onChange={(e) => setNewZone({ ...newZone, delivery_fee: e.target.value })}
                            className="input-field-sm w-28"
                        />
                    </div>
                    <label className="block text-xs text-faint">
                        Zone center point (optional - helps with future distance-based delivery logic)
                    </label>
                    <LocationPicker value={newZoneLocation} onChange={setNewZoneLocation} height="200px" />
                    <button type="submit" className="btn-text-action">Save Zone</button>
                </form>
            )}

            {loading ? (
                <p className="text-sm text-muted">Loading zones...</p>
            ) : zones.length === 0 ? (
                <p className="text-sm text-brand-black/50 dark:text-white/50">No delivery zones yet.</p>
            ) : (
                <div className="space-y-2">
                    {zones.map((z) => (
                        <div key={z.id} className="py-2 border-t border-brand-black/5 dark:border-white/5">
                            {editingId === z.id ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text" value={editZone.zone_name}
                                            onChange={(e) => setEditZone({ ...editZone, zone_name: e.target.value })}
                                            className="input-field-sm flex-1"
                                        />
                                        <input
                                            type="number" step="0.01" value={editZone.delivery_fee}
                                            onChange={(e) => setEditZone({ ...editZone, delivery_fee: e.target.value })}
                                            className="input-field-sm w-24"
                                        />
                                        <label className="flex items-center gap-1 text-xs text-muted whitespace-nowrap">
                                            <input
                                                type="checkbox" checked={editZone.is_active}
                                                onChange={(e) => setEditZone({ ...editZone, is_active: e.target.checked })}
                                            />
                                            Active
                                        </label>
                                    </div>
                                    <label className="block text-xs text-faint">Zone center point (optional)</label>
                                    <LocationPicker value={editZoneLocation} onChange={setEditZoneLocation} height="200px" />
                                    <div className="flex gap-3">
                                        <button onClick={() => saveEdit(z.id)} className="btn-text-action">Save</button>
                                        <button onClick={() => setEditingId(null)} className="link-muted text-xs">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium text-brand-black dark:text-white">{z.zone_name}</span>
                                        <span className="text-xs text-muted ml-2">KES {z.delivery_fee}</span>
                                        {!z.is_active && <span className="badge-inactive ml-2">Inactive</span>}
                                        {z.latitude && <span className="text-xs text-faint ml-2"><i className="bi bi-geo-alt" /></span>}
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => startEdit(z)} className="btn-text-action">Edit</button>
                                        <button onClick={() => handleDelete(z)} className="btn-text-danger">Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DeliveryZoneManager
