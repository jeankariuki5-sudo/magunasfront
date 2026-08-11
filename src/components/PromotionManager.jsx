import { useContext, useEffect, useState } from 'react'
import api from './api/api'
import DashboardLayout from './DashboardLayout'
import { AuthContext } from './context/AuthContext'

// Shared by both the admin and branch manager routes. The backend already
// scopes /loyalty/promotions/list/ to the caller's own branch when they're a
// branch manager (and lets admins see/filter across all branches), so the
// only real difference on this side is whether we show a branch picker.
const PromotionManager = () => {
    const { user } = useContext(AuthContext)
    const isAdmin = user?.role === 'admin'

    const [branches, setBranches] = useState([])
    const [formBranchId, setFormBranchId] = useState('')
    const [branchProducts, setBranchProducts] = useState([])

    const [promotions, setPromotions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showAddForm, setShowAddForm] = useState(false)
    const [newPromo, setNewPromo] = useState({
        branch_product_id: '', discounted_price: '', start_datetime: '', end_datetime: '',
    })

    const [editingId, setEditingId] = useState(null)
    const [editPromo, setEditPromo] = useState({
        discounted_price: '', start_datetime: '', end_datetime: '', is_active: true,
    })

    const fetchPromotions = async () => {
        setLoading(true)
        try {
            const res = await api.get('loyalty/promotions/list/')
            setPromotions(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load promotions')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchPromotions() }, [])

    // Admins pick a branch first; branch managers only ever see their own.
    useEffect(() => {
        if (isAdmin) {
            api.get('branches/branch_list/').then((res) => setBranches(res.data)).catch(() => {})
        } else {
            api.get('products/my_branch_products/')
                .then((res) => setBranchProducts(res.data.map((p) => ({
                    id: p.id, product_name: p.product_name, base_price: p.price,
                }))))
                .catch(() => setError('Failed to load your branch products'))
        }
    }, [isAdmin])

    // Admin: reload the branch_product options whenever the form's branch changes.
    useEffect(() => {
        if (!isAdmin || !formBranchId) {
            if (isAdmin) setBranchProducts([])
            return
        }
        api.get(`products/list_branch_products/${formBranchId}/`)
            .then((res) => setBranchProducts(res.data.map((p) => ({
                id: p.id, product_name: p.product_name, base_price: p.original_price,
            }))))
            .catch(() => setError('Failed to load products for that branch'))
    }, [isAdmin, formBranchId])

    const selectedNewProduct = branchProducts.find((p) => String(p.id) === String(newPromo.branch_product_id))

    const resetAddForm = () => {
        setNewPromo({ branch_product_id: '', discounted_price: '', start_datetime: '', end_datetime: '' })
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await api.post('loyalty/promotions/create/', {
                branch_product_id: newPromo.branch_product_id,
                discounted_price: newPromo.discounted_price,
                start_datetime: newPromo.start_datetime,
                end_datetime: newPromo.end_datetime,
            })
            resetAddForm()
            setShowAddForm(false)
            fetchPromotions()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create promotion')
        }
    }

    const startEdit = (promo) => {
        setEditingId(promo.id)
        setEditPromo({
            discounted_price: promo.discounted_price,
            start_datetime: '',
            end_datetime: '',
            is_active: promo.is_active,
        })
    }

    const saveEdit = async (id) => {
        setError('')
        try {
            const payload = {
                discounted_price: editPromo.discounted_price,
                is_active: editPromo.is_active,
            }
            // Only send datetimes if the user actually changed them - leave
            // the existing window alone otherwise.
            if (editPromo.start_datetime) payload.start_datetime = editPromo.start_datetime
            if (editPromo.end_datetime) payload.end_datetime = editPromo.end_datetime

            await api.put(`loyalty/promotions/update/${id}/`, payload)
            setEditingId(null)
            fetchPromotions()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update promotion')
        }
    }

    const handleDelete = async (promo) => {
        if (!window.confirm(`Delete the promotion on "${promo.product_name}"?`)) return
        try {
            await api.delete(`loyalty/promotions/delete/${promo.id}/`)
            fetchPromotions()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete promotion')
        }
    }

    return (
        <DashboardLayout title="Promotions">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-end mb-4">
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-text-action whitespace-nowrap">
                        {showAddForm ? 'Cancel' : '+ New Promotion'}
                    </button>
                </div>

                {error && <div className="alert-error mb-4">{error}</div>}

                {showAddForm && (
                    <form onSubmit={handleAdd} className="card mb-6 space-y-3">
                        {isAdmin && (
                            <select
                                required value={formBranchId}
                                onChange={(e) => { setFormBranchId(e.target.value); setNewPromo({ ...newPromo, branch_product_id: '' }) }}
                                className="select-field"
                            >
                                <option value="" className="text-black">Select a branch</option>
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id} className="text-black">{b.branch_name}</option>
                                ))}
                            </select>
                        )}

                        <select
                            required value={newPromo.branch_product_id}
                            onChange={(e) => setNewPromo({ ...newPromo, branch_product_id: e.target.value })}
                            className="select-field"
                            disabled={isAdmin && !formBranchId}
                        >
                            <option value="" className="text-black">Select product</option>
                            {branchProducts.map((p) => (
                                <option key={p.id} value={p.id} className="text-black">
                                    {p.product_name} — KES {p.base_price}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-3 flex-wrap">
                            <input
                                type="number" step="0.01" required placeholder="Discounted price"
                                value={newPromo.discounted_price}
                                onChange={(e) => setNewPromo({ ...newPromo, discounted_price: e.target.value })}
                                className="input-field-sm flex-1 min-w-[140px]"
                            />
                            {selectedNewProduct && (
                                <span className="text-xs text-faint self-center">
                                    must be less than KES {selectedNewProduct.base_price}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <div className="flex-1 min-w-[160px]">
                                <label className="text-xs text-muted block mb-1">Starts</label>
                                <input
                                    type="datetime-local" required
                                    value={newPromo.start_datetime}
                                    onChange={(e) => setNewPromo({ ...newPromo, start_datetime: e.target.value })}
                                    className="input-field-sm w-full"
                                />
                            </div>
                            <div className="flex-1 min-w-[160px]">
                                <label className="text-xs text-muted block mb-1">Ends</label>
                                <input
                                    type="datetime-local" required
                                    value={newPromo.end_datetime}
                                    onChange={(e) => setNewPromo({ ...newPromo, end_datetime: e.target.value })}
                                    className="input-field-sm w-full"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-text-action">Create Promotion</button>
                    </form>
                )}

                {loading ? (
                    <p className="text-sm text-muted">Loading promotions...</p>
                ) : promotions.length === 0 ? (
                    <p className="text-sm text-brand-black/50 dark:text-white/50">No promotions yet.</p>
                ) : (
                    <div className="card-table">
                        <table className="w-full text-sm text-left">
                            <thead className="table-head">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    {isAdmin && <th className="px-4 py-3">Branch</th>}
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3">Window</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {promotions.map((promo) => (
                                    <tr key={promo.id} className="table-row">
                                        <td className="px-4 py-3 text-brand-black dark:text-white">{promo.product_name}</td>
                                        {isAdmin && (
                                            <td className="px-4 py-3 text-brand-black/70 dark:text-white/70">{promo.branch}</td>
                                        )}
                                        {editingId === promo.id ? (
                                            <>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number" step="0.01" value={editPromo.discounted_price}
                                                        onChange={(e) => setEditPromo({ ...editPromo, discounted_price: e.target.value })}
                                                        className="input-field-sm w-24"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1">
                                                        <input
                                                            type="datetime-local" placeholder="Start"
                                                            value={editPromo.start_datetime}
                                                            onChange={(e) => setEditPromo({ ...editPromo, start_datetime: e.target.value })}
                                                            className="input-field-sm"
                                                        />
                                                        <input
                                                            type="datetime-local" placeholder="End"
                                                            value={editPromo.end_datetime}
                                                            onChange={(e) => setEditPromo({ ...editPromo, end_datetime: e.target.value })}
                                                            className="input-field-sm"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <label className="flex items-center gap-1 text-xs">
                                                        <input
                                                            type="checkbox" checked={editPromo.is_active}
                                                            onChange={(e) => setEditPromo({ ...editPromo, is_active: e.target.checked })}
                                                        />
                                                        Active
                                                    </label>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-3">
                                                        <button onClick={() => saveEdit(promo.id)} className="btn-text-action">Save</button>
                                                        <button onClick={() => setEditingId(null)} className="link-muted text-xs">Cancel</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-3 text-brand-black dark:text-white">
                                                    <span className="line-through text-faint mr-1">KES {promo.original_price}</span>
                                                    KES {promo.discounted_price}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-brand-black/60 dark:text-white/60">
                                                    {new Date(promo.start_datetime).toLocaleDateString()} — {new Date(promo.end_datetime).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={promo.is_currently_active ? 'badge-active' : 'badge-inactive'}>
                                                        {promo.is_currently_active ? 'Live' : promo.is_active ? 'Scheduled' : 'Off'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-3">
                                                        <button onClick={() => startEdit(promo)} className="btn-text-action">Edit</button>
                                                        <button onClick={() => handleDelete(promo)} className="btn-text-danger">Delete</button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default PromotionManager
