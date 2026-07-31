import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'
import LocationPicker from '../LocationPicker'

const CreateBranch = () => {
    const [form, setForm] = useState({
        branch_name: '', phone_number: '', manager_id: '',
    })
    const [location, setLocation] = useState(null)
    const [availableManagers, setAvailableManagers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(null)

    useEffect(() => {
        api.get('branches/list_managers/', { params: { assigned: 'false' } })
            .then((res) => setAvailableManagers(res.data))
            .catch(() => {})
    }, [])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess(null)

        if (!location) {
            setError('Pick the branch location on the map before submitting.')
            return
        }
        setLoading(true)

        const { manager_id, ...rest } = form
        const payload = {
            ...rest,
            address: location.address,
            latitude: location.lat,
            longitude: location.lng,
        }
        if (manager_id) payload.manager_id = manager_id

        try {
            const res = await api.post('branches/create_branch/', payload)
            setSuccess(res.data)
            setForm({ branch_name: '', phone_number: '', manager_id: '' })
            setLocation(null)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="Create Branch">
            <div className="max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="card">
                    {error && <div className="alert-error mb-3">{error}</div>}
                    {success && (
                        <div className="alert-success mb-3 text-left">
                            {success.message} — <strong>{success.branch.branch_name}</strong> is now live.
                        </div>
                    )}

                    <input
                        type="text" name="branch_name" placeholder="Branch name" required
                        className="input-field mb-3"
                        value={form.branch_name} onChange={handleChange}
                    />

                    <input
                        type="tel" name="phone_number" placeholder="Phone number"
                        className="input-field mb-3"
                        value={form.phone_number} onChange={handleChange}
                    />

                    <label className="block text-sm text-muted mb-1">
                        Branch location
                    </label>
                    <div className="mb-4">
                        <LocationPicker value={location} onChange={setLocation} />
                    </div>

                    <label className="block text-sm text-muted mb-1">
                        Assign a manager (optional - only unassigned managers shown)
                    </label>
                    <select
                        name="manager_id" value={form.manager_id} onChange={handleChange}
                        className="select-field mb-4"
                    >
                        <option value="" className="text-black">No manager yet</option>
                        {availableManagers.map((m) => (
                            <option key={m.id} value={m.id} className="text-black">{m.username}</option>
                        ))}
                    </select>

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Creating...' : 'Create Branch'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    )
}

export default CreateBranch
