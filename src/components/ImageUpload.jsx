import { useEffect, useRef, useState } from 'react'

// existingUrl: an already-saved image URL (e.g. editing a product/category
//              that already has one) - shown by default until replaced.
// onChange: (file | null) => void - fires with the raw File on selection, or
//           null if the person cancels their pending selection.
// icon: bootstrap-icons class shown as the placeholder when there's no image.
const ImageUpload = ({ existingUrl, onChange, label = 'Image', icon = 'bi-image', shape = 'rect' }) => {
    const fileInputRef = useRef(null)
    const [previewUrl, setPreviewUrl] = useState(existingUrl || null)

    // If the thing being edited changes (e.g. switching which row is being
    // edited) without this component unmounting, sync the preview back to
    // that item's own saved image instead of showing a stale one.
    useEffect(() => {
        setPreviewUrl(existingUrl || null)
    }, [existingUrl])

    // Build/clean up a local object URL whenever a new file is picked, so the
    // preview shows the actual selected image rather than a generic icon.
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setPreviewUrl(URL.createObjectURL(file))
        onChange(file)
    }

    const handleRemove = () => {
        setPreviewUrl(existingUrl || null)
        onChange(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const frameClass = shape === 'square' ? 'w-24 h-24 rounded-lg' : 'w-full h-32 rounded-lg'

    return (
        <div>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`group relative ${frameClass} overflow-hidden border-2 border-dashed border-brand-black/20 dark:border-white/20 hover:border-brand-green transition block`}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-black/5 dark:bg-white/5 text-faint">
                        <i className={`bi ${icon} text-2xl`} />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                    <i className="bi bi-camera-fill text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
            </button>

            <div className="flex gap-3 text-xs mt-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="link-accent">
                    {previewUrl ? 'Change image' : 'Upload image'}
                </button>
                {previewUrl && previewUrl.startsWith('blob:') && (
                    <button type="button" onClick={handleRemove} className="link-muted">
                        Cancel
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    )
}

export default ImageUpload
