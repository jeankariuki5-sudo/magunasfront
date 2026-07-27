import { useContext } from 'react'
import { ThemeContext } from './ThemeContext'

const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(ThemeContext)

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle light/dark mode"
            className="w-10 h-10 rounded-full flex items-center justify-center border border-brand-black/10 dark:border-white/10 bg-brand-cream dark:bg-black text-brand-black dark:text-brand-yellow hover:scale-105 transition"
        >
            {theme === 'dark' ? (
                <i className="bi bi-sun-fill text-lg" />
            ) : (
                <i className="bi bi-moon-stars-fill text-lg" />
            )}
        </button>
    )
}

export default ThemeToggle
