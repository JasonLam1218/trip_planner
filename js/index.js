// index.js

// --------- CONFIGURATION ---------
const apiKey = '3093a86a55c04f38a88f76f5b7e3341d'; // <-- Your Geoapify API key
const defaultLat = 22.3193;    // Hong Kong latitude
const defaultLon = 114.1694;   // Hong Kong longitude
const defaultRadius = 10000;   // 10km radius
const placeCategory = 'tourism.sights'; // Tourist attractions

// --------- DOM ELEMENTS ---------
const grid = document.querySelector('.places-grid');

// --------- HELPER FUNCTIONS ---------

/**
 * Fetches famous places from Geoapify Places API.
 * @param {number} lat Latitude.
 * @param {number} lon Longitude.
 * @param {number} radius Search radius in meters.
 * @param {string} category Geoapify category (e.g., 'tourism.sights').
 */
async function fetchFamousPlaces(lat, lon, radius, category) {
    const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},${radius}&limit=18&apiKey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Network response was not ok:', response.status); // Log error status
      throw new Error('Failed to fetch places');
    }
    const data = await response.json();
    console.log('Fetched data:', data); // Log the fetched data
    return data.features;
}
  
/**
 * Returns the best image URL for a place, or a fallback.
 * @param {object} properties Geoapify place properties.
 */
async function getPlaceImage(properties) {
    // Try Geoapify's wiki/media image if available
    if (
      properties.details &&
      properties.details.wiki_and_media &&
      properties.details.wiki_and_media.image
    ) {
      return properties.details.wiki_and_media.image;
    }
    // Try fetching from Wikipedia if a Wikipedia link exists
    if (properties.wikipedia) {
      const image = await fetchWikipediaImage(properties.wikipedia);
      if (image) return image;
    }
    // Fallback: use a default image or a placeholder service
    return 'https://placehold.co/180x120?text=No+Image';
}

async function fetchWikipediaImage(wikipediaUrl) {
    if (!wikipediaUrl) return null;
    const title = wikipediaUrl.split('/').pop();
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) return null;
    const data = await response.json();
    return data.thumbnail ? data.thumbnail.source : null;
}

/**
 * Renders a single place card.
 * @param {object} place Geoapify place feature.
 */
function renderPlaceCard(place) {
  const name = place.properties.name || 'Unknown Place';
  const address = place.properties.formatted || '';
  const imageUrl = getPlaceImage(place.properties);

  const card = document.createElement('div');
  card.className = 'place-card';
  card.innerHTML = `
    <img src="${imageUrl}" alt="${name}">
    <h3>${name}</h3>
    <p>${address}</p>
  `;
  grid.appendChild(card);
}

/**
 * Clears the grid and renders all places.
 * @param {Array} places Array of Geoapify place features.
 */
function renderPlacesGrid(places) {
  grid.innerHTML = '';
  if (places.length === 0) {
    grid.innerHTML = '<p>No places found in this area.</p>';
    return;
  }
  places.forEach(renderPlaceCard);
}

// --------- MAIN LOGIC ---------

// On page load, fetch and display famous places
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Optionally, you could get user's location here for a more dynamic experience
    const places = await fetchFamousPlaces(defaultLat, defaultLon, defaultRadius, placeCategory);
    renderPlacesGrid(places);
  } catch (err) {
    grid.innerHTML = `<p style="color: red;">${err.message}</p>`;
  }
});
