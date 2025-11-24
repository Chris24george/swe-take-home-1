// src/components/QualityIndicator.jsx
import { useMemo } from 'react';

function QualityIndicator({ data, className = '' }) {
  const qualityStats = useMemo(() => {
    if (!data?.length) return null;
    
    const stats = {
      excellent: 0,
      good: 0,
      questionable: 0,
      poor: 0,
      total: data.length
    };
    
    data.forEach(item => {
      stats[item.quality.toLowerCase()]++;
    });
    
    return {
      ...stats,
      percentages: {
        excellent: (stats.excellent / stats.total * 100).toFixed(1),
        good: (stats.good / stats.total * 100).toFixed(1),
        questionable: (stats.questionable / stats.total * 100).toFixed(1),
        poor: (stats.poor / stats.total * 100).toFixed(1)
      }
    };
  }, [data]);

  if (!qualityStats) return null;

  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 ${className}`}>
      <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-eco-primary">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Data Quality Distribution
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QualityBar 
          label="Excellent" 
          percentage={qualityStats.percentages.excellent}
          count={qualityStats.excellent}
          color="bg-gradient-to-r from-green-400 to-green-500"
          bgColor="bg-green-50"
          textColor="text-green-700"
        />
        <QualityBar 
          label="Good" 
          percentage={qualityStats.percentages.good}
          count={qualityStats.good}
          color="bg-gradient-to-r from-blue-400 to-blue-500"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
        />
        <QualityBar 
          label="Questionable" 
          percentage={qualityStats.percentages.questionable}
          count={qualityStats.questionable}
          color="bg-gradient-to-r from-yellow-400 to-yellow-500"
          bgColor="bg-yellow-50"
          textColor="text-yellow-700"
        />
        <QualityBar 
          label="Poor" 
          percentage={qualityStats.percentages.poor}
          count={qualityStats.poor}
          color="bg-gradient-to-r from-red-400 to-red-500"
          bgColor="bg-red-50"
          textColor="text-red-700"
        />
      </div>
    </div>
  );
}

function QualityBar({ label, percentage, count, color, bgColor, textColor }) {
  return (
    <div className={`p-4 rounded-lg ${bgColor} transition-all duration-300 hover:scale-105`}>
      <div className="flex justify-between text-sm mb-2">
        <span className={`font-medium ${textColor}`}>{label}</span>
        <span className={`font-bold ${textColor}`}>{percentage}%</span>
      </div>
      <div className="h-2 bg-white/50 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={`text-xs ${textColor} mt-2 opacity-80`}>
        {count} measurements
      </div>
    </div>
  );
}

export default QualityIndicator;