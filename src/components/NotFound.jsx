import React from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'

const NotFound = () => {

    const navigate = useNavigate()

    return (
        <div className='min-h-screen bg-brand-cream dark:bg-brand-black flex items-center justify-center p-6 transition-colors'>
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <Logo size="sm" />
                </div>

                <h1 className="text-9xl font-display font-extrabold text-brand-green leading-none">404</h1>
                <div className="w-16 h-1 bg-brand-yellow mx-auto my-4 rounded-full"></div>
                <h2 className="text-2xl font-display font-bold text-brand-black dark:text-white mb-2">Page not Found</h2>
                <p className="text-brand-black/60 dark:text-white/60 mb-8">The page you are looking for doesn't exist or has been moved</p>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className='px-5 py-3 rounded-lg border border-brand-black/15 dark:border-white/20 text-brand-black dark:text-white hover:bg-brand-black/5 dark:hover:bg-white/5 transition text-sm'>
                        Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className='px-5 py-3 rounded-lg bg-brand-green text-brand-black font-semibold hover:bg-brand-green-deep hover:text-white transition text-sm'>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotFound
