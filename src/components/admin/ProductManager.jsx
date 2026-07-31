import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

const emptyForm = { product_name: '', description: '', category: '' }

const ProductManager = () => {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showAddForm, setShowAddForm] = useState(false)
    const [newProduct, setNewProduct] = useState(emptyForm)
    const [newImage, setNewImage] = useState(null)

    const [editingId, setEditingId] = useState(null)
    const [editProduct, setEditProduct] = useState(emptyForm)
    const [editImage, setEditImage] = useState(null)

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const params = {}
            if (categoryFilter) params.category = categoryFilter
            if (search) params.search = search
            const res = await api.get('products/list_products/', { params })
            setProducts(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        api.get('products/list_categories/').then((res) => setCategories(res.data)).catch(() => {})
    }, [])

    useEffect(() => { fetchProducts() }, [search, categoryFilter])

    const handleAdd = async (e) => {
        e.preventDefault()
        setError('')
        const payload = new FormData()
        Object.entries(newProduct).forEach(([k, v]) => payload.append(k, v))
        if (newImage) payload.append('image', newImage)

        try {
            await api.post('products/create_product/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setNewProduct(emptyForm)
            setNewImage(null)
            setShowAddForm(false)
            fetchProducts()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create product')
        }
    }

    const startEdit = (p) => {
        setEditingId(p.id)
        const cat = categories.find((c) => c.category_name === p.category)
        setEditProduct({ product_name: p.product_name, description: p.description, category: cat ? cat.id : '' })
        setEditImage(null)
    }

    const saveEdit = async (id) => {
        const payload = new FormData()
        Object.entries(editProduct).forEach(([k, v]) => payload.append(k, v))
        if (editImage) payload.append('image', editImage)

        try {
            await api.put(`products/update_product/${id}/`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setEditingId(null)
            fetchProducts()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update product')
        }
    }

    const handleDelete = async (p) => {
        if (!window.confirm(`Delete "${p.product_name}"? This removes it from every branch too.`)) return
        try {
            await api.delete(`products/delete_product/${p.id}/`)
            fetchProducts()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete product')
        }
    }

    return (
        <DashboardLayout title="Products">
            <div className="max-w-4xl mx-auto">
                <div className="flex gap-3 mb-4 flex-wrap items-center">
                    <input
                        type="text" placeholder="Search products..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="input-field-sm flex-1 min-w-[180px] px-4 py-2"
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
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-text-action whitespace-nowrap">
                        {showAddForm ? 'Cancel' : '+ Add Product'}
                    </button>
                </div>

                {error && <div className="alert-error mb-4">{error}</div>}

                {showAddForm && (
                    <form onSubmit={handleAdd} className="card mb-4">
                        <input
                            type="text" placeholder="Product name" required
                            value={newProduct.product_name}
                            onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                            className="input-field mb-3"
                        />
                        <select
                            required value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            className="select-field mb-3"
                        >
                            <option value="" className="text-black">Select category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id} className="text-black">{c.category_name}</option>
                            ))}
                        </select>
                        <textarea
                            placeholder="Description" rows={3}
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            className="input-field mb-3 resize-none"
                        />
                        <input
                            type="file" accept="image/*"
                            onChange={(e) => setNewImage(e.target.files[0])}
                            className="block text-sm mb-3"
                        />
                        <button type="submit" className="btn-primary">Create Product</button>
                    </form>
                )}

                {loading ? (
                    <p className="text-sm text-muted">Loading products...</p>
                ) : products.length === 0 ? (
                    <p className="text-sm text-brand-black/50 dark:text-white/50">No products found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((p) => (
                            <div key={p.id} className="card">
                                {editingId === p.id ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text" value={editProduct.product_name}
                                            onChange={(e) => setEditProduct({ ...editProduct, product_name: e.target.value })}
                                            className="input-field-sm w-full"
                                        />
                                        <select
                                            value={editProduct.category}
                                            onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                                            className="input-field-sm w-full"
                                        >
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id} className="text-black">{c.category_name}</option>
                                            ))}
                                        </select>
                                        <textarea
                                            rows={2} value={editProduct.description}
                                            onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                                            className="input-field-sm w-full resize-none"
                                        />
                                        <input
                                            type="file" accept="image/*"
                                            onChange={(e) => setEditImage(e.target.files[0])}
                                            className="block text-sm"
                                        />
                                        <div className="flex gap-3">
                                            <button onClick={() => saveEdit(p.id)} className="btn-text-action">Save</button>
                                            <button onClick={() => setEditingId(null)} className="link-muted text-sm">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-4">
                                        {p.image ? (
                                            <img src={p.image} alt={p.product_name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-brand-black/5 dark:bg-white/5 flex items-center justify-center text-faint shrink-0">
                                                <i className="bi bi-box-seam text-xl" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-brand-black dark:text-white">{p.product_name}</p>
                                            <p className="text-xs text-faint mb-1">{p.category}</p>
                                            <p className="text-xs text-muted mb-2 line-clamp-2">{p.description}</p>
                                            <div className="flex gap-4">
                                                <button onClick={() => startEdit(p)} className="btn-text-action">Edit</button>
                                                <button onClick={() => handleDelete(p)} className="btn-text-danger">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default ProductManager
