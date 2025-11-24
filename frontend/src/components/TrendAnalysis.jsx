// src/components/TrendAnalysis.jsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function TrendAnalysis({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-eco-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse">Analyzing trends...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-eco-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Trend Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data).map(([metric, analysis]) => (
            <div key={metric} className="p-5 border border-gray-100 rounded-xl bg-gradient-to-br from-gray-50 to-white transition-all duration-300 hover:shadow-md">
              <h4 className="font-semibold text-eco-primary mb-3 capitalize flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-eco-primary"></span>
                {metric}
              </h4>
              <div className="space-y-3">
                <TrendStat 
                  label="Trend Direction"
                  value={analysis.trend.direction}
                  icon={getTrendIcon(analysis.trend.direction)}
                  highlight={true}
                />
                <TrendStat 
                  label="Rate of Change"
                  value={`${analysis.trend.rate} ${analysis.trend.unit}/month`}
                />
                <TrendStat 
                  label="Confidence"
                  value={`${(analysis.trend.confidence * 100).toFixed(1)}%`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomalies */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-eco-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Detected Anomalies
        </h3>
        <div className="space-y-4">
          {Object.entries(data).map(([metric, analysis]) => (
            analysis.anomalies.length > 0 && (
              <div key={metric} className="border-b border-gray-100 pb-4 last:border-b-0">
                <h4 className="font-semibold text-gray-700 mb-3 capitalize">{metric}</h4>
                <div className="space-y-2">
                  {analysis.anomalies.map((anomaly, index) => (
                    <AnomalyItem key={index} anomaly={anomaly} />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Seasonality */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-eco-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Seasonal Patterns
        </h3>
        <div className="space-y-5">
          {Object.entries(data).map(([metric, analysis]) => (
            analysis.seasonality.detected && (
              <div key={metric} className="border-b border-gray-100 pb-5 last:border-b-0">
                <h4 className="font-semibold text-gray-700 mb-4 capitalize">{metric}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Period:</span> {analysis.seasonality.period}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Confidence:</span> {(analysis.seasonality.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(analysis.seasonality.pattern).map(([season, seasonData]) => (
                      <div key={season} className="bg-gradient-to-br from-eco-light to-white p-3 rounded-lg border border-eco-primary/20">
                        <span className="text-xs text-gray-500 capitalize block">{season}</span>
                        <span className="font-semibold text-eco-primary">{seasonData.avg.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-1">({seasonData.trend})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendStat({ label, value, icon, highlight = false }) {
  return (
    <div className={`flex justify-between items-center text-sm ${highlight ? 'bg-eco-light p-2 rounded-lg' : ''}`}>
      <span className="text-gray-600">{label}:</span>
      <span className={`font-semibold flex items-center gap-1 ${highlight ? 'text-eco-primary' : 'text-gray-800'}`}>
        {icon && <span className="text-lg">{icon}</span>}
        {value}
      </span>
    </div>
  );
}

function getTrendIcon(direction) {
  switch (direction.toLowerCase()) {
    case 'increasing':
      return '📈';
    case 'decreasing':
      return '📉';
    case 'stable':
      return '➡️';
    default:
      return null;
  }
}

function AnomalyItem({ anomaly }) {
  return (
    <div 
      className="flex items-center text-sm cursor-help relative group bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
    >
      <span className="w-28 font-medium text-gray-700">{anomaly.date}</span>
      <span className="w-20 text-gray-600">{anomaly.value}</span>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        anomaly.deviation > 3 
          ? 'bg-red-100 text-red-800 border border-red-200' 
          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      }`}>
        {anomaly.deviation.toFixed(1)} σ
      </span>
      
      {/* Custom tooltip */}
      <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-80 bg-gray-900 text-white text-xs rounded-xl p-4 shadow-xl z-10 whitespace-pre-line">
        <div className="space-y-2">
          <div><strong className="text-eco-secondary">Location:</strong> {anomaly.location_name || 'N/A'}, {anomaly.country || 'N/A'}</div>
          <div><strong className="text-eco-secondary">Coordinates:</strong> {anomaly.latitude || 'N/A'}, {anomaly.longitude || 'N/A'}</div>
          <div><strong className="text-eco-secondary">Metric:</strong> {anomaly.metric || 'N/A'}</div>
          <div><strong className="text-eco-secondary">Value:</strong> {anomaly.value} {anomaly.unit || ''}</div>
          <div><strong className="text-eco-secondary">Date:</strong> {anomaly.date}</div>
          <div><strong className="text-eco-secondary">Quality:</strong> {anomaly.quality}</div>
          <div><strong className="text-eco-secondary">Deviation:</strong> {anomaly.deviation.toFixed(1)}σ from mean</div>
        </div>
        {/* Triangle pointer */}
        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
      </div>
    </div>
  );
}

export default TrendAnalysis;