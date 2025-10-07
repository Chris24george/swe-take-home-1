function SummaryStats({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p className="text-gray-500 text-center py-8">
          No data available. Please apply filters to see summary statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(data).map(([metric, stats]) => (
        <div key={metric} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-eco-primary mb-4 capitalize">
            {metric} Statistics
          </h3>
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Minimum"
              value={stats.min}
              unit={stats.unit}
              color="text-blue-600"
            />
            <StatCard
              label="Maximum"
              value={stats.max}
              unit={stats.unit}
              color="text-red-600"
            />
            <StatCard
              label="Average"
              value={stats.avg}
              unit={stats.unit}
              color="text-gray-700"
            />
            <StatCard
              label="Quality Weighted Avg"
              value={stats.weighted_avg}
              unit={stats.unit}
              color="text-eco-primary"
              highlight={true}
            />
          </div>

          {/* Quality Distribution */}
          {stats.quality_distribution && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Quality Distribution
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QualityBadge
                  label="Excellent"
                  percentage={stats.quality_distribution.excellent}
                  color="bg-green-100 text-green-800"
                />
                <QualityBadge
                  label="Good"
                  percentage={stats.quality_distribution.good}
                  color="bg-blue-100 text-blue-800"
                />
                <QualityBadge
                  label="Questionable"
                  percentage={stats.quality_distribution.questionable}
                  color="bg-yellow-100 text-yellow-800"
                />
                <QualityBadge
                  label="Poor"
                  percentage={stats.quality_distribution.poor}
                  color="bg-red-100 text-red-800"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, unit, color, highlight = false }) {
  return (
    <div className={`p-4 rounded-lg ${highlight ? 'bg-eco-light border-2 border-eco-primary' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value.toFixed(1)}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </p>
    </div>
  );
}

function QualityBadge({ label, percentage, color }) {
  return (
    <div className={`px-3 py-2 rounded-lg ${color}`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-lg font-bold">{(percentage * 100).toFixed(1)}%</p>
    </div>
  );
}

export default SummaryStats;

