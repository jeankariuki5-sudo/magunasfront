import { useEffect, useRef, useState } from 'react'

// existingUrl: an already-saved photo URL (e.g. editing a profile that has one)
// onChange: (file | null) => void - fires with the raw File on selection, or
//           null if the person removes their pending selection
const PhotoUpload = ({ existingUrl, onChange, label = 'Photo' }) => {
    const fileInputRef = useRef(null)
    const [previewUrl, setPreviewUrl] = useState(existingUrl || null)

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

    return (
        <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-brand-black/20 dark:border-white/20 hover:border-brand-green transition shrink-0"
            >
                {previewUrl ? (
                    <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-black/5 dark:bg-white/5 text-faint">
                        <i className="bi bi-person text-2xl" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                    <i className="bi bi-camera-fill text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
            </button>

            <div>
                <p className="text-sm font-medium text-brand-black dark:text-white mb-1">{label}</p>
                <div className="flex gap-3 text-xs">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="link-accent">
                        {previewUrl ? 'Change' : 'Upload'}
                    </button>
                    {previewUrl && previewUrl.startsWith('blob:') && (
                        <button type="button" onClick={handleRemove} className="link-muted">
                            Cancel
                        </button>
                    )}
                </div>
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

export default PhotoUpload
