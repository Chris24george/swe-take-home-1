import { useState, useEffect } from 'react';
import Filters from './components/Filters';
import ChartContainer from './components/ChartContainer';
import TrendAnalysis from './components/TrendAnalysis';
import QualityIndicator from './components/QualityIndicator';
import SummaryStats from './components/SummaryStats';
import { getLocations, getMetrics, getClimateData, getClimateSummary, getTrends } from './api';

function App() {
  const [locations, setLocations] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [climateData, setClimateData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [filters, setFilters] = useState({
    locationId: '',
    startDate: '',
    endDate: '',
    metric: '',
    qualityThreshold: '',
    analysisType: 'raw'
  });
  const [loading, setLoading] = useState(false);

  // Load locations and metrics on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const locationsResponse = await getLocations();
        setLocations(locationsResponse.data);
        console.log('✅ Loaded locations:', locationsResponse.data.length);
        
        const metricsResponse = await getMetrics();
        setMetrics(metricsResponse.data);
        console.log('✅ Loaded metrics:', metricsResponse.data.length);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  // Fetch data based on current filters and analysis type
  const fetchData = async () => {
    setLoading(true);
    try {
      if (filters.analysisType === 'trends') {
        const response = await getTrends(filters);
        setTrendData(response.data);
        setClimateData([]);  // Clear other data
        setSummaryData(null);
      } else if (filters.analysisType === 'weighted') {
        const response = await getClimateSummary(filters);
        setSummaryData(response.data);
        setClimateData([]);  // Clear other data
        setTrendData(null);
      } else {
        const response = await getClimateData(filters);
        setClimateData(response.data);
        setTrendData(null);  // Clear other data
        setSummaryData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-eco-primary mb-2">
          EcoVision: Climate Visualizer
        </h1>
        <p className="text-gray-600 italic">
          Transforming climate data into actionable insights for a sustainable future
        </p>
      </header>

      <Filters 
        locations={locations}
        metrics={metrics}
        filters={filters}
        onFilterChange={setFilters}
        onApplyFilters={fetchData}
      />

      <div className="mt-8">
        {filters.analysisType === 'trends' ? (
          <TrendAnalysis 
            data={trendData}
            loading={loading}
          />
        ) : filters.analysisType === 'weighted' ? (
          <SummaryStats
            data={summaryData}
            loading={loading}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ChartContainer 
                title="Climate Trends"
                loading={loading}
                chartType="line"
                data={climateData}
                showQuality={true}
              />
              <ChartContainer 
                title="Quality Distribution"
                loading={loading}
                chartType="bar"
                data={climateData}
                showQuality={true}
              />
            </div>
            <QualityIndicator 
              data={climateData}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;