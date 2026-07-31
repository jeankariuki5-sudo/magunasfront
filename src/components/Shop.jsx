import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from './api/api'
import Logo from './Logo'
import ThemeToggle from './context/ThemeToggle'

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const branchId = searchParams.get('branch')

    const [branches, setBranches] = useState([])
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [inStockOnly, setInStockOnly] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!branchId) {
            api.get('branches/branch_list/').then((res) => setBranches(res.data)).catch(() => {})
        } else {
            api.get('products/list_categories/').then((res) => setCategories(res.data)).catch(() => {})
        }
    }, [branchId])

    useEffect(() => {
        if (!branchId) return
        setLoading(true)
        setError('')
        const params = {}
        if (categoryFilter) params.category = categoryFilter
        if (search) params.search = search
        if (inStockOnly) params.in_stock = 'true'

        api.get(`products/list_branch_products/${branchId}/`, { params })
            .then((res) => setProducts(res.data))
            .catch((err) => setError(err.response?.data?.error || 'Failed to load products'))
            .finally(() => setLoading(false))
    }, [branchId, search, categoryFilter, inStockOnly])

    const selectedBranchName = branches.find((b) => String(b.id) === branchId)?.branch_name

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
            <header className="flex items-center justify-between px-6 md:px-12 py-6">
                <Logo size="sm" />
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-sm font-semibold link-accent">Home</Link>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 pb-16">
                {!branchId ? (
                    <>
                        <h1 className="page-title text-2xl mb-2">Choose your branch</h1>
                        <p className="text-muted mb-6">Prices and stock vary by branch.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {branches.map((b) => (
                                <button
                                    key={b.id}
                                    onClick={() => setSearchParams({ branch: b.id })}
                                    className="card text-left hover:border-brand-green border border-transparent transition"
                                >
                                    <p className="font-semibold text-brand-black dark:text-white">{b.branch_name}</p>
                                    <p className="text-sm text-muted">{b.address}</p>
                                </button>
                            ))}
                        </div>
                        {branches.length === 0 && <p className="text-sm text-muted">Loading branches...</p>}
                    </>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <h1 className="page-title text-xl">{selectedBranchName || 'Shop'}</h1>
                            <button onClick={() => setSearchParams({})} className="text-xs link-muted">Change branch</button>
                        </div>

                        <div className="flex gap-3 mb-6 flex-wrap items-center">
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
                            <label className="flex items-center gap-2 text-sm text-muted whitespace-nowrap">
                                <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                                In stock only
                            </label>
                        </div>

                        {error && <div className="alert-error mb-4">{error}</div>}

                        {loading ? (
                            <p className="text-sm text-muted">Loading products...</p>
                        ) : products.length === 0 ? (
                            <p className="text-sm text-brand-black/50 dark:text-white/50">No products found.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {products.map((p) => (
                                    <div key={p.id} className="card">
                                        {p.image ? (
                                            <img src={p.image} alt={p.product_name} className="w-full h-28 object-cover rounded-lg mb-3" />
                                        ) : (
                                            <div className="w-full h-28 rounded-lg bg-brand-black/5 dark:bg-white/5 flex items-center justify-center text-faint mb-3">
                                                <i className="bi bi-box-seam text-2xl" />
                                            </div>
                                        )}
                                        <p className="text-sm font-semibold text-brand-black dark:text-white mb-1">{p.product_name}</p>
                                        <p className="text-xs text-faint mb-2">{p.category}</p>
                                        <p className="text-sm font-semibold link-accent mb-3">KES {p.price}</p>
                                        {!p.in_stock && <span className="badge-inactive mb-2 inline-block">Out of stock</span>}
                                        <button
                                            disabled
                                            title="Checkout isn't built yet"
                                            className="btn-primary w-full text-xs opacity-50 cursor-not-allowed"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

export default Shop
