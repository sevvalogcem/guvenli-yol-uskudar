import Papa from "papaparse";
import { LocationData } from "../types";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQVrXZbadE7MC5JdUIcihcP-oI7Ja24DGJ2deeBCf140RBE_y-H2YdEm7kyEVCmhtfta02Hqsz-yvZ1/pub?output=csv";

// Helper to check if a value is truthy (evet, var, true, vb.)
function isYes(val: string): boolean {
  if (!val) return false;
  const lower = val.toLowerCase().trim();
  return lower === "evet" || lower === "var" || lower === "true" || lower === "1";
}

function parseScore(val: string): number {
  if (!val) return 0;
  const num = parseInt(val, 10);
  return isNaN(num) ? 0 : num;
}

export async function fetchLocations(): Promise<LocationData[]> {
  return new Promise((resolve, reject) => {
    // Determine random cache buster
    const cacheBuster = Date.now();
    const csvWithCacheBuster = `${CSV_URL}&_t=${cacheBuster}`;

    Papa.parse(csvWithCacheBuster, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData: LocationData[] = results.data.map((row: any, index: number) => {
          // Attempt to map columns flexibly, as we don't know exact names
          const name = row["Mekan Adı"] || row["İsim"] || row["Ad"] || `Lokasyon ${index + 1}`;
          const address = row["Adres"] || row["Konum"] || "";
          const lightingStatus = row["Aydınlatma Durumu"] || row["Aydınlatma"] || "";
          const score = row["Güvenlik Puanı"] || row["Puan"] || "";
          
          let cameraPresence = row["Kamera Varlığı"] || row["Kamera"] || row["Güvenlik Kamerası"];
          
          let comments = row["Kullanıcı Yorumları"] || row["Yorumlar"] || row["Yorum"] || "";
          
          const rawCategory = row["Kategori"] || row["Tür"] || row["Mekan Türü"] || "";
          let categoryName = String(rawCategory).trim();

          // Exact column checks first to prevent picking up Maps "URL"s by accident
          let rawImageUrl = row["Gorsel_URL"] || row["Görsel URL"] || row["Görsel"] || row["Fotoğraf"] || row["Resim"] || row["Image"] || "";
          let imageUrl = String(rawImageUrl).trim();

          // Robust fallback ONLY if exact columns are empty
          if (!imageUrl) {
            for (const key in row) {
              const lowerKey = key.toLowerCase();
              // Prevent generic 'url' from matching Maps/Website links by restricting purely to image keywords
              if (lowerKey.includes("gorsel") || lowerKey.includes("görsel") || lowerKey.includes("foto") || lowerKey.includes("resim") || lowerKey.includes("image")) {
                const val = String(row[key]).trim();
                // Ensure it's not a generic map link
                if (val.startsWith("http") && !val.includes("maps.google.com/maps")) {
                  imageUrl = val;
                  break;
                }
              }
            }
          }

          // Hard match requested for Meydan Büfe specifically to force 'Gorsel_URL' override
          const lowerNameStr = name.toLowerCase();
          if (lowerNameStr.includes("meydan") || lowerNameStr.includes("meydan büfe")) {
            const specificUrl = row["Gorsel_URL"] || row["Görsel URL"] || row["Görsel"] || row["Fotoğraf"];
            if (specificUrl && String(specificUrl).trim().startsWith("http")) {
              imageUrl = String(specificUrl).trim();
            }
          }

          // Process Google Drive View Links into Direct Image Links
          if (imageUrl.includes("drive.google.com/open?id=")) {
            const match = imageUrl.match(/id=([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
               imageUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
          } else if (imageUrl.includes("drive.google.com/file/d/")) {
            const match = imageUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
               imageUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
          }

          // Force image cache bypass (optional but requested)
          if (imageUrl) {
            imageUrl += imageUrl.includes("?") ? `&_cb=${cacheBuster}` : `?_cb=${cacheBuster}`;
          }
          
          let facilityType: 'polis' | 'itfaiye' | 'benzinlik' | 'saglik' | 'market' | 'standart' = 'standart';
          const rowText = (categoryName + " " + JSON.stringify(row)).toLowerCase();
          
          if (rowText.includes('polis') || rowText.includes('emniyet')) {
            facilityType = 'polis';
            if (!categoryName) categoryName = 'Polis';
          } else if (rowText.includes('itfaiye')) {
            facilityType = 'itfaiye';
            if (!categoryName) categoryName = 'İtfaiye';
          } else if (rowText.includes('benzinlik') || rowText.includes('petrol') || rowText.includes('shell') || rowText.includes('opet') || rowText.includes('bp ')) {
            facilityType = 'benzinlik';
            if (!categoryName) categoryName = 'Benzinlik';
          } else if (rowText.includes('hastane') || rowText.includes('sağlık') || rowText.includes('saglik') || rowText.includes('hospital')) {
            facilityType = 'saglik';
            if (!categoryName) categoryName = 'Hastane / Sağlık';
          } else if (rowText.includes('market') || rowText.includes('büfe') || rowText.includes('bakkal') || rowText.includes('restoran')) {
            facilityType = 'market';
            if (!categoryName) categoryName = 'Büfe / Market';
          }

          // Strict overrides based on specific location names
          const lowerName = name.toLowerCase();
          
          // Helper to inject Uskudar address directly to ensure coordinate match for problematic ones
          const appendUskudar = () => {
             if (!address.toLowerCase().includes('üsküdar') && !address.toLowerCase().includes('uskudar')) {
               address = address ? `${address}, Üsküdar, İstanbul, Türkiye` : `${name}, Üsküdar, İstanbul, Türkiye`;
             }
          };

          if (
            lowerName.includes("total") ||
            lowerName.includes("shell libadiye") ||
            lowerName.includes("total energies bağlarbaşı") ||
            lowerName.includes("bp koşuyolu") ||
            lowerName.includes("shell harem") ||
            lowerName.includes("opet harem") ||
            lowerName.includes("gökkuşağı petrol") ||
            lowerName.includes("total altunizade") ||
            lowerName.includes("shell üsküdar")
          ) {
            facilityType = 'benzinlik';
            categoryName = categoryName && categoryName !== "" ? categoryName : 'Benzinlik';
            if (lowerName.includes("total")) appendUskudar(); // requested for Total locations
          } else if (lowerName.includes("academic hospital")) {
            facilityType = 'saglik';
            categoryName = categoryName && categoryName !== "" ? categoryName : 'Hastane';
          } else if (
            lowerName.includes("çınaraltı") ||
            lowerName.includes("cem büfe") ||
            lowerName.includes("paşa kokoreç") ||
            lowerName.includes("tandoğan büfe")
          ) {
            facilityType = 'food';
            categoryName = categoryName && categoryName !== "" ? categoryName : 'Büfe / Restoran';
            appendUskudar(); // explicitly requested to find them
          }

          return {
            id: `loc-${index}`,
            name,
            address,
            safetyScore: parseScore(score),
            lightingStatus,
            hasCamera: isYes(String(cameraPresence)),
            comments,
            facilityType,
            categoryName,
            imageUrl
          };
        });
        
        // Include standalone facilities or valid addresses
        const validLocations = parsedData.filter(loc => loc.address.length > 0 || loc.facilityType !== 'standart');
        
        // For special facilities missing an explicit address but having a name, use name as query basis
        validLocations.forEach(loc => {
          if (!loc.address) {
            loc.address = loc.name; // Fallback to name if address column is empty but it's a known facility
          }
        });

        resolve(validLocations);
      },
      error: (error) => {
        console.error("CSV parse error:", error);
        reject(error);
      },
    });
  });
}

// Simple local cache for geocoding
const CACHE_KEY = "geocode_cache_v1";

export async function geocodeAddress(address: string, appendIstanbul: boolean = false): Promise<{ lat: number; lng: number } | null> {
  let cache: Record<string, { lat: number; lng: number }> = {};
  
  try {
    cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    if (cache[address]) {
      return cache[address];
    }
  } catch (e) {
    console.warn("Failed to read cache", e);
  }

  const queryStr = appendIstanbul && !address.toLowerCase().includes("istanbul") && !address.toLowerCase().includes("türkiye")
    ? address + ", İstanbul, Türkiye"
    : address;

  const addressWithoutNo = queryStr.replace(/No:\s*\d+[a-zA-Z]*(\/\d+)?/gi, '');
  
  const attempts = [
    queryStr,
    addressWithoutNo,
    addressWithoutNo.replace(/,\s*[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+\s+(Sk\.|Sokak?|Cd\.|Caddesi)/gi, ''),
    queryStr.split(',').slice(-2).join(',').trim(), 
    queryStr.split(',').pop()?.trim() || queryStr 
  ];

  for (const q of attempts) {
    if (!q || q.trim().length === 0) continue;

    try {
      // Primary: Nominatim
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.append("q", q);
      url.searchParams.append("format", "json");
      url.searchParams.append("limit", "1");
      url.searchParams.append("countrycodes", "tr");
      
      let res;
      try {
        res = await fetch(url.toString(), {
          headers: { "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8" }
        });
      } catch (networkErr) {
        // Fallback: Photon API if Nominatim is fully blocking via CORS or Network
        console.warn("Nominatim block/error, trying Photon API fallback for:", q);
        const photonUrl = new URL("https://photon.komoot.io/api/");
        photonUrl.searchParams.append("q", q);
        photonUrl.searchParams.append("limit", "1");
        
        const pref = await fetch(photonUrl.toString());
        const pdata = await pref.json();
        
        if (pdata && pdata.features && pdata.features.length > 0) {
          const coords = { 
            lat: pdata.features[0].geometry.coordinates[1], 
            lng: pdata.features[0].geometry.coordinates[0] 
          };
          cache[address] = coords;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch(e){}
          await new Promise((r) => setTimeout(r, 1000));
          return coords;
        }
        throw networkErr; // Rethrow if photon also fails to find anything
      }
      
      const text = await res.text();
      let data = [];
      try { data = JSON.parse(text); } catch (e) { }

      if (data && data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        cache[address] = coords;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
        
        await new Promise((r) => setTimeout(r, 1100));
        return coords;
      }

      await new Promise((r) => setTimeout(r, 1100));
    } catch (err) {
      console.error("Geocoding failed for query:", q, err);
      await new Promise((r) => setTimeout(r, 2000)); 
    }
  }

  console.warn("Could not geocode even after reducing address:", address);
  return null;
}
