import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

const MyBranchProducts = () => {
    const [items, setItems] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [lowStockOnly, setLowStockOnly] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showAddForm, setShowAddForm] = useState(false)
    const [newItem, setNewItem] = useState({ product: '', price: '', stock_quantity: '' })

    const [editingId, setEditingId] = useState(null)
    const [editItem, setEditItem] = useState({ price: '', stock_quantity: '', is_available: true })

    const fetchItems = async () => {
        setLoading(true)
        try {
            const params = {}
            if (categoryFilter) params.category = categoryFilter
            if (search) params.search = search
            if (lowStockOnly) params.low_stock = 'true'
            const res = await api.get('products/my_branch_products/', { params })
            setItems(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load your branch products')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        api.get('products/list_categories/').then((res) => setCategories(res.data)).catch(() => {})
        api.get('products/list_products/').then((res) => setAllProducts(res.data)).catch(() => {})
    }, [])

    useEffect(() => { fetchItems() }, [search, categoryFilter, lowStockOnly])

    const handleAdd = async (e) => {
        e.preventDefault()
        setError('')
        try {
            // No branch field - AddBranchProduct infers request.user.managed_branch
            // automatically since role is branch_manager.
            await api.post('products/add_branch_product/', newItem)
            setNewItem({ product: '', price: '', stock_quantity: '' })
            setShowAddForm(false)
            fetchItems()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add product')
        }
    }

    const startEdit = (item) => {
        setEditingId(item.id)
        setEditItem({ price: item.price, stock_quantity: item.stock_quantity, is_available: item.is_available })
    }

    const saveEdit = async (id) => {
        try {
            await api.put(`products/update_branch_product/${id}/`, editItem)
            setEditingId(null)
            fetchItems()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update product')
        }
    }

    const handleDelete = async (item) => {
        if (!window.confirm(`Remove "${item.product_name}" from your branch?`)) return
        try {
            await api.delete(`products/delete_branch_product/${item.id}/`)
            fetchItems()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to remove product')
        }
    }

    return (
        <DashboardLayout title="My Branch Products">
            <div className="max-w-3xl mx-auto">
                <div className="flex gap-3 mb-4 flex-wrap items-center">
                    <input
                        type="text" placeholder="Search..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="input-field-sm flex-1 min-w-[160px] px-4 py-2"
                    />
                    <select
                        value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                        className="input-field-sm px-3 py-2"
                    >
                        <option value="" className="text-black">All categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id} className="text-black">{c.category_name}</option>
                        ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-muted whitespace-nowrap">
                        <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
                        Low stock only
                    </label>
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-text-action whitespace-nowrap">
                        {showAddForm ? 'Cancel' : '+ Add Product'}
                    </button>
                </div>

                {error && <div className="alert-error mb-4">{error}</div>}

                {showAddForm && (
                    <form onSubmit={handleAdd} className="card mb-4 flex gap-2 flex-wrap items-end">
                        <select
                            required value={newItem.product}
                            onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
                            className="input-field-sm flex-1 min-w-[160px]"
                        >
                            <option value="" className="text-black">Select product</option>
                            {allProducts.map((p) => (
                                <option key={p.id} value={p.id} className="text-black">{p.product_name}</option>
                            ))}
                        </select>
                        <input
                            type="number" placeholder="Price" required step="0.01"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            className="input-field-sm w-24"
                        />
                        <input
                            type="number" placeholder="Stock" required
                            value={newItem.stock_quantity}
                            onChange={(e) => setNewItem({ ...newItem, stock_quantity: e.target.value })}
                            className="input-field-sm w-24"
                        />
                        <button type="submit" className="btn-text-action whitespace-nowrap">Add</button>
                    </form>
                )}

                {loading ? (
                    <p className="text-sm text-muted">Loading...</p>
                ) : items.length === 0 ? (
                    <p className="text-sm text-brand-black/50 dark:text-white/50">No products in your branch yet.</p>
                ) : (
                    <div className="card-table">
                        <table className="w-full text-sm text-left">
                            <thead className="table-head">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3">Stock</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="table-row">
                                        <td className="px-4 py-3 text-brand-black dark:text-white">{item.product_name}</td>
                                        {editingId === item.id ? (
                                            <>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number" step="0.01" value={editItem.price}
                                                        onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                                                        className="input-field-sm w-20"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number" value={editItem.stock_quantity}
                                                        onChange={(e) => setEditItem({ ...editItem, stock_quantity: e.target.value })}
                                                        className="input-field-sm w-20"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <label className="flex items-center gap-1 text-xs">
                                                        <input
                                                            type="checkbox" checked={editItem.is_available}
                                                            onChange={(e) => setEditItem({ ...editItem, is_available: e.target.checked })}
                                                        />
                                                        Available
                                                    </label>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-3">
                                                        <button onClick={() => saveEdit(item.id)} className="btn-text-action">Save</button>
                                                        <button onClick={() => setEditingId(null)} className="link-muted text-xs">Cancel</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-3 text-brand-black dark:text-white">KES {item.price}</td>
                                                <td className={`px-4 py-3 ${item.stock_quantity < 10 ? 'text-red-500 font-semibold' : 'text-brand-black/70 dark:text-white/70'}`}>
                                                    {item.stock_quantity}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={item.is_available ? 'badge-active' : 'badge-inactive'}>
                                                        {item.is_available ? 'Available' : 'Hidden'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-3">
                                                        <button onClick={() => startEdit(item)} className="btn-text-action">Edit</button>
                                                        <button onClick={() => handleDelete(item)} className="btn-text-danger">Remove</button>
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

export default MyBranchProducts
