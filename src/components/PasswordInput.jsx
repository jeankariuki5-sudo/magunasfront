import { useState } from 'react'

// Drop-in replacement for <input type="password">. Every prop you'd normally
// give a plain input (name, placeholder, value, onChange, required...) just
// passes straight through via {...props}.
const PasswordInput = ({ className = 'input-field', ...props }) => {
    const [visible, setVisible] = useState(false)

    return (
        <div className="relative">
            <input
                type={visible ? 'text' : 'password'}
                className={`${className} pr-10`}
                {...props}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                // tabIndex={-1} keeps Tab-key navigation moving between actual
                // form fields instead of stopping on this toggle button.
                tabIndex={-1}
                aria-label={visible ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-black/40 dark:text-white/40 hover:text-brand-black dark:hover:text-white transition"
            >
                <i className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
        </div>
    )
}

export default PasswordInput
