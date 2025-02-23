import React, { useState, useRef } from 'react';
import MapContainer from './components/MapContainer';
import Sidebar from './components/Sidebar';
import './App.css';

const App = () => {
  // Filter for region or province selection
  const [filter, setFilter] = useState({ region: '', province: '' });
  // Proximity radius (in km)
  const [proximityRadius, setProximityRadius] = useState('');
  // Options for the select dropdowns
  const [regionOptions, setRegionOptions] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  // Chart data for transport stations
  const [chartData, setChartData] = useState({});
  // Selected transport type (for proximity search)
  const [selectedFclass, setSelectedFclass] = useState('');
  // Mode: filter by region or province
  const [filterByRegion, setFilterByRegion] = useState(true);

  // Reference to the MapContainer component
  const mapContainerRef = useRef(null);

  return (
    <div className="app-container">
      <MapContainer
        ref={mapContainerRef}
        filter={filter}
        proximityRadius={proximityRadius}
        setRegionOptions={setRegionOptions}
        setProvinceOptions={setProvinceOptions}
        setTransportOptions={setTransportOptions}
        selectedFclass={selectedFclass}
        setChartData={setChartData}
      />
      <Sidebar
        filter={filter}
        setFilter={setFilter}
        proximityRadius={proximityRadius}
        setProximityRadius={setProximityRadius}
        regionOptions={regionOptions}
        provinceOptions={provinceOptions}
        transportOptions={transportOptions}
        mapMethods={mapContainerRef.current}
        filterByRegion={filterByRegion}
        setFilterByRegion={setFilterByRegion}
        selectedFclass={selectedFclass}
        setSelectedFclass={setSelectedFclass}
        chartData={chartData}
      />
    </div>
  );
};

export default App;
