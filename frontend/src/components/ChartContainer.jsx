// src/components/ChartContainer.jsx
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Utility function to generate random colors
const getRandomColor = (opacity = 1) => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Quality color mapping
const qualityColors = {
  excellent: 'rgba(34, 197, 94, 0.7)',  // green
  good: 'rgba(59, 130, 246, 0.7)',      // blue
  questionable: 'rgba(234, 179, 8, 0.7)', // yellow
  poor: 'rgba(239, 68, 68, 0.7)'        // red
};

function ChartContainer({ title, loading, chartType, data, showQuality = false }) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-96">
        <h2 className="text-xl font-semibold text-eco-primary mb-4">{title}</h2>
        <div className="flex items-center justify-center h-5/6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-eco-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-96">
        <h2 className="text-xl font-semibold text-eco-primary mb-4">{title}</h2>
        <div className="flex items-center justify-center h-5/6">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No data available</p>
            <p className="text-gray-400 text-sm mt-1">Apply filters to see visualizations</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const locations = [...new Set(data.map(item => item.location_name))];
  const dates = [...new Set(data.map(item => item.date))].sort();
  
  const datasets = locations.map(location => {
    const locationData = data.filter(item => item.location_name === location);
    const color = getRandomColor();
    
    return {
      label: location,
      data: dates.map(date => {
        const point = locationData.find(item => item.date === date);
        return point ? point.value : null;
      }),
      borderColor: showQuality ? locationData.map(item => qualityColors[item.quality]) : color,
      backgroundColor: showQuality ? locationData.map(item => qualityColors[item.quality]) : color,
      pointBackgroundColor: showQuality ? locationData.map(item => qualityColors[item.quality]) : color,
      borderWidth: 2,
      tension: 0.1
    };
  });

  const chartData = {
    labels: dates,
    datasets
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            if (showQuality) {
              const dataPoint = data.find(item => 
                item.location_name === context.dataset.label && 
                item.date === context.label
              );
              return dataPoint ? `Quality: ${dataPoint.quality}` : '';
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: data[0]?.unit || 'Value'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-96 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-xl font-semibold text-eco-primary mb-4 flex items-center gap-2">
        {chartType === 'line' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )}
        {title}
      </h2>
      <div className="h-5/6">
        {chartType === 'line' ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

export default ChartContainer;