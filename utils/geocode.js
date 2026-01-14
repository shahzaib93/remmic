const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Fetch approximate coordinates for a textual address using OpenStreetMap's free Nominatim API.
 * Returns null when no result is found or the request fails.
 */
export async function geocodeAddress(address) {
  if (!address || typeof address !== 'string') {
    return null;
  }

  const searchParams = new URLSearchParams({
    format: 'json',
    limit: '1',
    q: address,
  });

  try {
    const response = await fetch(`${NOMINATIM_ENDPOINT}?${searchParams.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      console.error('Geocoding request failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const { lat, lon } = data[0];
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null;
    }

    return {
      lat: clamp(latitude, -90, 90),
      lng: clamp(longitude, -180, 180),
      provider: 'nominatim',
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error during geocoding:', error);
    return null;
  }
}

/**
 * Construct an embeddable OpenStreetMap URL with a marker and padding around the coordinates.
 * Falls back to a search view when coordinates are missing.
 */
export function buildOpenStreetMapEmbed({ coordinates, address }) {
  if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
    const { lat, lng } = coordinates;
    const delta = 0.01;
    const south = clamp(lat - delta, -90, 90);
    const north = clamp(lat + delta, -90, 90);
    const west = clamp(lng - delta, -180, 180);
    const east = clamp(lng + delta, -180, 180);

    return {
      embedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${lat}%2C${lng}`,
      linkUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`,
    };
  }

  if (address) {
    const encoded = encodeURIComponent(address);
    return {
      embedUrl: `https://www.openstreetmap.org/export/embed.html?search=${encoded}`,
      linkUrl: `https://www.openstreetmap.org/search?query=${encoded}`,
    };
  }

  return null;
}

