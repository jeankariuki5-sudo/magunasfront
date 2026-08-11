import { useContext, useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'
import StatCard from '../StatCard'
import { ThemeContext } from '../context/ThemeContext'
import { CHART_COLORS, getChartTheme } from '../context/chartTheme'

const BranchAnalytics = () => {
    const { theme } = useContext(ThemeContext)
    const chart = getChartTheme(theme)

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [revenue, setRevenue] = useState(null)
    const [topProducts, setTopProducts] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const dateParams = () => {
        const params = {}
        if (startDate) params.start_date = startDate
        if (endDate) params.end_date = endDate
        return params
    }

    const fetchAll = async () => {
        setLoading(true)
        setError('')
        try {
            const [revRes, topRes] = await Promise.all([
                api.get('analytics/branch/revenue/', { params: dateParams() }),
                api.get('analytics/branch/products/top/', { params: { ...dateParams(), limit: 8 } }),
            ])
            setRevenue(revRes.data)
            setTopProducts(
                topRes.data.top_products.map((p) => ({ ...p, total_revenue: Number(p.total_revenue) }))
            )
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [])

    const productBars = topProducts || []
    const revenueBreakdown = revenue ? [
        { label: 'Today', value: Number(revenue.revenue.today) },
        { label: 'This Week', value: Number(revenue.revenue.this_week) },
        { label: 'This Month', value: Number(revenue.revenue.this_month) },
        { label: 'Total (range)', value: Number(revenue.revenue.total) },
    ] : []

    return (
        <DashboardLayout title="Analytics">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap items-end gap-3 mb-6">
                    <div>
                        <label className="text-xs text-muted block mb-1">From</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field-sm px-3 py-1.5" />
                    </div>
                    <div>
                        <label className="text-xs text-muted block mb-1">To</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field-sm px-3 py-1.5" />
                    </div>
                    <button onClick={fetchAll} className="btn-primary text-xs px-4 py-2">Apply</button>
                </div>

                {error && <div className="alert-error mb-4">{error}</div>}

                {loading ? (
                    <p className="text-sm text-muted">Loading analytics...</p>
                ) : (
                    <>
                        <h2 className="section-title">{revenue?.branch} Revenue</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <StatCard label="Today" value={`KES ${revenue?.revenue.today}`} />
                            <StatCard label="This Week" value={`KES ${revenue?.revenue.this_week}`} />
                            <StatCard label="This Month" value={`KES ${revenue?.revenue.this_month}`} />
                            <StatCard label="Total (range)" value={`KES ${revenue?.revenue.total}`} accent />
                        </div>

                        <div className="card mb-8">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={revenueBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={chart.gridColor} vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: chart.axisColor, fontSize: 12 }} axisLine={{ stroke: chart.gridColor }} tickLine={false} />
                                    <YAxis tick={{ fill: chart.axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={chart.tooltipStyle} labelStyle={chart.labelStyle} itemStyle={chart.itemStyle}
                                        formatter={(v) => [`KES ${Number(v).toFixed(2)}`, 'Revenue']}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {revenueBreakdown.map((_, i) => (
                                            <Cell key={i} fill={i === 3 ? CHART_COLORS.greenDeep : CHART_COLORS.green} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <h2 className="section-title">Orders</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <StatCard label="Total" value={revenue?.orders.total} />
                            <StatCard label="Pending" value={revenue?.orders.pending} />
                            <StatCard label="Delivered" value={revenue?.orders.completed} accent />
                            <StatCard label="Cancelled" value={revenue?.orders.cancelled} />
                        </div>

                        <h2 className="section-title">Top Selling Products</h2>
                        <div className="card">
                            {productBars.length === 0 ? (
                                <p className="text-sm text-brand-black/50 dark:text-white/50">No delivered orders in this range yet.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={Math.max(productBars.length * 42, 200)}>
                                    <BarChart data={productBars} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chart.gridColor} horizontal={false} />
                                        <XAxis type="number" tick={{ fill: chart.axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis
                                            type="category" dataKey="product_name" width={130}
                                            tick={{ fill: chart.axisColor, fontSize: 12 }} axisLine={false} tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={chart.tooltipStyle} labelStyle={chart.labelStyle} itemStyle={chart.itemStyle}
                                            formatter={(v, name) => name === 'total_quantity_sold' ? [`${v} units`, 'Sold'] : [`KES ${v}`, 'Revenue']}
                                        />
                                        <Bar dataKey="total_quantity_sold" fill={CHART_COLORS.yellow} radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}

export default BranchAnalytics