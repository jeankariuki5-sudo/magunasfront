import { useContext, useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from './api/api'
import DashboardLayout from './DashboardLayout'
import { AuthContext } from './context/AuthContext'
import { CartContext } from './context/CartContext'

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const branchId = searchParams.get('branch')
    const isAutoPicked = searchParams.get('auto') === '1'
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)
    const { cart, addToCart } = useContext(CartContext)

    const [branches, setBranches] = useState([])
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [search, setSearch] = useState('')
    // Lazy-initialized once from the URL so a category picked on the landing
    // page carousel survives the branch auto-detect redirect (which replaces
    // the URL's other params) - local state isn't touched by that swap.
    const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') || '')
    const [inStockOnly, setInStockOnly] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [addingId, setAddingId] = useState(null)
    const [addedId, setAddedId] = useState(null)

    // Detecting location + resolving the nearest branch, tried once per visit.
    // Runs only when arriving with no ?branch= at all - once the customer has
    // picked one (auto or manual), "Change branch" clears the param but we
    // don't silently override that choice again with a fresh auto-pick.
    const [autoDetecting, setAutoDetecting] = useState(!branchId)
    const autoAttempted = useRef(false)

    useEffect(() => {
        if (branchId) return
        // Guards against firing a second geolocation request - notably the
        // one React 18 StrictMode triggers in dev (effect -> fake cleanup ->
        // effect again, on the same mount). Deliberately NOT setting
        // autoDetecting here: doing so flashed the manual branch list for a
        // frame before the first request's callback redirected us away.
        // The original in-flight request is left to decide the outcome.
        if (autoAttempted.current) return
        autoAttempted.current = true

        if (!navigator.geolocation) {
            setAutoDetecting(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                api.get('branches/nearest/', { params: { lat: latitude, lng: longitude } })
                    .then((res) => {
                        setSearchParams({ branch: res.data.nearest_branch.id, auto: '1' })
                    })
                    .catch(() => setAutoDetecting(false))
            },
            () => setAutoDetecting(false), // permission denied - fall back to manual list
            { timeout: 8000 }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        )
    }, [branchId])

    // Always loaded (not just for the manual picker) so the branch name
    // resolves for display even when a branch was auto-selected via
    // geolocation rather than clicked from this list.
    useEffect(() => {
        api.get('branches/branch_list/').then((res) => setBranches(res.data)).catch(() => {})
    }, [])

    useEffect(() => {
        if (!branchId) return
        api.get('products/list_categories/').then((res) => setCategories(res.data)).catch(() => {})
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

    const handleAddToCart = async (product) => {
        if (!user) {
            navigate('/login')
            return
        }
        setError('')
        setAddingId(product.id)
        const result = await addToCart(product.id, 1)
        setAddingId(null)
        if (result.ok) {
            setAddedId(product.id)
            setTimeout(() => setAddedId(null), 1500)
        } else {
            setError(result.error)
        }
    }

    return (
        <DashboardLayout title="Shop">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm font-semibold text-brand-black/70 dark:text-white/70 hover:text-brand-black dark:hover:text-white flex items-center gap-1"
                >
                    <i className="bi bi-arrow-left" /> Back
                </button>
                {user?.role === 'customer' && (
                    <button onClick={() => navigate('/cart')} className="relative text-brand-black dark:text-white">
                        <i className="bi bi-cart3 text-xl" />
                        {cart.item_count > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-green text-brand-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {cart.item_count}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {!branchId ? (
                autoDetecting ? (
                    <div className="text-center py-16">
                        <i className="bi bi-geo-alt text-3xl text-brand-green-deep dark:text-brand-green mb-3 block" />
                        <p className="text-muted">Finding a branch near you...</p>
                    </div>
                ) : (
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
                )
            ) : (
                <>
                    <div className="flex justify-between items-center mb-1">
                        <h1 className="page-title text-xl">{selectedBranchName || 'Shop'}</h1>
                        <button onClick={() => setSearchParams({})} className="text-xs link-muted">Change branch</button>
                    </div>
                    {isAutoPicked && (
                        <p className="text-xs text-faint mb-2">
                            <i className="bi bi-geo-alt" /> Picked based on your location
                        </p>
                    )}

                    <div className="flex gap-3 mb-6 mt-3 flex-wrap items-center">
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
                                    {p.on_promotion ? (
                                        <p className="text-sm font-semibold mb-3">
                                            <span className="line-through text-faint mr-1">KES {p.original_price}</span>
                                            <span className="link-accent">KES {p.price}</span>
                                        </p>
                                    ) : (
                                        <p className="text-sm font-semibold link-accent mb-3">KES {p.price}</p>
                                    )}
                                    {p.on_promotion && <span className="badge-active mb-2 inline-block">On promo</span>}
                                    {!p.in_stock && <span className="badge-inactive mb-2 inline-block">Out of stock</span>}
                                    <button
                                        onClick={() => handleAddToCart(p)}
                                        disabled={!p.in_stock || addingId === p.id}
                                        className="btn-primary w-full text-xs"
                                    >
                                        {addedId === p.id ? 'Added ✓' : addingId === p.id ? 'Adding...' : 'Add to Cart'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </DashboardLayout>
    )
}

export default Shop