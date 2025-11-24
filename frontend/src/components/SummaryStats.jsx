function SummaryStats({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-eco-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No data available</p>
            <p className="text-gray-400 text-sm mt-1">Apply filters to see summary statistics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(data).map(([metric, stats]) => (
        <div key={metric} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <h3 className="text-xl font-semibold text-eco-primary mb-6 capitalize flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {metric} Statistics
          </h3>
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Minimum"
              value={stats.min}
              unit={stats.unit}
              color="text-blue-600"
              bgColor="bg-blue-50"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
            />
            <StatCard
              label="Maximum"
              value={stats.max}
              unit={stats.unit}
              color="text-red-600"
              bgColor="bg-red-50"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
            />
            <StatCard
              label="Average"
              value={stats.avg}
              unit={stats.unit}
              color="text-gray-700"
              bgColor="bg-gray-100"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
            />
            <StatCard
              label="Quality Weighted Avg"
              value={stats.weighted_avg}
              unit={stats.unit}
              color="text-eco-primary"
              highlight={true}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
            />
          </div>

          {/* Quality Distribution */}
          {stats.quality_distribution && (
            <div className="border-t border-gray-100 pt-5">
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Quality Distribution
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QualityBadge
                  label="Excellent"
                  percentage={stats.quality_distribution.excellent}
                  color="bg-gradient-to-br from-green-100 to-green-50 text-green-800 border border-green-200"
                />
                <QualityBadge
                  label="Good"
                  percentage={stats.quality_distribution.good}
                  color="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-800 border border-blue-200"
                />
                <QualityBadge
                  label="Questionable"
                  percentage={stats.quality_distribution.questionable}
                  color="bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200"
                />
                <QualityBadge
                  label="Poor"
                  percentage={stats.quality_distribution.poor}
                  color="bg-gradient-to-br from-red-100 to-red-50 text-red-800 border border-red-200"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, unit, color, bgColor, highlight = false, icon }) {
  return (
    <div className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
      highlight 
        ? 'bg-gradient-to-br from-eco-light to-white border-2 border-eco-primary shadow-md' 
        : `${bgColor || 'bg-gray-50'} border border-gray-100`
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>
        {value.toFixed(1)}
        <span className="text-sm font-normal ml-1 text-gray-500">{unit}</span>
      </p>
    </div>
  );
}

function QualityBadge({ label, percentage, color }) {
  return (
    <div className={`px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${color}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="text-xl font-bold">{(percentage * 100).toFixed(1)}%</p>
    </div>
  );
}

export default SummaryStats;

