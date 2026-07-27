import logoLight from '../assets/magunas-logo-light.jpg'
import logoDark from '../assets/magunas-logo-dark.jpg'

// Uses the real logo files instead of a recreated wordmark.
//
// Why two images instead of one: the JPGs have their background baked in
// (no transparency), so a single image only looks seamless sitting on the
// exact background it was made for. Conveniently, magunas-logo-light.jpg's
// background is almost an exact match for --color-brand-cream, and
// magunas-logo-dark.jpg's black background is an almost exact match for
// --color-brand-black - so swapping which one shows based on theme means
// the logo blends into the page in both modes instead of showing a visible box.
//
// Trade-off: these are two different lockups (a wordmark-on-black vs a
// leaf-shaped badge), not just recolors of the same mark, so the shape
// itself changes between light and dark mode. If you'd rather keep one
// consistent shape everywhere, say so and I'll switch this to always use
// one file inside a small rounded "badge" instead.

const sizes = {
  sm: 'w-24',
  md: 'w-40',
  lg: 'w-64',
}

const Logo = ({ size = 'md', className = '' }) => {
  const width = sizes[size]

  return (
    <div className={`inline-block ${width} ${className}`}>
      <img
        src={logoLight}
        alt="Magunas - Sherehekea Bei Ya Mwananchi"
        className="w-full h-auto rounded-2xl block dark:hidden"
      />
      <img
        src={logoDark}
        alt="Magunas - Sherehekea Bei Ya Mwananchi"
        className="w-full h-auto rounded-2xl hidden dark:block"
      />
    </div>
  )
}

export default Logo
