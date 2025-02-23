import React, { useState } from 'react';
import './Sidebar.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend as ChartLegend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, ChartLegend);

const Sidebar = ({
  filter,
  setFilter,
  proximityRadius,
  setProximityRadius,
  regionOptions,
  provinceOptions,
  transportOptions,
  mapMethods,
  filterByRegion,
  setFilterByRegion,
  selectedFclass,
  setSelectedFclass,
  chartData,
}) => {
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'proximityRadius') {
      setProximityRadius(value);
    } else {
      setFilter((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFilterByRegion(e.target.checked);
    setFilter({ region: '', province: '' });
  };

  const handleFclassChange = (e) => {
    setSelectedFclass(e.target.value);
  };

  const handleClearAll = () => {
    setFilter({ region: '', province: '' });
    setProximityRadius('');
    setSelectedFclass('');
    setFilterByRegion(true);
    if (mapMethods && mapMethods.clearFilter) {
      mapMethods.clearFilter();
    }
  };

  const chartJSData = {
    labels: Object.keys(chartData),
    datasets: [
      {
        label: 'Transport stations by type',
        data: Object.values(chartData),
        backgroundColor: 'rgba(0, 121, 193, 0.7)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Transport Stations by Type',
      },
    },
  };

  return (
    <div className="sidebar">
      <div className="chart-container">
        <Bar data={chartJSData} options={chartOptions} />
      </div>
      <hr />
      <h2>Filters & Queries</h2>
      <div>
        <input
          type="checkbox"
          id="filterByRegion"
          checked={filterByRegion}
          onChange={handleCheckboxChange}
        />
        <span> Filter by Region (uncheck to filter by Province)</span>
      </div>
      {filterByRegion ? (
        <div className="input-group">
          <label htmlFor="region">Region:</label>
          <select
            id="region"
            name="region"
            value={filter.region}
            onChange={handleInputChange}
            onFocus={() => {
              setProximityRadius('');
              setSelectedFclass('');
            }}
          >
            <option value="">Select a region</option>
            {regionOptions.map((region, idx) => (
              <option key={idx} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="input-group">
          <label htmlFor="province">Province:</label>
          <select
            id="province"
            name="province"
            value={filter.province}
            onChange={handleInputChange}
            onFocus={() => {
              setProximityRadius('');
              setSelectedFclass('');
            }}
          >
            <option value="">Select a province</option>
            {provinceOptions.map((prov, idx) => (
              <option key={idx} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        className="btn"
        onClick={() =>
          mapMethods && mapMethods.applyFilter(filter, filterByRegion)
        }
      >
        Apply Filter
      </button>
      <hr />
      <h3>Proximity Search</h3>
      <div className="input-group">
        <label htmlFor="proximityRadius">Radius (km):</label>
        <input
          type="number"
          id="proximityRadius"
          name="proximityRadius"
          value={proximityRadius}
          onChange={handleInputChange}
          onFocus={() => {
            setFilter({ region: '', province: '' });
          }}
        />
      </div>
      <div className="input-group">
        <label htmlFor="fclassSelect">Transport Type:</label>
        <select
          id="fclassSelect"
          name="fclassSelect"
          value={selectedFclass}
          onChange={handleFclassChange}
          onFocus={() => {
            setFilter({ region: '', province: '' });
          }}
        >
          <option value="">Select a transport station type</option>
          {transportOptions &&
            transportOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
        </select>
      </div>
      {showAlert && (
        <div className="alert-message">
          Please enter a valid radius (in km) before activating proximity search.
        </div>
      )}
      <button
        className="btn"
        onClick={() => {
          if (!proximityRadius || parseFloat(proximityRadius) <= 0) {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            return;
          }
          setFilter({ region: '', province: '' });
          setSelectedFclass('');
          mapMethods && mapMethods.activateProximitySearch();
        }}
      >
        Activate Proximity Search
      </button>
      <hr />
      <h3>User-Defined Area Query</h3>
      <p>
        Draw a polygon on the map using the Sketch tool to query transport stations within that area.
      </p>
      <hr />
      <button className="btn" onClick={handleClearAll}>
        Clear Filters
      </button>
    </div>
  );
};

export default Sidebar;
