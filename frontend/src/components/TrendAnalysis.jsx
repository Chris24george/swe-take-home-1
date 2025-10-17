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
      <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data).map(([metric, analysis]) => (
            <div key={metric} className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2 capitalize">{metric}</h4>
              <div className="space-y-2">
                <TrendStat 
                  label="Trend Direction"
                  value={analysis.trend.direction}
                  icon={getTrendIcon(analysis.trend.direction)}
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
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Detected Anomalies</h3>
        <div className="space-y-2">
          {Object.entries(data).map(([metric, analysis]) => (
            analysis.anomalies.length > 0 && (
              <div key={metric} className="border-b pb-2">
                <h4 className="font-medium text-gray-700 mb-2 capitalize">{metric}</h4>
                <div className="space-y-1">
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
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Seasonal Patterns</h3>
        <div className="space-y-4">
          {Object.entries(data).map(([metric, analysis]) => (
            analysis.seasonality.detected && (
              <div key={metric} className="border-b pb-4">
                <h4 className="font-medium text-gray-700 mb-2 capitalize">{metric}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Period: {analysis.seasonality.period}
                    </p>
                    <p className="text-sm text-gray-600">
                      Confidence: {(analysis.seasonality.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(analysis.seasonality.pattern).map(([season, data]) => (
                      <div key={season} className="flex justify-between text-sm">
                        <span className="capitalize">{season}</span>
                        <span>{data.avg.toFixed(1)} ({data.trend})</span>
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

function TrendStat({ label, value, icon }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium flex items-center gap-1">
        {icon && <span>{icon}</span>}
        {value}
      </span>
    </div>
  );
}

function getTrendIcon(direction) {
  switch (direction.toLowerCase()) {
    case 'increasing':
      return '↗️';
    case 'decreasing':
      return '↘️';
    case 'stable':
      return '➡️';
    default:
      return null;
  }
}

function AnomalyItem({ anomaly }) {
  return (
    <div 
      className="flex items-center text-sm cursor-help relative group"
    >
      <span className="w-32">{anomaly.date}</span>
      <span className="w-24">{anomaly.value}</span>
      <span className={`px-2 py-1 rounded text-xs ${
        anomaly.deviation > 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {anomaly.deviation.toFixed(1)} σ
      </span>
      
      {/* Custom tooltip */}
      <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10 whitespace-pre-line">
        <div className="space-y-1">
          <div><strong>Location:</strong> {anomaly.location_name || 'N/A'}, {anomaly.country || 'N/A'}</div>
          <div><strong>Coordinates:</strong> {anomaly.latitude || 'N/A'}, {anomaly.longitude || 'N/A'}</div>
          <div><strong>Metric:</strong> {anomaly.metric || 'N/A'}</div>
          <div><strong>Value:</strong> {anomaly.value} {anomaly.unit || ''}</div>
          <div><strong>Date:</strong> {anomaly.date}</div>
          <div><strong>Quality:</strong> {anomaly.quality}</div>
          <div><strong>Deviation:</strong> {anomaly.deviation.toFixed(1)}σ from mean</div>
        </div>
        {/* Triangle pointer */}
        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
      </div>
    </div>
  );
}

export default TrendAnalysis;