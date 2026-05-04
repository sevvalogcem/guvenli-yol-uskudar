import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, Map as MapIcon, Navigation } from "lucide-react";
import { LocationData } from "../types";
import { fetchLocations, geocodeAddress } from "../services/dataService";
import { cn } from "../lib/utils";

// Minimal embed: sadece harita, sidebar yok, küçük branding

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function createIcon(facilityType?: string) {
  const colors: Record<string, string> = {
    polis: "bg-blue-600", itfaiye: "bg-red-600", benzinlik: "bg-orange-500",
    saglik: "bg-rose-600", market: "bg-amber-500", food: "bg-amber-500",
  };
  const color = colors[facilityType || ""] || "bg-indigo-600";
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div class="${color} w-full h-full rounded-full border-2 border-white shadow-md"></div>`,
    iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -12],
  });
}

function FlyTo({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 14, { animate: true, duration: 1.2 }); }, [coords, map]);
  return null;
}

export default function EmbedPage() {
  const [locations, setLocations] = useState<LocationData[]>([]);

  // URL query params: ?lat=41.02&lng=29.01&zoom=14
  const params = new URLSearchParams(window.location.search);
  const initLat = parseFloat(params.get("lat") || "41.023");
  const initLng = parseFloat(params.get("lng") || "29.015");
  const initZoom = parseInt(params.get("zoom") || "13", 10);
  const [focusCoords, setFocusCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await fetchLocations();
        setLocations(data);
        for (let i = 0; i < data.length; i++) {
          if (!active) break;
          const loc = data[i];
          if (!loc.address) continue;
          const coords = await geocodeAddress(loc.address, loc.facilityType !== 'standart');
          if (coords && active) {
            setLocations(prev => { const u = [...prev]; u[i] = { ...u[i], lat: coords.lat, lng: coords.lng }; return u; });
          }
        }
      } catch (e) { console.error(e); }
    }
    load();
    return () => { active = false; };
  }, []);

  return (
    <div className="w-full h-screen relative" style={{ background: "#0f172a" }}>
      <MapContainer
        center={[initLat, initLng]}
        zoom={initZoom}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer attribution={TILE_ATTR} url={TILE_URL} />
        {locations.map(loc => {
          if (!loc.lat || !loc.lng) return null;
          return (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={createIcon(loc.facilityType)}
              eventHandlers={{ click: () => setFocusCoords([loc.lat!, loc.lng!]) }}
            >
              <Popup className="custom-popup" closeButton={false}>
                <div className="w-52 rounded-xl overflow-hidden shadow-xl border border-indigo-500/40 text-slate-100" style={{ background: "rgba(15,23,42,0.95)" }}>
                  <div className="p-3">
                    <h4 className="text-xs font-bold mb-0.5 text-white">{loc.name}</h4>
                    <p className="text-[10px] text-slate-400 mb-2">{loc.address}</p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                      target="_blank" rel="noreferrer"
                      className="block w-full text-center text-white text-[10px] font-bold py-1.5 rounded-lg"
                      style={{ background: "#6366f1" }}
                    >
                      Yol Tarifi Al
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <FlyTo coords={focusCoords} />
      </MapContainer>

      {/* Branding */}
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)" }}>
        <Navigation className="w-3 h-3 text-indigo-400" />
        <span className="text-[10px] font-bold text-slate-200">Güvenli Yol Üsküdar</span>
      </div>
    </div>
  );
}
