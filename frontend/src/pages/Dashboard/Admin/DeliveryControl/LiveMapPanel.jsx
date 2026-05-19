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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xl flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Live Map Overview</h2>
        <button className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
          <MdFullscreen className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 relative bg-slate-100 dark:bg-slate-950">
        <div className="absolute inset-0 z-0">
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
                <div className="text-slate-805">
                  <div className="font-bold text-sm">Rider Rakib</div>
                  <div className="text-xs text-emerald-600 font-semibold">Online - Available</div>
                </div>
              </Popup>
            </Marker>

            <Marker position={[23.7503, 90.3925]} icon={iconOnDelivery}>
              <Popup>
                <div className="text-slate-805">
                  <div className="font-bold text-sm">Rider Tuhin</div>
                  <div className="text-xs text-amber-600 font-semibold">On Delivery - TRK-12345</div>
                </div>
              </Popup>
            </Marker>
            
          </MapContainer>
        </div>
        
        {/* CSS to make map dark only in dark mode */}
        <style dangerouslySetInnerHTML={{__html: `
          .dark .map-tiles {
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
          }
          .leaflet-container {
            background-color: #E2E8F0;
          }
          .dark .leaflet-container {
            background-color: #0F172A;
          }
          .leaflet-control-zoom a {
            background-color: #ffffff !important;
            color: #475569 !important;
            border: 1px solid #cbd5e1 !important;
          }
          .dark .leaflet-control-zoom a {
            background-color: #1E293B !important;
            color: #94A3B8 !important;
            border: 1px solid #334155 !important;
          }
          .leaflet-control-zoom a:hover {
            color: #0f172a !important;
            background-color: #f1f5f9 !important;
          }
          .dark .leaflet-control-zoom a:hover {
            color: #F8FAFC !important;
            background-color: #334155 !important;
          }
        `}} />
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-2 text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-350">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-slate-900 shadow-sm"></span>
          Online Riders
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-355">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white dark:border-slate-900 shadow-sm"></span>
          On Delivery
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-355">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-white dark:border-slate-900 shadow-sm"></span>
          Picked Up
        </div>
      </div>
    </div>
  );
};

export default LiveMapPanel;
