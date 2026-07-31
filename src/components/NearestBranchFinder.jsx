import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from './api/api'
import Logo from './Logo'

const NearestBranchFinder = () => {
    const [lat, setLat] = useState('')
    const [lng, setLng] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState(null)
    const [locating, setLocating] = useState(false)

    const search = async (latitude, longitude) => {
        setError('')
        setLoading(true)
        try {
            const res = await api.get('branches/nearest/', { params: { lat: latitude, lng: longitude } })
            setResult(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Your browser doesn\'t support geolocation - enter your coordinates manually below.')
            return
        }
        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setLat(String(latitude))
                setLng(String(longitude))
                setLocating(false)
                search(latitude, longitude)
            },
            () => {
                setLocating(false)
                setError('Location access denied - enter your coordinates manually below.')
            }
        )
    }

    const handleManualSubmit = (e) => {
        e.preventDefault()
        if (!lat || !lng) return
        search(lat, lng)
    }

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
            <header className="flex items-center justify-between px-6 md:px-12 py-6">
                <Logo size="sm" />
                <Link to="/" className="text-sm font-semibold link-accent">Back home</Link>
            </header>

            <main className="max-w-xl mx-auto px-6 pb-16">
                <h1 className="page-title text-2xl mb-2">Find your nearest Magunas</h1>
                <p className="text-muted mb-6">Share your location, or enter coordinates manually.</p>

                <button onClick={useMyLocation} disabled={locating} className="btn-primary mb-4">
                    {locating ? 'Locating...' : 'Use My Location'}
                </button>

                <form onSubmit={handleManualSubmit} className="flex gap-2 mb-6">
                    <input
                        type="text" placeholder="Latitude" value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="input-field-sm w-full px-4 py-3"
                    />
                    <input
                        type="text" placeholder="Longitude" value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="input-field-sm w-full px-4 py-3"
                    />
                    <button type="submit" className="btn-outline whitespace-nowrap px-5">Search</button>
                </form>

                {error && <div className="alert-error mb-4">{error}</div>}
                {loading && <p className="text-sm text-muted">Searching...</p>}

                {result && (
                    <div className="space-y-3">
                        <div className="card border-2 border-brand-green">
                            <span className="badge-active mb-2 inline-block">Nearest</span>
                            <p className="page-title">{result.nearest_branch.branch_name}</p>
                            <p className="text-sm text-muted">{result.nearest_branch.address}</p>
                            <p className="text-sm text-muted">{result.nearest_branch.phone_number}</p>
                            <p className="text-sm font-semibold link-accent mt-1">
                                {result.nearest_branch.distance_km} km away
                            </p>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${result.nearest_branch.latitude},${result.nearest_branch.longitude}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-xs link-muted"
                            >
                                View on map ↗
                            </a>
                        </div>

                        {result.all_branches.length > 1 && (
                            <>
                                <h2 className="section-title mt-6">Other branches</h2>
                                {result.all_branches.slice(1).map((b) => (
                                    <div key={b.id} className="card">
                                        <p className="font-semibold text-brand-black dark:text-white">{b.branch_name}</p>
                                        <p className="text-sm text-muted">{b.address}</p>
                                        <p className="text-xs text-faint mt-1">{b.distance_km} km away</p>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}

export default NearestBranchFinder
