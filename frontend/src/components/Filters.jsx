function Filters({ locations, metrics, filters, onFilterChange, onApplyFilters }) {
  // Update a single filter field while preserving others
  const handleChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-eco-primary mb-6 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter Data
      </h2>
      
      {/* Location and Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Location Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={filters.locationId}
            onChange={(e) => handleChange('locationId', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eco-primary focus:border-transparent transition-all duration-200"
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.region})
              </option>
            ))}
          </select>
        </div>

        {/* Metric Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metric
          </label>
          <select
            value={filters.metric}
            onChange={(e) => handleChange('metric', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eco-primary focus:border-transparent transition-all duration-200"
          >
            <option value="">All Metrics</option>
            {metrics.map(m => (
              <option key={m.id} value={m.name}>
                {m.name.charAt(0).toUpperCase() + m.name.slice(1)} ({m.unit})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Range Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eco-primary focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eco-primary focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Quality Threshold */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quality Threshold
        </label>
        <select
          value={filters.qualityThreshold}
          onChange={(e) => handleChange('qualityThreshold', e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-eco-primary focus:border-transparent transition-all duration-200"
        >
          <option value="">All Quality Levels</option>
          <option value="poor">Poor or Better</option>
          <option value="questionable">Questionable or Better</option>
          <option value="good">Good or Better</option>
          <option value="excellent">Excellent Only</option>
        </select>
      </div>

      {/* Analysis Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Analysis Type
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className={`flex items-center cursor-pointer px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${
            filters.analysisType === 'raw' 
              ? 'border-eco-primary bg-eco-primary/5 text-eco-primary' 
              : 'border-gray-200 hover:border-eco-primary/50'
          }`}>
            <input
              type="radio"
              name="analysisType"
              value="raw"
              checked={filters.analysisType === 'raw'}
              onChange={(e) => handleChange('analysisType', e.target.value)}
              className="sr-only"
            />
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <span className="text-sm font-medium">Raw Data</span>
          </label>

          <label className={`flex items-center cursor-pointer px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${
            filters.analysisType === 'weighted' 
              ? 'border-eco-primary bg-eco-primary/5 text-eco-primary' 
              : 'border-gray-200 hover:border-eco-primary/50'
          }`}>
            <input
              type="radio"
              name="analysisType"
              value="weighted"
              checked={filters.analysisType === 'weighted'}
              onChange={(e) => handleChange('analysisType', e.target.value)}
              className="sr-only"
            />
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">Summary</span>
          </label>

          <label className={`flex items-center cursor-pointer px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${
            filters.analysisType === 'trends' 
              ? 'border-eco-primary bg-eco-primary/5 text-eco-primary' 
              : 'border-gray-200 hover:border-eco-primary/50'
          }`}>
            <input
              type="radio"
              name="analysisType"
              value="trends"
              checked={filters.analysisType === 'trends'}
              onChange={(e) => handleChange('analysisType', e.target.value)}
              className="sr-only"
            />
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-medium">Trends & Anomalies</span>
          </label>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <button
          onClick={onApplyFilters}
          className="bg-gradient-to-r from-eco-primary to-eco-secondary text-white px-8 py-3 rounded-lg hover:opacity-90 hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Apply Filters
        </button>
      </div>
    </div>
  );
}

export default Filters;