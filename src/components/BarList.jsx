// Simple CSS-based horizontal bar list — avoids pulling in a charting
// dependency for what is essentially a ranked list with a visual weight.
const BarList = ({ items, labelKey = 'label', valueKey = 'value', formatValue = (v) => v, emptyText = 'No data yet.' }) => {
    if (!items || items.length === 0) {
        return <p className="text-sm text-brand-black/50 dark:text-white/50">{emptyText}</p>
    }

    const max = Math.max(...items.map((i) => Number(i[valueKey]) || 0), 1)

    return (
        <div className="space-y-3">
            {items.map((item, i) => {
                const value = Number(item[valueKey]) || 0
                const pct = Math.max((value / max) * 100, 2)
                return (
                    <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-brand-black dark:text-white font-medium truncate pr-2">{item[labelKey]}</span>
                            <span className="text-brand-black/70 dark:text-white/70 whitespace-nowrap">{formatValue(value)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-brand-black/5 dark:bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-brand-green" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default BarList
