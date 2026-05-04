import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  ArrowLeft, Navigation,
  MapPin, Map as MapIcon, Sun, Moon, Layers, Copy, Check, Code2
} from "lucide-react";
import { Link } from "react-router-dom";
import { LocationData } from "../types";
import { fetchLocations, geocodeAddress } from "../services/dataService";
import { cn } from "../lib/utils";
import { useTheme } from "../context/ThemeContext";

// ── Tile Layers ────────────────────────────────────────────
const TILE_LAYERS = {
  dark: {
    label: "Gece",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  light: {
    label: "Gündüz",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  satellite: {
    label: "Uydu",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  streets: {
    label: "Sokak",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
} as const;

type TileKey = keyof typeof TILE_LAYERS;

// ── SafeImage ──────────────────────────────────────────────
function SafeImage({ src, alt, className, fallbackIcon: FallbackIcon }: { src?: string; alt: string; className?: string; fallbackIcon: any }) {
  const [error, setError] = useState(false);
  useEffect(() => { setError(false); }, [src]);
  if (!src || error) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-slate-800 text-slate-500", className)}>
        <FallbackIcon className="w-1/2 h-1/2 opacity-30" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={cn(className, "object-cover")} onError={() => setError(true)} referrerPolicy="no-referrer" />;
}

// ── Custom Icons ───────────────────────────────────────────
const createCustomIcon = (status: 'iyi' | 'orta' | 'kötü' | 'unknown', facilityType?: string) => {
  let colorClass = "bg-slate-500";
  let svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

  if (facilityType === 'polis') { colorClass = "bg-blue-600"; svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`; }
  else if (facilityType === 'itfaiye') { colorClass = "bg-red-600"; svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4 text-white"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>`; }
  else if (facilityType === 'benzinlik') { colorClass = "bg-orange-500"; svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4 text-white"><line x1="3" y1="22" x2="15" y2="22"></line><line x1="4" y1="9" x2="14" y2="9"></line><path d="M14 22V4a2 2 0 00-2-2H6a2 2 0 00-2 2v18"></path><path d="M14 13h2a2 2 0 012 2v2a2 2 0 002 2h0a2 2 0 002-2V9.83a2 2 0 00-.59-1.42L18 5"></path></svg>`; }
  else if (facilityType === 'saglik') { colorClass = "bg-rose-600"; svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4 text-white"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`; }
  else if (facilityType === 'market' || facilityType === 'food') { colorClass = "bg-amber-500"; svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4 text-white"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path></svg>`; }

  return L.divIcon({
    className: "custom-div-icon",
    html: `<div class="${colorClass} w-full h-full rounded-full border-[2.5px] border-white shadow-md flex items-center justify-center transition-transform hover:scale-110">${svgIcon}</div>`,
    iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16],
  });
};

const renderCategoryBadge = (name?: string, type?: string) => {
  if (!name) return null;
  let colors = "bg-slate-500/20 text-slate-400";
  if (type === 'polis') colors = "bg-blue-600/20 text-blue-400";
  else if (type === 'itfaiye') colors = "bg-red-600/20 text-red-400";
  else if (type === 'benzinlik') colors = "bg-orange-500/20 text-orange-400";
  else if (type === 'saglik') colors = "bg-rose-600/20 text-rose-400";
  else if (type === 'market' || type === 'food') colors = "bg-amber-500/20 text-amber-400";
  return <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap", colors)}>{name}</span>;
};

function determineStatus(loc: LocationData): 'iyi' | 'orta' | 'kötü' | 'unknown' {
  const lighting = loc.lightingStatus?.toLowerCase() || "";
  const score = loc.safetyScore || 0;
  if (lighting.includes("iyi") || score >= 8) return 'iyi';
  if (lighting.includes("orta") || (score >= 5 && score < 8)) return 'orta';
  if (lighting.includes("kötü") || (score > 0 && score < 5)) return 'kötü';
  return 'unknown';
}

function LocationMarker({ loc, isSelected, onClick }: { loc: LocationData; key?: React.Key; isSelected?: boolean; onClick?: () => void }) {
  if (loc.lat === undefined || loc.lng === undefined) return null;
  const markerRef = useRef<L.Marker>(null);
  useEffect(() => {
    if (isSelected && markerRef.current) setTimeout(() => markerRef.current?.openPopup(), 500);
  }, [isSelected]);

  return (
    <Marker position={[loc.lat, loc.lng]} icon={createCustomIcon(determineStatus(loc), loc.facilityType)} ref={markerRef} eventHandlers={{ click: onClick }}>
      <Popup className="custom-popup" closeButton={false}>
        <div className="w-64 text-slate-100 p-0 rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/50 backdrop-blur-md" style={{ background: "var(--popup-bg)" }}>
          <div className="w-full h-40 relative overflow-hidden rounded-t-2xl">
            <SafeImage src={loc.imageUrl} alt={loc.name} className="w-full h-full rounded-t-2xl" fallbackIcon={MapIcon} />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
          <div className="p-4 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{loc.name}</h4>
              {renderCategoryBadge(loc.categoryName, loc.facilityType)}
            </div>
            <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>{loc.address}</p>
            {loc.comments && <p className="text-[11px] italic border-t pt-2 mb-3" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>"{loc.comments}"</p>}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
              target="_blank" rel="noreferrer"
              className="block w-full text-white text-center py-2 rounded text-xs font-bold transition-colors"
              style={{ background: "var(--accent)" }}
            >
              Yol Tarifi Al
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function FlyToUser({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo([coords.lat, coords.lng], 15, { animate: true, duration: 1.5 }); }, [coords, map]);
  return null;
}
function FlyToLocation({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo([coords.lat, coords.lng], 16, { animate: true, duration: 1.0 }); }, [coords, map]);
  return null;
}

// ── Harita Stil Seçici ─────────────────────────────────────
function MapStylePicker({ current, onChange }: { current: TileKey; onChange: (k: TileKey) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute bottom-6 right-4 z-[1000]">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border shadow-lg transition-all hover:scale-105"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
      >
        <Layers className="w-4 h-4" style={{ color: "var(--accent)" }} />
        {TILE_LAYERS[current].label}
      </button>
      {open && (
        <div
          className="absolute bottom-full right-0 mb-2 p-2 rounded-xl border shadow-2xl flex flex-col gap-1 min-w-[120px]"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
        >
          {(Object.keys(TILE_LAYERS) as TileKey[]).map(key => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false); }}
              className="px-3 py-2 rounded-lg text-xs font-medium text-left transition-all hover:scale-105"
              style={{
                background: current === key ? "var(--accent-bg)" : "transparent",
                color: current === key ? "var(--accent-hover)" : "var(--text-secondary)",
              }}
            >
              {TILE_LAYERS[key].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Embed Butonu ───────────────────────────────────────────
function EmbedButton() {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const embedCode = `<iframe src="${window.location.origin}/embed" width="100%" height="500" style="border:none;border-radius:12px;" allowfullscreen></iframe>`;

  const copy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border shadow-lg transition-all hover:scale-105"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
      >
        <Code2 className="w-4 h-4" style={{ color: "var(--accent)" }} />
        Göm
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-2 p-4 rounded-2xl border shadow-2xl z-[1001] w-72"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
        >
          <p className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>Haritayı Sitene Göm</p>
          <code className="block text-[10px] p-2 rounded-lg mb-3 break-all leading-relaxed" style={{ background: "var(--bg-base)", color: "var(--text-secondary)" }}>
            {embedCode}
          </code>
          <button
            onClick={copy}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-white transition-all"
            style={{ background: "var(--accent)" }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Kopyalandı!" : "Kodu Kopyala"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Ana Bileşen ────────────────────────────────────────────
export default function MapPage() {
  const { theme, toggleTheme } = useTheme();
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocId, setSelectedLocId] = useState<string | null>(null);
  const [tileKey, setTileKey] = useState<TileKey>(() => {
    const saved = localStorage.getItem("gy-map-style") as TileKey | null;
    return saved && TILE_LAYERS[saved] ? saved : (theme === "dark" ? "dark" : "light");
  });
  const defaultCenter: [number, number] = [41.023, 29.015]; // Üsküdar merkezi
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem("gy-map-style", tileKey); }, [tileKey]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const data = await fetchLocations();
        setLoading(false);
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
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => console.error("Geolocation error:", err)
      );
    }
  };

  const tile = TILE_LAYERS[tileKey];

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden font-sans" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>

      {/* ── Sidebar ── */}
      <div className="w-full md:w-80 flex flex-col border-r z-10 h-1/2 md:h-full" style={{ borderColor: "var(--border-color)", background: "var(--sidebar-bg)" }}>
        {/* Header */}
        <div className="h-[72px] flex-shrink-0 border-b sticky top-0 z-20 flex items-center px-5 space-x-3 shadow-sm"
          style={{ borderColor: "var(--border-color)", background: "var(--header-bg)", backdropFilter: "blur(16px)" }}>
          <Link to="/" className="p-2.5 rounded-lg hover:opacity-80 transition-all active:scale-95 shadow-lg" style={{ background: "var(--accent)" }}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black leading-none tracking-widest uppercase" style={{ color: "var(--text-primary)" }}>GÜVENLİ NOKTALAR</h1>
            <p className="text-[11px] mt-0.5 font-medium tracking-wide truncate" style={{ color: "var(--accent-hover)", opacity: 0.8 }}>Üsküdar · Güvenli Yerleri Keşfet</p>
          </div>
          {/* Theme + Embed toggles */}
          <div className="flex items-center gap-2">
            <EmbedButton />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border transition-all hover:scale-110 active:scale-95"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
              aria-label="Tema değiştir"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={listRef}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3" style={{ color: "var(--text-muted)" }}>
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
              <p className="text-xs">Veriler yükleniyor...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center p-4 text-xs" style={{ color: "var(--text-muted)" }}>Konum bulunamadı.</div>
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
                    (loc.lat && loc.lng) ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                    loc.facilityType === 'polis' ? "border-l-blue-600" :
                    loc.facilityType === 'itfaiye' ? "border-l-red-600" :
                    loc.facilityType === 'benzinlik' ? "border-l-orange-500" :
                    loc.facilityType === 'saglik' ? "border-l-rose-600" :
                    loc.facilityType === 'market' || loc.facilityType === 'food' ? "border-l-amber-500" :
                    status === 'iyi' ? "border-l-green-500" :
                    status === 'orta' ? "border-l-yellow-500" : "border-l-slate-400",
                  )}
                  style={{
                    background: isSelected ? "var(--bg-surface)" : "var(--card-bg)",
                    borderColor: isSelected ? "var(--accent)" : "var(--border-color-subtle)",
                    transform: isSelected ? "scale(1.02)" : undefined,
                    boxShadow: isSelected ? "0 0 15px var(--shadow-accent)" : undefined,
                  }}
                  onClick={() => {
                    if (loc.lat && loc.lng) {
                      setFocusLocation({ lat: loc.lat, lng: loc.lng });
                      setSelectedLocId(loc.id);
                    }
                  }}
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border shadow-sm" style={{ borderColor: "var(--border-color-subtle)" }}>
                      <SafeImage src={loc.imageUrl} alt={loc.name} className="w-full h-full" fallbackIcon={MapIcon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold truncate transition-colors" style={{ color: isSelected ? "var(--accent-hover)" : "var(--text-primary)" }}>{loc.name}</h3>
                      <p className="text-xs flex items-start gap-1.5 line-clamp-2 mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        <MapPin className="w-3 h-3 flex-shrink-0 mt-[1px]" style={{ color: isSelected ? "var(--accent)" : "var(--text-muted)" }} />
                        <span>{loc.address}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Locate Button */}
        <div className="p-4 border-t" style={{ borderColor: "var(--border-color)", background: "var(--accent-bg)" }}>
          <button
            onClick={handleLocateUser}
            className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-lg text-xs font-bold transition-colors hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            <Navigation className="w-4 h-4" />
            Konumumu Bul
          </button>
        </div>
      </div>

      {/* ── Harita ── */}
      <div className="flex-1 relative h-1/2 md:h-full z-0">
        <MapContainer center={defaultCenter} zoom={13} className="w-full h-full" zoomControl={true}>
          <TileLayer attribution={tile.attribution} url={tile.url} />
          {locations.map(loc => (
            <LocationMarker
              key={loc.id}
              loc={loc}
              isSelected={selectedLocId === loc.id}
              onClick={() => {
                if (loc.lat && loc.lng) {
                  setSelectedLocId(loc.id);
                  setFocusLocation({ lat: loc.lat, lng: loc.lng });
                  const card = document.getElementById(`loc-card-${loc.id}`);
                  if (card && listRef.current) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }}
            />
          ))}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={L.divIcon({
              className: 'custom-user-icon',
              html: `<div class="bg-blue-500 border-2 border-white w-4 h-4 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse transform -translate-x-1/2 -translate-y-1/2"></div>`,
              iconSize: [16, 16],
            })}>
              <Popup className="custom-popup" closeButton={false}>
                <div className="px-3 py-2 rounded-lg text-sm border" style={{ background: "var(--bg-surface)", color: "var(--text-primary)", borderColor: "var(--border-color)" }}>Senin Konumun</div>
              </Popup>
            </Marker>
          )}
          <FlyToUser coords={userLocation} />
          <FlyToLocation coords={focusLocation} />
        </MapContainer>

        {/* Map Style Picker */}
        <MapStylePicker current={tileKey} onChange={setTileKey} />
      </div>
    </div>
  );
}
