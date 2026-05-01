import React, { useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { coverageData } from "../../data/coverage-data";

// ✈️ Dynamic map centering
function FlyToDistrict({ position }) {
  const map = useMap();
  if (position) {
    map.flyTo(position, 11, { animate: true, duration: 1 });
  }
  return null;
}

// 🎨 Color scheme by region
const regionColors = {
  "Dhaka": "#3B82F6",
  "Chattogram": "#DC2626",
  "Sylhet": "#10B981",
  "Rangpur": "#F59E0B",
  "Khulna": "#8B5CF6",
  "Rajshahi": "#EC4899",
  "Barisal": "#06B6D4",
  "Mymensingh": "#F97316",
};

// 📍 Custom marker icon
const createMarkerIcon = (color) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-weight: bold;
        color: white;
        font-size: 14px;
      ">
        ●
      </div>
    `,
    iconSize: [32, 32],
    className: "custom-marker",
  });
};

// 📊 Statistics component
const CoverageStats = ({ data }) => {
  const regions = [...new Set(data.map(d => d.region))];
  const activeDistricts = data.filter(d => d.status === "active").length;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{data.length}</p>
        <p className="text-xs text-gray-600">Districts</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">{regions.length}</p>
        <p className="text-xs text-gray-600">Regions</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-orange-600">{activeDistricts}</p>
        <p className="text-xs text-gray-600">Active</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-purple-600">100%</p>
        <p className="text-xs text-gray-600">Coverage</p>
      </div>
    </div>
  );
};

// 🏷️ Region filter tags
const RegionFilter = ({ regions, selectedRegion, onRegionChange }) => {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <button
        onClick={() => onRegionChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selectedRegion === null
            ? "bg-gray-800 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        All Regions
      </button>
      {regions.map((region) => (
        <button
          key={region}
          onClick={() => onRegionChange(region)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedRegion === region
              ? "text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          style={{
            backgroundColor: selectedRegion === region ? regionColors[region] : undefined,
          }}
        >
          {region}
        </button>
      ))}
    </div>
  );
};

const CoverageMap = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // 🔍 Enhanced filtering
  const filtered = useMemo(() => {
    return coverageData.filter((d) => {
      const matchesSearch =
        d.district.toLowerCase().includes(search.toLowerCase()) ||
        d.city.toLowerCase().includes(search.toLowerCase()) ||
        d.region.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = !selectedRegion || d.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [search, selectedRegion]);

  // ⌨️ Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      handleSelect(filtered[activeIndex]);
    }
  };

  // 🎯 Selection handler
  const handleSelect = (district) => {
    setSelected(district);
    setSearch(district.district);
    setActiveIndex(-1);
    setSelectedRegion(district.region);
  };

  const regions = [...new Set(coverageData.map((d) => d.region))].sort();

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Coverage Map</h1>
        <p className="text-gray-600">Explore our service coverage across Bangladesh</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Sidebar - Search & Info */}
        <div className="w-full lg:w-96 bg-white border-r border-gray-200 overflow-y-auto p-6 shadow-sm">
          {/* Stats */}
          <CoverageStats data={coverageData} />

          {/* Region Filter */}
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Filter by Region</h3>
          <RegionFilter
            regions={regions}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
          />

          {/* Search Box */}
          <div className="relative mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search district or city..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-base-100"
              />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">
                {filtered.length > 0 ? `${filtered.length}` : "0"} results
              </span>
            </div>

            {/* Suggestions Dropdown */}
            {search && filtered.length > 0 && search !== selected?.district && (
              <div className="absolute top-full left-0 w-full bg-white border-2 border-t-0 border-gray-300 rounded-b-lg shadow-lg max-h-64 overflow-auto z-50 mt-0">
                {filtered.map((d, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelect(d)}
                    className={`p-4 cursor-pointer transition-all border-b border-gray-100 last:border-b-0 ${
                      i === activeIndex
                        ? "bg-blue-100 border-l-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: regionColors[d.region] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{d.district}</p>
                        <p className="text-xs text-gray-500">{d.region} Region</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {d.covered_area.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {search && filtered.length === 0 && search !== selected?.district && (
              <div className="absolute top-full left-0 w-full bg-white border-2 border-t-0 border-gray-300 rounded-b-lg shadow-lg p-4 z-50 text-center text-gray-500">
                No districts found
              </div>
            )}
          </div>

          {/* Selected District Info */}
          {selected && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900">{selected.district}</h3>
                <p className="text-sm text-gray-600">{selected.region} Region</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600 font-semibold">City:</p>
                  <p className="text-gray-900">{selected.city}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 font-semibold">Covered Areas:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selected.covered_area.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 font-semibold">Status:</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mt-1">
                    ✓ Active
                  </span>
                </div>

                {selected.flowchart && (
                  <a
                    href={selected.flowchart}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3 px-4 py-2 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    View Flowchart →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={[23.685, 90.3563]}
            zoom={7}
            className="w-full h-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <FlyToDistrict position={selected ? [selected.latitude, selected.longitude] : null} />

            {/* Markers */}
            {(selectedRegion ? filtered : coverageData).map((d, i) => (
              <Marker
                key={i}
                position={[d.latitude, d.longitude]}
                icon={createMarkerIcon(regionColors[d.region])}
                eventHandlers={{
                  click: () => handleSelect(d),
                }}
              >
                <Popup>
                  <div className="w-64">
                    <h3 className="font-bold text-lg text-gray-900">{d.district}</h3>
                    <p className="text-sm text-gray-600 mb-2">{d.region}</p>
                    
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-semibold">City:</span> {d.city}
                      </p>
                      <p>
                        <span className="font-semibold">Areas:</span>{" "}
                        {d.covered_area.join(", ")}
                      </p>
                      <p>
                        <span
                          className="inline-block px-2 py-1 rounded text-white text-xs font-bold"
                          style={{ backgroundColor: regionColors[d.region] }}
                        >
                          {d.status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Legend */}
          <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-xs">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Regions</h4>
            <div className="space-y-2">
              {regions.map((region) => (
                <div key={region} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: regionColors[region] }}
                  />
                  <span className="text-gray-700">{region}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverageMap;