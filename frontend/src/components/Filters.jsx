function Filters({ locations, metrics, filters, onFilterChange, onApplyFilters }) {
  // Update a single filter field while preserving others
  const handleChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-eco-primary mb-4">Filter Data</h2>
      
      {/* Location and Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Location Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            value={filters.locationId}
            onChange={(e) => handleChange('locationId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-primary"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Metric
          </label>
          <select
            value={filters.metric}
            onChange={(e) => handleChange('metric', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-primary"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-primary"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-primary"
          />
        </div>
      </div>

      {/* Quality Threshold */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quality Threshold
        </label>
        <select
          value={filters.qualityThreshold}
          onChange={(e) => handleChange('qualityThreshold', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-eco-primary"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Analysis Type
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="analysisType"
              value="raw"
              checked={filters.analysisType === 'raw'}
              onChange={(e) => handleChange('analysisType', e.target.value)}
              className="mr-2 text-eco-primary focus:ring-eco-primary"
            />
            <span className="text-sm text-gray-700">Raw Data</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="analysisType"
              value="weighted"
              checked={filters.analysisType === 'weighted'}
              onChange={(e) => handleChange('analysisType', e.target.value)}
              className="mr-2 text-eco-primary focus:ring-eco-primary"
            />
            <span className="text-sm text-gray-700">Quality Weighted</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="analysisType"
              value="trends"
              checked={filters.analysisType === 'trends'}
              onChange={(e) => handleChange('analysisType', e.target.value)}
              className="mr-2 text-eco-primary focus:ring-eco-primary"
            />
            <span className="text-sm text-gray-700">Trends & Anomalies</span>
          </label>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <button
          onClick={onApplyFilters}
          className="bg-eco-primary text-white px-6 py-2 rounded-lg hover:bg-eco-secondary transition-colors duration-200 font-medium"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

export default Filters;