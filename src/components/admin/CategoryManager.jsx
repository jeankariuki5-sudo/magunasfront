import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'

const CategoryManager = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showAddForm, setShowAddForm] = useState(false)
    const [newName, setNewName] = useState('')
    const [newImage, setNewImage] = useState(null)

    const [editingId, setEditingId] = useState(null)
    const [editName, setEditName] = useState('')
    const [editImage, setEditImage] = useState(null)

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const res = await api.get('products/list_categories/')
            setCategories(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCategories() }, [])

    const handleAdd = async (e) => {
        e.preventDefault()
        setError('')
        const payload = new FormData()
        payload.append('category_name', newName)
        if (newImage) payload.append('image', newImage)

        try {
            await api.post('products/create_category/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setNewName('')
            setNewImage(null)
            setShowAddForm(false)
            fetchCategories()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create category')
        }
    }

    const startEdit = (c) => {
        setEditingId(c.id)
        setEditName(c.category_name)
        setEditImage(null)
    }

    const saveEdit = async (id) => {
        const payload = new FormData()
        payload.append('category_name', editName)
        if (editImage) payload.append('image', editImage)

        try {
            await api.put(`products/update_category/${id}/`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setEditingId(null)
            fetchCategories()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update category')
        }
    }

    const handleDelete = async (c) => {
        if (!window.confirm(`Delete category "${c.category_name}"? Categories with existing products can't be deleted.`)) return
        try {
            await api.delete(`products/delete_category/${c.id}/`)
            fetchCategories()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete category')
        }
    }

    return (
        <DashboardLayout title="Categories">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted">{categories.length} categories</p>
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-text-action">
                        {showAddForm ? 'Cancel' : '+ Add Category'}
                    </button>
                </div>

                {error && <div className="alert-error mb-4">{error}</div>}

                {showAddForm && (
                    <form onSubmit={handleAdd} className="card mb-4">
                        <input
                            type="text" placeholder="Category name" required
                            value={newName} onChange={(e) => setNewName(e.target.value)}
                            className="input-field mb-3"
                        />
                        <input
                            type="file" accept="image/*"
                            onChange={(e) => setNewImage(e.target.files[0])}
                            className="block text-sm mb-3"
                        />
                        <button type="submit" className="btn-primary">Create Category</button>
                    </form>
                )}

                {loading ? (
                    <p className="text-sm text-muted">Loading categories...</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {categories.map((c) => (
                            <div key={c.id} className="card">
                                {editingId === c.id ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text" value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="input-field-sm w-full"
                                        />
                                        <input
                                            type="file" accept="image/*"
                                            onChange={(e) => setEditImage(e.target.files[0])}
                                            className="block text-sm"
                                        />
                                        <div className="flex gap-3">
                                            <button onClick={() => saveEdit(c.id)} className="btn-text-action">Save</button>
                                            <button onClick={() => setEditingId(null)} className="link-muted text-sm">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {c.image ? (
                                            <img src={c.image} alt={c.category_name} className="w-full h-24 object-cover rounded-lg mb-3" />
                                        ) : (
                                            <div className="w-full h-24 rounded-lg bg-brand-black/5 dark:bg-white/5 flex items-center justify-center text-faint mb-3">
                                                <i className="bi bi-image text-2xl" />
                                            </div>
                                        )}
                                        <p className="font-semibold text-brand-black dark:text-white mb-2">{c.category_name}</p>
                                        <div className="flex gap-4">
                                            <button onClick={() => startEdit(c)} className="btn-text-action">Edit</button>
                                            <button onClick={() => handleDelete(c)} className="btn-text-danger">Delete</button>
                                        </div>
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

export default CategoryManager
