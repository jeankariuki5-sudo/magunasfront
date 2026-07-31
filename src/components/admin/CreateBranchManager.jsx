import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

const CreateBranchManagerPage = () => {
    const [form, setForm] = useState({
        username: '', email: '', phone_number: '', password: '',
        first_name: '', last_name: '', national_id: '', branch_id: '',
    })
    const [branches, setBranches] = useState([])
    const [pictureFile, setPictureFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(null)
    const [assignError, setAssignError] = useState('')

    useEffect(() => {
        // Populates the optional branch dropdown. ListBranches only returns
        // active branches - inactive ones won't show up here.
        const fetchBranches = async () => {
            try {
                const res = await api.get('branches/branch_list/')
                setBranches(res.data)
            } catch {
                // Non-fatal - the dropdown just stays empty if this fails
            }
        }
        fetchBranches()
    }, [])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setAssignError('')
        setSuccess(null)
        setLoading(true)

        try {
            const { branch_id, ...rest } = form
            const payload = new FormData()
            Object.entries(rest).forEach(([key, value]) => payload.append(key, value))
            if (pictureFile) payload.append('profile_picture', pictureFile)

            const res = await api.post('accounts/auth/create_branch_manager/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setSuccess(res.data)

            // Assignment is optional - only attempted if a branch was picked.
            if (branch_id) {
                try {
                    await api.post(`branches/assign_manager/${branch_id}/`, { manager_id: res.data.user.id })
                } catch (assignErr) {
                    setAssignError(
                        assignErr.response?.data?.error ||
                        'Account created, but assigning the branch failed. Assign it manually from Branch Managers.'
                    )
                }
            }

            setForm({ username: '', email: '', phone_number: '', password: '', first_name: '', last_name: '', national_id: '', branch_id: '' })
            setPictureFile(null)
        } catch (err) {
            // Covers missing fields (400), and duplicate username/email/phone/national_id (400)
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="Create Branch Manager">
            <div className="max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="card">
                    {error && <div className="alert-error mb-3">{error}</div>}
                    {assignError && <div className="alert-warning mb-3">{assignError}</div>}
                    {success && (
                        <div className="alert-success mb-3 text-left">
                            {success.message} — <strong>{success.user.username}</strong> can now log in with the password you set.
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            type="text" name="first_name" placeholder="First name" required
                            className="input-field"
                            value={form.first_name} onChange={handleChange}
                        />
                        <input
                            type="text" name="last_name" placeholder="Last name" required
                            className="input-field"
                            value={form.last_name} onChange={handleChange}
                        />
                    </div>

                    <input
                        type="text" name="username" placeholder="Username" required
                        className="input-field mb-3"
                        value={form.username} onChange={handleChange}
                    />

                    <input
                        type="email" name="email" placeholder="Email" required
                        className="input-field mb-3"
                        value={form.email} onChange={handleChange}
                    />

                    <input
                        type="tel" name="phone_number" placeholder="Phone number" required
                        className="input-field mb-3"
                        value={form.phone_number} onChange={handleChange}
                    />

                    <input
                        type="text" name="national_id" placeholder="National ID" required
                        className="input-field mb-3"
                        value={form.national_id} onChange={handleChange}
                    />

                    <input
                        type="password" name="password" placeholder="Temporary password" required
                        className="input-field mb-3"
                        value={form.password} onChange={handleChange}
                    />

                    <label className="block text-sm text-muted mb-4">
                        Profile picture (optional)
                        <input
                            type="file" accept="image/*"
                            onChange={(e) => setPictureFile(e.target.files[0])}
                            className="block mt-1 text-sm"
                        />
                    </label>

                    <label className="block text-sm text-brand-black/60 dark:text-white/60 mb-1">
                        Assign to branch (optional - can also be done later from Branch Managers)
                    </label>
                    <select
                        name="branch_id" value={form.branch_id} onChange={handleChange}
                        className="input-field mb-4"
                    >
                        <option value="" className="text-black">No branch yet</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id} className="text-black">{b.branch_name}</option>
                        ))}
                    </select>

                    <button
                        type="submit" disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Creating...' : 'Create Branch Manager'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    )
}

export default CreateBranchManagerPage
