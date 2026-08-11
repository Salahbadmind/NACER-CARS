/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParsedLocation {
  lat: number;
  lng: number;
  placeName?: string;
  embedUrl: string;
  directMapsUrl: string;
  isCustomCoords?: boolean;
}

// Default showroom coordinates in Echatt, Annaba, Algeria
export const DEFAULT_ALGERIA_COORDS = {
  lat: 36.9350,
  lng: 7.8680,
  placeName: 'معرض السيارات - الشط، عنابة، الجزائر'
};

/**
 * Converts DMS (Degrees Minutes Seconds) like 36°46'00.2"N 2°56'53.6"E to decimal coordinates
 */
export function parseDMS(dmsStr: string): { lat: number; lng: number } | null {
  try {
    const dmsRegex = /([0-9]{1,3})[°\s]+([0-9]{1,2})['\s]+([0-9]{1,2}(?:\.[0-9]+)?)["]?\s*([NSEWnsew])/g;
    const matches = [...dmsStr.matchAll(dmsRegex)];
    if (matches.length >= 2) {
      const parts = matches.map(m => {
        const deg = parseFloat(m[1]);
        const min = parseFloat(m[2]);
        const sec = parseFloat(m[3]);
        const dir = m[4].toUpperCase();
        let dec = deg + min / 60 + sec / 3600;
        if (dir === 'S' || dir === 'W') dec = -dec;
        return { dec, dir };
      });
      const latPart = parts.find(p => p.dir === 'N' || p.dir === 'S');
      const lngPart = parts.find(p => p.dir === 'E' || p.dir === 'W');
      if (latPart && lngPart) {
        return { lat: parseFloat(latPart.dec.toFixed(6)), lng: parseFloat(lngPart.dec.toFixed(6)) };
      }
    }
  } catch (e) {}
  return null;
}

/**
 * Extracts numeric latitude and longitude from any URL, text, or string using multiple robust pattern matchers.
 */
export function extractCoordinatesFromUrl(rawText: string): { lat: number; lng: number } | null {
  if (!rawText) return null;

  // Unescape/decode URL multiple passes (e.g. %213d, %40, %2C, %26)
  let text = rawText;
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(text);
      if (decoded === text) break;
      text = decoded;
    } catch {
      break;
    }
  }

  // Pattern A: Protobuf !3d<lat>!4d<lng> or !3d<lat>&4d<lng>
  const proto3d4d = text.match(/!3d(-?\d{1,2}(?:\.\d+)?)[!&]4d(-?\d{1,3}(?:\.\d+)?)/i);
  if (proto3d4d) {
    const lat = parseFloat(proto3d4d[1]);
    const lng = parseFloat(proto3d4d[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Pattern B: Protobuf !2d<lng>!3d<lat> or !2d<lng>&3d<lat>
  const proto2d3d = text.match(/!2d(-?\d{1,3}(?:\.\d+)?)[!&]3d(-?\d{1,2}(?:\.\d+)?)/i);
  if (proto2d3d) {
    const lng = parseFloat(proto2d3d[1]);
    const lat = parseFloat(proto2d3d[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Pattern C: @<lat>,<lng> in Google Maps URLs (e.g. @36.935,7.868,17z)
  const atMatch = text.match(/@(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/i);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Pattern D: query parameters: q=36.935,7.868 or ll=... or loc:... or center=... or destination=... or query=...
  const queryMatch = text.match(/[?&;](?:q|ll|query|loc|center|destination|daddr|sll)=(?:loc:)?(-?\d{1,2}(?:\.\d+)?)[,\s+]+(-?\d{1,3}(?:\.\d+)?)/i);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Pattern E: path coordinates like /place/.../36.935,7.868 or /dir/.../36.935,7.868 or /search/36.935,7.868
  const pathCoordsMatch = text.match(/\/(?:place|dir|search)\/[^/]*?\/(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/i);
  if (pathCoordsMatch) {
    const lat = parseFloat(pathCoordsMatch[1]);
    const lng = parseFloat(pathCoordsMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Pattern F: Direct decimal coordinates: "36.935, 7.868" or "36.935 7.868" or "36.935;7.868"
  const directMatch = text.match(/^\s*(-?\d{1,2}(?:\.\d+)?)[,\s;]+(-?\d{1,3}(?:\.\d+)?)\s*$/);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Pattern G: OpenStreetMap #map=17/lat/lng
  const osmMatch = text.match(/#map=\d+\/(-?\d{1,2}(?:\.\d+)?)\/(-?\d{1,3}(?:\.\d+)?)/i);
  if (osmMatch) {
    const lat = parseFloat(osmMatch[1]);
    const lng = parseFloat(osmMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Pattern H: Check DMS coordinates
  const dms = parseDMS(text);
  if (dms) return dms;

  return null;
}

/**
 * Parses any Google Maps URL, shortlink, iframe code, GPS coordinates, or text address
 * into a precision embeddable URL and direct navigation coordinates.
 */
export function parseMapLocation(input?: string, fallbackAddress?: string): ParsedLocation {
  const clean = (input || '').trim();
  const address = (fallbackAddress || 'الشط، عنابة، الجزائر').trim();

  if (!clean) {
    return {
      lat: DEFAULT_ALGERIA_COORDS.lat,
      lng: DEFAULT_ALGERIA_COORDS.lng,
      placeName: address,
      embedUrl: `https://maps.google.com/maps?q=${DEFAULT_ALGERIA_COORDS.lat},${DEFAULT_ALGERIA_COORDS.lng}&hl=ar&z=16&output=embed`,
      directMapsUrl: `https://www.google.com/maps?q=${DEFAULT_ALGERIA_COORDS.lat},${DEFAULT_ALGERIA_COORDS.lng}`,
      isCustomCoords: false
    };
  }

  // 1. If user pasted an <iframe> HTML snippet, extract src
  if (clean.includes('<iframe')) {
    const srcMatch = clean.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      const src = srcMatch[1];
      const coords = extractCoordinatesFromUrl(src);
      if (coords) {
        return {
          lat: coords.lat,
          lng: coords.lng,
          embedUrl: src,
          directMapsUrl: `https://www.google.com/maps?q=${coords.lat},${coords.lng}`,
          isCustomCoords: true
        };
      }
      return {
        lat: DEFAULT_ALGERIA_COORDS.lat,
        lng: DEFAULT_ALGERIA_COORDS.lng,
        embedUrl: src,
        directMapsUrl: src,
        isCustomCoords: true
      };
    }
  }

  // 2. Extract direct numeric coords from any part of the string or URL
  const coords = extractCoordinatesFromUrl(clean);
  if (coords) {
    return {
      lat: coords.lat,
      lng: coords.lng,
      embedUrl: `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=ar&z=16&output=embed`,
      directMapsUrl: clean.startsWith('http') ? clean : `https://www.google.com/maps?q=${coords.lat},${coords.lng}`,
      isCustomCoords: true
    };
  }

  // 3. If already an official embed URL (e.g. google.com/maps/embed or output=embed)
  if (clean.includes('maps/embed') || clean.includes('output=embed')) {
    const embedCoords = extractCoordinatesFromUrl(clean);
    return {
      lat: embedCoords?.lat || DEFAULT_ALGERIA_COORDS.lat,
      lng: embedCoords?.lng || DEFAULT_ALGERIA_COORDS.lng,
      embedUrl: clean,
      directMapsUrl: embedCoords ? `https://www.google.com/maps?q=${embedCoords.lat},${embedCoords.lng}` : clean,
      isCustomCoords: true
    };
  }

  // 4. Place name in /place/Place+Name/...
  if (clean.includes('/place/')) {
    const placeMatch = clean.match(/\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      const decodedName = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ');
      return {
        lat: DEFAULT_ALGERIA_COORDS.lat,
        lng: DEFAULT_ALGERIA_COORDS.lng,
        placeName: decodedName,
        embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(decodedName)}&hl=ar&z=16&output=embed`,
        directMapsUrl: clean.startsWith('http') ? clean : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(decodedName)}`,
        isCustomCoords: true
      };
    }
  }

  // 5. General search query: q=... or /search/...
  const generalQueryMatch = clean.match(/[?&]q=([^&]+)/i) || clean.match(/\/search\/([^/?]+)/i);
  if (generalQueryMatch && generalQueryMatch[1]) {
    const decoded = decodeURIComponent(generalQueryMatch[1]).replace(/\+/g, ' ');
    if (!decoded.startsWith('http')) {
      return {
        lat: DEFAULT_ALGERIA_COORDS.lat,
        lng: DEFAULT_ALGERIA_COORDS.lng,
        placeName: decoded,
        embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(decoded)}&hl=ar&z=16&output=embed`,
        directMapsUrl: clean.startsWith('http') ? clean : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(decoded)}`,
        isCustomCoords: true
      };
    }
  }

  // 6. Plain text address or city
  if (!clean.startsWith('http')) {
    return {
      lat: DEFAULT_ALGERIA_COORDS.lat,
      lng: DEFAULT_ALGERIA_COORDS.lng,
      placeName: clean,
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(clean)}&hl=ar&z=16&output=embed`,
      directMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clean)}`,
      isCustomCoords: true
    };
  }

  // 7. For shortened HTTP links (e.g. maps.app.goo.gl or goo.gl/maps), produce an immediate provisional embed & direct link
  return {
    lat: DEFAULT_ALGERIA_COORDS.lat,
    lng: DEFAULT_ALGERIA_COORDS.lng,
    placeName: address,
    embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(address)}&hl=ar&z=16&output=embed`,
    directMapsUrl: clean,
    isCustomCoords: false
  };
}

/**
 * Asynchronously resolves shortened links (e.g. maps.app.goo.gl) via the server endpoint.
 */
export async function resolveMapLocationAsync(inputUrl: string, fallbackAddress?: string): Promise<ParsedLocation> {
  const clean = (inputUrl || '').trim();
  const synchronousParsed = parseMapLocation(clean, fallbackAddress);

  // If we already resolved custom coordinates or embed URL synchronously, return immediately
  if (synchronousParsed.isCustomCoords && !clean.includes('maps.app.goo.gl') && !clean.includes('goo.gl/maps') && !clean.includes('g.page')) {
    return synchronousParsed;
  }

  // If it's an HTTP URL (including shortlinks), ask backend to resolve redirect and extract coordinates
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const res = await fetch('/api/resolve-map-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: clean, address: fallbackAddress })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lat && data.lng) {
          return {
            lat: data.lat,
            lng: data.lng,
            placeName: data.placeName || synchronousParsed.placeName,
            embedUrl: data.embedUrl || `https://maps.google.com/maps?q=${data.lat},${data.lng}&hl=ar&z=16&output=embed`,
            directMapsUrl: data.directMapsUrl || (clean.startsWith('http') ? clean : `https://www.google.com/maps?q=${data.lat},${data.lng}`),
            isCustomCoords: true
          };
        }
        if (data.embedUrl) {
          return {
            lat: data.lat || synchronousParsed.lat,
            lng: data.lng || synchronousParsed.lng,
            placeName: data.placeName || synchronousParsed.placeName,
            embedUrl: data.embedUrl,
            directMapsUrl: data.directMapsUrl || clean,
            isCustomCoords: true
          };
        }
      }
    } catch (e) {
      console.warn('Could not resolve map URL via server endpoint:', e);
    }
  }

  return synchronousParsed;
}
