import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MdFullscreen } from 'react-icons/md';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for different statuses
const createCustomIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const iconOnline = createCustomIcon('#10B981'); // Emerald
const iconPickedUp = createCustomIcon('#A855F7'); // Purple
const iconOnDelivery = createCustomIcon('#F59E0B'); // Amber

const LiveMapPanel = ({ requests, riderStatus }) => {
  // Default center to Dhaka
  const center = [23.8103, 90.4125]; 

  // In a real scenario, requests and riders would have actual lat/lng
  // Since we don't have real coordinates in this DB schema yet, 
  // we will show a static map with placeholder functionality, 
  // ready to be plugged in with actual coordinates.

  return (
    <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden shadow-xl flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Live Map Overview</h2>
        <button className="text-slate-400 hover:text-white transition-colors">
          <MdFullscreen className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 relative bg-[#0F172A]">
        {/* Note: In dark mode, standard OSM tiles are bright. Using a dark matter tile layer or CSS filter is ideal */}
        <div className="absolute inset-0 z-0 map-dark-filter">
          <MapContainer 
            center={center} 
            zoom={11} 
            zoomControl={false}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles"
            />
            <ZoomControl position="topleft" />
            
            {/* Example Marker */}
            <Marker position={[23.8103, 90.4125]} icon={iconOnline}>
              <Popup>
                <div className="text-slate-800">
                  <div className="font-bold text-sm">Rider Rakib</div>
                  <div className="text-xs text-emerald-600">Online - Available</div>
                </div>
              </Popup>
            </Marker>

            <Marker position={[23.7503, 90.3925]} icon={iconOnDelivery}>
              <Popup>
                <div className="text-slate-800">
                  <div className="font-bold text-sm">Rider Tuhin</div>
                  <div className="text-xs text-amber-600">On Delivery - TRK-12345</div>
                </div>
              </Popup>
            </Marker>
            
          </MapContainer>
        </div>
        
        {/* CSS to make map dark */}
        <style dangerouslySetInnerHTML={{__html: `
          .map-tiles {
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
          }
          .leaflet-container {
            background-color: #0F172A;
          }
          .leaflet-control-zoom a {
            background-color: #1E293B !important;
            color: #94A3B8 !important;
            border-color: #334155 !important;
          }
          .leaflet-control-zoom a:hover {
            color: #F8FAFC !important;
            background-color: #334155 !important;
          }
        `}} />
      </div>

      <div className="p-3 bg-[#1E293B] border-t border-slate-700/50 flex justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Online Riders
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          On Delivery
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Picked Up
        </div>
      </div>
    </div>
  );
};

export default LiveMapPanel;
