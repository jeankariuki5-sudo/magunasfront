const StatCard = ({ label, value, accent = false }) => {
    return (
        <div className="bg-white dark:bg-white/5 dark:border dark:border-white/10 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-black/50 dark:text-white/50 mb-1">
                {label}
            </p>
            <p className={`text-2xl font-display font-bold ${accent ? 'text-brand-green-deep dark:text-brand-green' : 'text-brand-black dark:text-white'}`}>
                {value}
            </p>
        </div>
    )
}

export default StatCard
