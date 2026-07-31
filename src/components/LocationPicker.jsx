import { useEffect, useRef, useState } from 'react'

// Loads the Google Maps JS API script once, no matter how many LocationPicker
// instances exist on the page.
let mapsScriptPromise = null
function loadGoogleMaps() {
    if (window.google?.maps) return Promise.resolve()
    if (mapsScriptPromise) return mapsScriptPromise

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    mapsScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.onload = resolve
        script.onerror = () => reject(new Error('Failed to load Google Maps'))
        document.head.appendChild(script)
    })
    return mapsScriptPromise
}

// value: { address, lat, lng } | null - pass the existing saved location (if any)
//        to center the map and drop a pin there when editing.
// onChange: ({ address, lat, lng }) => void - fires on search selection, pin drag, or map click.
const LocationPicker = ({ value, onChange, height = '280px' }) => {
    const mapRef = useRef(null)
    const searchContainerRef = useRef(null)
    const mapInstance = useRef(null)
    const markerInstance = useRef(null)
    const geocoderRef = useRef(null)

    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState('')
    const [currentAddress, setCurrentAddress] = useState(value?.address || '')

    useEffect(() => {
        if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
            setError('Google Maps API key is not set (VITE_GOOGLE_MAPS_API_KEY missing from .env)')
            return
        }

        let cancelled = false
        loadGoogleMaps()
            .then(() => {
                if (cancelled) return
                try {
                    initMap()
                    setLoaded(true)
                } catch (initErr) {
                    console.error('LocationPicker initMap failed:', initErr)
                    setError(`Map loaded but failed to initialize: ${initErr.message}`)
                }
            })
            .catch(() => setError('Could not load the Google Maps script. Check your API key, billing status, and network.'))

        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const initMap = () => {
        const { google } = window
        const start = value?.lat && value?.lng
            ? { lat: parseFloat(value.lat), lng: parseFloat(value.lng) }
            : { lat: -1.2921, lng: 36.8219 } // Nairobi, as a sane default center

        const map = new google.maps.Map(mapRef.current, {
            center: start,
            zoom: value?.lat ? 15 : 12,
            streetViewControl: false,
            mapTypeControl: false,
        })
        mapInstance.current = map
        geocoderRef.current = new google.maps.Geocoder()

        // Using the classic Marker rather than AdvancedMarkerElement - the
        // latter silently fails to render without a mapId configured in Cloud
        // Console, and there's no custom styling need here that would justify
        // that extra setup step.
        const marker = new google.maps.Marker({ map, position: start, draggable: true })
        markerInstance.current = marker

        google.maps.event.addListener(marker, 'dragend', () => {
            const pos = marker.getPosition()
            reverseGeocode(pos.lat(), pos.lng())
        })

        map.addListener('click', (e) => {
            const lat = e.latLng.lat()
            const lng = e.latLng.lng()
            placeMarker(lat, lng)
            reverseGeocode(lat, lng)
        })

        // Places Autocomplete search box.
        // google.maps.places.Autocomplete (legacy) is hard-blocked for any
        // Google Cloud project created after March 1, 2025 - not just
        // deprecated, actually non-functional - so this uses its replacement,
        // PlaceAutocompleteElement. Unlike the old widget, this is a real
        // custom HTML element (<gmp-place-autocomplete>) that gets mounted
        // into the page rather than attached to a plain <input>.
        if (searchContainerRef.current && !searchContainerRef.current.hasChildNodes()) {
            const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
                locationBias: start,
            })
            placeAutocomplete.setAttribute('placeholder', 'Search for an address...')
            placeAutocomplete.classList.add('w-full')
            searchContainerRef.current.appendChild(placeAutocomplete)

            placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
                const place = placePrediction.toPlace()
                await place.fetchFields({ fields: ['formattedAddress', 'location'] })
                const lat = place.location.lat()
                const lng = place.location.lng()
                map.setCenter({ lat, lng })
                map.setZoom(16)
                placeMarker(lat, lng)
                setCurrentAddress(place.formattedAddress)
                onChange({ address: place.formattedAddress, lat, lng })
            })
        }
    }

    const placeMarker = (lat, lng) => {
        markerInstance.current.setPosition({ lat, lng })
    }

    const reverseGeocode = (lat, lng) => {
        geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
            // ZERO_RESULTS happens for real - genuinely unaddressed locations
            // (rural plots, private compounds with no formal street address).
            // Rather than leaving the address silently blank, fall back to a
            // readable placeholder built from the coordinates themselves.
            const address = status === 'OK' && results[0]
                ? results[0].formatted_address
                : `Pinned location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
            setCurrentAddress(address)
            onChange({ address, lat, lng })
        })
    }

    // Manual fallback fields - used when the map can't load (missing key,
    // network issue, etc). Kept in sync with `value` so switching between
    // map mode and manual mode later doesn't lose anything already entered.
    const [manualAddress, setManualAddress] = useState(value?.address || '')
    const [manualLat, setManualLat] = useState(value?.lat || '')
    const [manualLng, setManualLng] = useState(value?.lng || '')

    const emitManualChange = (address, lat, lng) => {
        onChange({ address, lat: lat || null, lng: lng || null })
    }

    if (error) {
        return (
            <div>
                <div className="alert-warning mb-3">{error}</div>
                <p className="text-xs text-faint mb-2">
                    Enter the address and coordinates manually instead (e.g. from Google Maps: right-click a point → the lat/lng shows at the top of the menu).
                </p>
                <input
                    type="text"
                    placeholder="Address"
                    value={manualAddress}
                    onChange={(e) => {
                        setManualAddress(e.target.value)
                        emitManualChange(e.target.value, manualLat, manualLng)
                    }}
                    className="input-field mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="text"
                        placeholder="Latitude (e.g. -1.2921)"
                        value={manualLat}
                        onChange={(e) => {
                            setManualLat(e.target.value)
                            emitManualChange(manualAddress, e.target.value, manualLng)
                        }}
                        className="input-field"
                    />
                    <input
                        type="text"
                        placeholder="Longitude (e.g. 36.8219)"
                        value={manualLng}
                        onChange={(e) => {
                            setManualLng(e.target.value)
                            emitManualChange(manualAddress, manualLat, e.target.value)
                        }}
                        className="input-field"
                    />
                </div>
            </div>
        )
    }

    return (
        <div>
            <div ref={searchContainerRef} className="mb-2" />
            <div
                ref={mapRef}
                style={{ height, width: '100%' }}
                className="rounded-lg overflow-hidden border border-brand-black/15 dark:border-white/15"
            />
            {!loaded && <p className="text-xs text-faint mt-1">Loading map...</p>}
            {currentAddress && (
                <p className="text-sm text-brand-black dark:text-white mt-2">{currentAddress}</p>
            )}
            <p className="text-xs text-faint mt-1">
                Search above, or click/drag the pin directly on the map.
            </p>
        </div>
    )
}

export default LocationPicker