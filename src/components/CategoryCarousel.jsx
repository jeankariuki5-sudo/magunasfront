import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from './api/api'

// Pulls categories straight from the API - add/remove/rename a category in
// admin and it shows up here on next load, nothing hardcoded.
//
// Continuous marquee, not a paginated scroller: the track is the category
// list rendered twice back-to-back, animated left forever via CSS transform.
// At the halfway point (-50%) the duplicated copy lines up pixel-for-pixel
// with where the original started, so the loop resets with no visible jump
// and never has to slide backwards.
const CategoryCarousel = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [paused, setPaused] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        api.get('products/list_categories/')
            .then((res) => setCategories(res.data))
            .catch(() => {}) // decorative section on a public page - fail quietly
            .finally(() => setLoading(false))
    }, [])

    if (loading || categories.length === 0) return null

    // Keep speed-per-card constant regardless of how many categories exist.
    const durationSeconds = categories.length * 3.5
    const track = [...categories, ...categories]

    return (
        <section className="pt-2 pb-12">
            <style>{`
                @keyframes category-marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>

            <div
                className="overflow-hidden"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onTouchStart={() => setPaused(true)}
                onTouchEnd={() => setPaused(false)}
            >
                <div
                    className="flex gap-5 w-max"
                    style={{
                        animation: `category-marquee ${durationSeconds}s linear infinite`,
                        animationPlayState: paused ? 'paused' : 'running',
                    }}
                >
                    {track.map((cat, i) => (
                        <button
                            key={`${cat.id}-${i}`}
                            onClick={() => navigate(`/shop?category=${cat.id}`)}
                            className="shrink-0 w-32 flex flex-col items-center gap-2 group"
                        >
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-white dark:bg-white/5 border border-brand-black/10 dark:border-white/10 flex items-center justify-center group-hover:border-brand-green transition">
                                {cat.image ? (
                                    <img
                                        src={cat.image}
                                        alt={cat.category_name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <i className="bi bi-basket2 text-2xl text-brand-black/30 dark:text-white/30" />
                                )}
                            </div>
                            <span className="text-sm font-medium text-brand-black/80 dark:text-white/80 text-center leading-tight group-hover:text-brand-green-deep dark:group-hover:text-brand-green transition line-clamp-2">
                                {cat.category_name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default CategoryCarousel