import { useState, useEffect } from 'react';
import Filters from './components/Filters';
import ChartContainer from './components/ChartContainer';
import TrendAnalysis from './components/TrendAnalysis';
import QualityIndicator from './components/QualityIndicator';
import SummaryStats from './components/SummaryStats';
import PaginationControls from './components/PaginationControls';
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [paginationMeta, setPaginationMeta] = useState(null);

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
  const fetchData = async (resetPage = true) => {
    // Reset to page 1 when filters change (user clicked "Apply Filters")
    if (resetPage) {
      setCurrentPage(1);
    }
    
    setLoading(true);
    try {
      if (filters.analysisType === 'trends') {
        const response = await getTrends(filters);
        setTrendData(response.data);
        setClimateData([]);  // Clear other data
        setSummaryData(null);
        setPaginationMeta(null);  // Clear pagination
      } else if (filters.analysisType === 'weighted') {
        const response = await getClimateSummary(filters);
        setSummaryData(response.data);
        setClimateData([]);  // Clear other data
        setTrendData(null);
        setPaginationMeta(null);  // Clear pagination
      } else {
        // Raw data view - include pagination
        const pageToFetch = resetPage ? 1 : currentPage;
        const response = await getClimateData({
          ...filters,
          page: pageToFetch,
          pageSize: pageSize
        });
        setClimateData(response.data);
        setPaginationMeta(response.meta);  // Store pagination metadata
        setTrendData(null);  // Clear other data
        setSummaryData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Refetch data when page changes (for raw data view only)
  useEffect(() => {
    if (filters.analysisType === 'raw' && climateData.length > 0) {
      fetchData(false);  // Don't reset page - use currentPage
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-eco-primary to-eco-secondary py-8 px-4 mb-8 shadow-lg">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              EcoVision
            </h1>
          </div>
          <p className="text-white/90 text-lg font-light">
            Transforming climate data into actionable insights for a sustainable future
          </p>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pb-8 max-w-6xl">

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
            <PaginationControls
              meta={paginationMeta}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
      </div>
    </div>
  );
}

export default App;