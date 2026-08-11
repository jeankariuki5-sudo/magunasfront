// Shared color/theme helpers for recharts, so every chart in the app
// (admin + branch manager analytics) looks consistent and respects dark mode.
export const CHART_COLORS = {
    green: '#96C83A',
    greenDeep: '#6E9A2C',
    yellow: '#FFCA06',
    black: '#0A0A0A',
    red: '#ef4444',
}

export const getChartTheme = (theme) => {
    const isDark = theme === 'dark'
    return {
        axisColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(10,10,10,0.5)',
        gridColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,10,0.08)',
        tooltipStyle: {
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,10,0.1)'}`,
            borderRadius: 8,
            fontSize: 13,
        },
        labelStyle: { color: isDark ? '#ffffff' : '#0A0A0A', fontWeight: 600 },
        itemStyle: { color: isDark ? '#ffffff' : '#0A0A0A' },
    }
}
