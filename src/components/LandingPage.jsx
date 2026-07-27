import { Link } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './context/ThemeToggle'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-black transition-colors">
      <header className="flex items-center justify-between px-6 md:px-12 py-6">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-brand-black dark:text-white hover:text-brand-green-deep dark:hover:text-brand-green transition"
          >
            Sign in
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-col items-center text-center px-6 pt-16 pb-24">
        <Logo size="lg" />

        <p className="mt-8 max-w-xl text-lg text-brand-black/70 dark:text-white/70 font-body">
          Fresh groceries, everyday essentials, and unbeatable prices —
          delivered from your nearest Magunas branch.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            to="/shop"
            className="px-8 py-3 rounded-full bg-brand-green text-brand-black font-display font-semibold hover:bg-brand-green-deep hover:text-white transition"
          >
            Start Shopping
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-full border-2 border-brand-black/15 dark:border-white/20 text-brand-black dark:text-white font-display font-semibold hover:border-brand-green transition"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  )
}

export default LandingPage
