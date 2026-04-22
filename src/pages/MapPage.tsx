import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ArrowLeft, Navigation, ExternalLink, ShieldCheck, Camera, Star, AlertTriangle, Info, MapPin, Map as MapIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { LocationData } from "../types";
import { fetchLocations, geocodeAddress } from "../services/dataService";
import { cn } from "../lib/utils";

// Helper for loading images with fallbacks
function SafeImage({ src, alt, className, fallbackIcon: FallbackIcon }: { src?: string, alt: string, className?: string, fallbackIcon: any }) {
  const [error, setError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-slate-800 text-slate-500", className)}>
        <FallbackIcon className="w-1/2 h-1/2 opacity-30" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(className, "object-cover")}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
}

// Leaflet custom icons based on category
const createCustomIcon = (status: 'iyi' | 'orta' | 'kötü' | 'unknown', facilityType?: 'polis' | 'itfaiye' | 'benzinlik' | 'saglik' | 'market' | 'food' | 'standart') => {
  let colorClass = "bg-slate-500";
  let svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

  if (facilityType === 'polis') {
    colorClass = "bg-blue-600";
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
  } else if (facilityType === 'itfaiye') {
    colorClass = "bg-red-600";
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>`;
  } else if (facilityType === 'benzinlik') {
    colorClass = "bg-orange-500";
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><line x1="3" y1="22" x2="15" y2="22"></line><line x1="4" y1="9" x2="14" y2="9"></line><path d="M14 22V4a2 2 0 00-2-2H6a2 2 0 00-2 2v18"></path><path d="M14 13h2a2 2 0 012 2v2a2 2 0 002 2h0a2 2 0 002-2V9.83a2 2 0 00-.59-1.42L18 5"></path></svg>`;
  } else if (facilityType === 'saglik') {
    colorClass = "bg-rose-600"; // Red as requested for hospital
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
  } else if (facilityType === 'market') {
    colorClass = "bg-amber-500"; // Yellow as requested
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path></svg>`;
  } else if (facilityType === 'food') {
    colorClass = "bg-amber-500"; // Yellow as requested
    svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>`;
  }

  return L.divIcon({
    className: "custom-div-icon",
    html: `<div class="${colorClass} w-full h-full rounded-full border-[2.5px] border-white shadow-md flex items-center justify-center transition-transform hover:scale-110">${svgIcon}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const renderCategoryBadge = (name?: string, type?: string) => {
  if (!name) return null;
  
  let colors = "bg-slate-500/20 text-slate-400"; // Default
  if (type === 'polis') colors = "bg-blue-600/20 text-blue-400";
  else if (type === 'itfaiye') colors = "bg-red-600/20 text-red-400";
  else if (type === 'benzinlik') colors = "bg-orange-500/20 text-orange-400";
  else if (type === 'saglik') colors = "bg-rose-600/20 text-rose-400";
  else if (type === 'market' || type === 'food') colors = "bg-amber-500/20 text-amber-400";

  return (
    <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap", colors)}>
      {name}
    </span>
  );
};

function determineStatus(loc: LocationData): 'iyi' | 'orta' | 'kötü' | 'unknown' {
  const lighting = loc.lightingStatus?.toLowerCase() || "";
  const score = loc.safetyScore || 0;
  
  if (lighting.includes("iyi") || score >= 8) return 'iyi';
  if (lighting.includes("orta") || (score >= 5 && score < 8)) return 'orta';
  if (lighting.includes("kötü") || (score > 0 && score < 5)) return 'kötü';
  return 'unknown';
}

function LocationMarker({ loc, isSelected, onClick }: { loc: LocationData, key?: import("react").Key, isSelected?: boolean, onClick?: () => void }) {
  if (loc.lat === undefined || loc.lng === undefined) return null;
  
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      setTimeout(() => {
        markerRef.current?.openPopup();
      }, 500); // give flyTo some time
    }
  }, [isSelected]);

  const status = determineStatus(loc);
  return (
    <Marker 
      position={[loc.lat, loc.lng]} 
      icon={createCustomIcon(status, loc.facilityType)}
      ref={markerRef}
      eventHandlers={{ click: onClick }}
    >
      <Popup className="custom-popup" closeButton={false}>
        <div className="w-64 bg-[rgba(15,23,42,0.85)] text-slate-100 p-0 rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/50 backdrop-blur-md">
          {/* Top Banner Image Area */}
          <div className="w-full h-40 relative overflow-hidden rounded-t-2xl">
             <SafeImage src={loc.imageUrl} alt={loc.name} className="w-full h-full rounded-t-2xl" fallbackIcon={MapIcon} />
             {/* Gradient overlay to make sure text is not cut off abruptly, optional but nice */}
             <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[rgba(15,23,42,0.85)] to-transparent pointer-events-none"></div>
          </div>
          <div className="p-4 pt-2 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-bold text-white leading-tight">{loc.name}</h4>
                {renderCategoryBadge(loc.categoryName, loc.facilityType)}
              </div>
              <p className="text-xs text-slate-300 leading-snug">{loc.address}</p>
            </div>
          </div>
          
          <div className="px-4 mt-2 mb-2">
            {loc.comments ? (
              <p className="text-slate-400 italic text-[11px] border-t border-slate-700/50 pt-2 mb-3">"{loc.comments}"</p>
            ) : null}
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
              target="_blank"
              rel="noreferrer"
              className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white text-center py-2 rounded text-xs font-bold transition-colors mb-2"
            >
              Yol Tarifi Al
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function FlyToUser({ coords }: { coords: {lat: number, lng: number} | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 15, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

function FlyToLocation({ coords }: { coords: {lat: number, lng: number} | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 16, { animate: true, duration: 1.0 });
    }
  }, [coords, map]);
  return null;
}


export default function MapPage() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [focusLocation, setFocusLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedLocId, setSelectedLocId] = useState<string | null>(null);
  
  // Turkey center roughly
  const defaultCenter: [number, number] = [39.0, 35.0];
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    
    async function loadData() {
      try {
        const data = await fetchLocations();
        
        // Show locations first without coords, but we can't display them on the map.
        // We will incrementally update with coords.
        setLoading(false);
        setLocations(data); // In sidebar, they might show up. The map filters on lat/lng.
        
        for (let i = 0; i < data.length; i++) {
          if (!active) break;
          const loc = data[i];
          if (!loc.address) continue;
          
          const coords = await geocodeAddress(loc.address, loc.facilityType !== 'standart');
          
          if (coords && active) {
            setLocations(prev => {
              const updated = [...prev];
              updated[i] = { ...updated[i], lat: coords.lat, lng: coords.lng };
              return updated;
            });
          }
        }
      } catch (err) {
        console.error("Failed to load map data", err);
        setLoading(false);
      }
    }
    loadData();
    
    return () => { active = false; };
  }, []);

  const handleLocateUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, (err) => {
        console.error("Geolocation error:", err);
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-80 flex flex-col border-r border-slate-800 bg-slate-900 z-10 h-1/2 md:h-full">
        <div className="h-[72px] flex-shrink-0 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl sticky top-0 z-20 flex items-center px-5 space-x-4 shadow-sm">
          <Link to="/" className="p-2.5 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 active:scale-95">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-black leading-none tracking-widest text-white uppercase">GÜVENLİ NOKTALAR</h1>
            <p className="text-xs text-indigo-200/70 mt-1 font-medium tracking-wide">Şehrindeki güvenli yerleri keşfet</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={listRef}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">Veriler yükleniyor...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center text-slate-500 p-4 text-xs">
              Konum bulunamadı. Lütfen veri kaynağını kontrol edin.
            </div>
          ) : (
            locations.map((loc) => {
              const status = determineStatus(loc);
              const isSelected = selectedLocId === loc.id;
              return (
                <div 
                  id={`loc-card-${loc.id}`}
                  key={loc.id} 
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-200 group border-l-4",
                    (loc.lat && loc.lng) ? "cursor-pointer" : "opacity-60 grayscale cursor-not-allowed",
                    loc.facilityType === 'polis' ? "border-l-blue-600" :
                    loc.facilityType === 'itfaiye' ? "border-l-red-600" :
                    loc.facilityType === 'benzinlik' ? "border-l-orange-500" :
                    loc.facilityType === 'saglik' ? "border-l-rose-600" :
                    loc.facilityType === 'market' || loc.facilityType === 'food' ? "border-l-amber-500" :
                    status === 'iyi' ? "border-l-green-500" : 
                    status === 'orta' ? "border-l-yellow-500" : 
                    "border-l-slate-400", // Standard grey for non-assigned statuses that shouldn't be red
                    isSelected 
                      ? "bg-slate-800 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.15)] transform scale-[1.02]" 
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:shadow-md"
                  )}
                  onClick={() => {
                    if (loc.lat && loc.lng) {
                      setFocusLocation({ lat: loc.lat, lng: loc.lng });
                      setSelectedLocId(loc.id);
                    }
                  }}
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-slate-700/50 shadow-sm relative shadow-black/20">
                      <SafeImage src={loc.imageUrl} alt={loc.name} className="w-full h-full" fallbackIcon={MapIcon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={cn("text-sm font-bold transition-colors truncate", isSelected ? "text-indigo-400" : "text-white group-hover:text-indigo-300")}>{loc.name}</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-tight flex items-start gap-1.5 line-clamp-2">
                        <MapPin className={cn("w-3 h-3 flex-shrink-0 mt-[1px] transition-colors", isSelected ? "text-indigo-400" : "text-slate-500")} />
                        <span>{loc.address}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-auto p-4 bg-indigo-950/20 border-t border-slate-800">
          <button
            onClick={handleLocateUser}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-xs font-bold transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Konumumu Bul
          </button>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative h-1/2 md:h-full z-0">
        <MapContainer 
          center={defaultCenter} 
          zoom={6} 
          className="w-full h-full"
          zoomControl={false} // We can add custom position if needed
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {locations.map((loc) => (
            <LocationMarker 
              key={loc.id} 
              loc={loc} 
              isSelected={selectedLocId === loc.id} 
              onClick={() => {
                if (loc.lat && loc.lng) {
                  setSelectedLocId(loc.id);
                  setFocusLocation({ lat: loc.lat, lng: loc.lng });
                  
                  // Scroll sidebar to the card
                  const card = document.getElementById(`loc-card-${loc.id}`);
                  if (card && listRef.current) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }
                }
              }}
            />
          ))}

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={L.divIcon({
              className: 'custom-user-icon',
              html: `<div class="bg-blue-500 border-2 border-white w-4 h-4 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse transform -translate-x-1/2 -translate-y-1/2"></div>`,
              iconSize: [16, 16]
            })}>
              <Popup className="custom-popup" closeButton={false}>
                <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm border border-slate-700">Senin Konumun</div>
              </Popup>
            </Marker>
          )}

          <FlyToUser coords={userLocation} />
          <FlyToLocation coords={focusLocation} />
        </MapContainer>
      </div>

    </div>
  );
}
