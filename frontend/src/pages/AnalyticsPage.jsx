import { useState, useEffect } from 'react'
import { api } from '../lib/axiosInstance'

export default function AnalyticsPage() {
  const [costReport, setCostReport] = useState([])
  const [kpis, setKpis] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReports = async () => {
    try {
      const [costRes, kpiRes] = await Promise.all([
        api.get('/reports/reports/vehicle-costs'),
        api.get('/reports/dashboard/kpis'),
      ])
      setCostReport(costRes.data)
      setKpis(kpiRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching reports:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // Calculate Operational Cost dynamically
  const totalOpCost = costReport.reduce((sum, item) => sum + item.totalCost, 0)

  // Find fleet utilization from dashboard KPIs
  const utilizationKpi = kpis.find(kpi => kpi.label === 'FLEET UTILIZATION')
  const fleetUtilization = utilizationKpi ? utilizationKpi.value : '81%'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading reports and analytics data...</p>
      </div>
    )
  }

  // Sort and select top costliest vehicles
  const topCostliest = [...costReport]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 3)

  const maxTotalCost = topCostliest[0]?.totalCost || 1

  return (
    <div className="space-y-8 select-none">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Analytics</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Fuel Efficiency */}
        <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-900/60 backdrop-blur-sm shadow-md space-y-2">
          <p className="text-[10px] font-bold text-gray-500 tracking-wider">FUEL EFFICIENCY</p>
          <p className="text-2xl font-bold text-white">8.4 km/l</p>
        </div>

        {/* Fleet Utilization */}
        <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-900/60 backdrop-blur-sm shadow-md space-y-2">
          <p className="text-[10px] font-bold text-gray-500 tracking-wider">FLEET UTILIZATION</p>
          <p className="text-2xl font-bold text-white">{fleetUtilization}</p>
        </div>

        {/* Operational Cost */}
        <div className="p-6 rounded-2xl bg-gray-900/40 border-gray-900/60 backdrop-blur-sm shadow-md space-y-2 border-l-4 border-l-amber-600">
          <p className="text-[10px] font-bold text-gray-500 tracking-wider">OPERATIONAL COST</p>
          <p className="text-2xl font-bold text-amber-500">₹ {totalOpCost?.toLocaleString() || '34,070'}</p>
        </div>

        {/* Vehicle ROI */}
        <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-900/60 backdrop-blur-sm shadow-md space-y-2">
          <p className="text-[10px] font-bold text-gray-500 tracking-wider">VEHICLE ROI</p>
          <p className="text-2xl font-bold text-white">14.2%</p>
        </div>

      </div>

      <p className="text-xs text-gray-500 leading-normal">
        ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      </p>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-md font-bold text-white mb-8">MONTHLY REVENUE</h3>
          <div className="flex items-end justify-between h-48 px-4">
            {[45, 65, 55, 80, 75, 95, 90].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-10">
                <div
                  className="w-full bg-indigo-500/80 rounded-t-lg hover:bg-indigo-400 transition-all duration-300"
                  style={{ height: `${h}%` }}
                ></div>
                <span className="text-[10px] text-gray-500">M0{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Costliest Vehicles Chart */}
        <div className="bg-gray-900/40 border border-gray-900/60 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-white mb-8">TOP COSTLIEST VEHICLES</h3>
            
            <div className="space-y-6">
              {topCostliest.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-12">No cost records found.</p>
              ) : (
                topCostliest.map((row, index) => {
                  const percent = Math.max(5, Math.round((row.totalCost / maxTotalCost) * 100))
                  const barColor = index === 0 ? 'bg-red-500/80' : index === 1 ? 'bg-amber-600/80' : 'bg-indigo-500/80'

                  return (
                    <div key={row.vehicleId} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300 font-semibold">{row.nameModel} ({row.regNo})</span>
                        <span className="text-gray-400">₹ {row.totalCost?.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <p className="text-[10px] text-gray-500 mt-8 leading-normal">
            * Operational costs are compiled by aggregating fuel receipts, toll logs, general expenses, and closed maintenance shop logs.
          </p>
        </div>

      </div>

    </div>
  )
}
