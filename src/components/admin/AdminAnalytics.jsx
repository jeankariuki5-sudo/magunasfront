import { useContext, useEffect, useState } from 'react'
import {
    BarChart, Bar, LineChart, Line, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'
import StatCard from '../StatCard'
import { ThemeContext } from '../context/ThemeContext'
import { CHART_COLORS, getChartTheme } from '../context/chartTheme'

const AdminAnalytics = () => {
    const { theme } = useContext(ThemeContext)
    const chart = getChartTheme(theme)

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [period, setPeriod] = useState('daily')

    const [revenue, setRevenue] = useState(null)
    const [topProducts, setTopProducts] = useState(null)
    const [ordersByDate, setOrdersByDate] = useState(null)
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
            const [revRes, topRes, byDateRes] = await Promise.all([
                api.get('analytics/revenue/branches/', { params: dateParams() }),
                api.get('analytics/products/top/', { params: { ...dateParams(), limit: 8 } }),
                api.get('analytics/orders/by_date/', { params: { ...dateParams(), period } }),
            ])
            setRevenue({
                ...revRes.data,
                branches: revRes.data.branches.map((b) => ({ ...b, total_revenue: Number(b.total_revenue) })),
            })
            setTopProducts(
                topRes.data.top_selling_products.map((p) => ({ ...p, total_revenue: Number(p.total_revenue) }))
            )
            setOrdersByDate(
                byDateRes.data.data.map((row) => ({ ...row, total_revenue: Number(row.total_revenue) }))
            )
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [period])

    const branchBars = revenue?.branches || []
    const productBars = topProducts || []
    const trend = ordersByDate || []

    return (
        <DashboardLayout title="Analytics">
            <div className="max-w-5xl mx-auto">
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
                        <h2 className="section-title">Revenue</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            <StatCard label="Total Revenue (all branches)" value={`KES ${revenue?.total_revenue_all_branches ?? '0.00'}`} accent />
                        </div>

                        <h2 className="section-title">Revenue by Branch</h2>
                        <div className="card mb-8">
                            {branchBars.length === 0 ? (
                                <p className="text-sm text-brand-black/50 dark:text-white/50">No delivered orders in this range yet.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={branchBars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chart.gridColor} vertical={false} />
                                        <XAxis dataKey="branch_name" tick={{ fill: chart.axisColor, fontSize: 12 }} axisLine={{ stroke: chart.gridColor }} tickLine={false} />
                                        <YAxis tick={{ fill: chart.axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={chart.tooltipStyle} labelStyle={chart.labelStyle} itemStyle={chart.itemStyle}
                                            formatter={(v) => [`KES ${Number(v).toFixed(2)}`, 'Revenue']}
                                        />
                                        <Bar dataKey="total_revenue" radius={[6, 6, 0, 0]}>
                                            {branchBars.map((_, i) => (
                                                <Cell key={i} fill={i % 2 === 0 ? CHART_COLORS.green : CHART_COLORS.greenDeep} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <h2 className="section-title">Top Selling Products</h2>
                        <div className="card mb-8">
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

                        <div className="flex justify-between items-center mb-3">
                            <h2 className="section-title mb-0">Orders Over Time</h2>
                            <div className="flex gap-2">
                                {['daily', 'weekly', 'monthly'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p)}
                                        className={period === p ? 'filter-pill-active' : 'filter-pill-inactive'}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="card">
                            {trend.length === 0 ? (
                                <p className="text-sm text-brand-black/50 dark:text-white/50">No orders in this range.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <ComposedChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chart.gridColor} vertical={false} />
                                        <XAxis dataKey="period" tick={{ fill: chart.axisColor, fontSize: 11 }} axisLine={{ stroke: chart.gridColor }} tickLine={false} />
                                        <YAxis yAxisId="left" tick={{ fill: chart.axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fill: chart.axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={chart.tooltipStyle} labelStyle={chart.labelStyle} itemStyle={chart.itemStyle} />
                                        <Legend wrapperStyle={{ fontSize: 12, color: chart.axisColor }} />
                                        <Bar yAxisId="left" dataKey="total_orders" name="Total orders" fill={CHART_COLORS.black} radius={[4, 4, 0, 0]} fillOpacity={0.15} />
                                        <Bar yAxisId="left" dataKey="completed_orders" name="Delivered" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
                                        <Bar yAxisId="left" dataKey="cancelled_orders" name="Cancelled" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
                                        <Line yAxisId="right" type="monotone" dataKey="total_revenue" name="Revenue (KES)" stroke={CHART_COLORS.yellow} strokeWidth={2.5} dot={false} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}

export default AdminAnalytics
