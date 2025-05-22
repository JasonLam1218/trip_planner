const apiKey = '3093a86a55c04f38a88f76f5b7e3341d'; // Your Geoapify API key
const placeCategory = 'tourism.sights';
const defaultRadius = 10000; // 10km

document.addEventListener('DOMContentLoaded', function() {
  const grid = document.querySelector('.places-grid');
  const searchInput = document.getElementById('location-search');
  const autocompleteResults = document.getElementById('autocomplete-results');
  let currentSuggestions = [];
  let debounceTimer = null;

  // ---- Autocomplete logic ----
  searchInput.addEventListener('input', function() {
    const value = searchInput.value.trim();
    clearTimeout(debounceTimer);
    autocompleteResults.innerHTML = '';
    autocompleteResults.style.display = 'none';
    if (value.length < 2) return;
    debounceTimer = setTimeout(() => {
      fetchAutocompleteSuggestions(value);
    }, 250);
  });

  async function fetchAutocompleteSuggestions(query) {
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&apiKey=${apiKey}`;
    console.log("Fetching autocomplete:", url);
    try {
      const response = await fetch(url);
      console.log("Autocomplete response status:", response.status);
      if (!response.ok) {
        console.error("Autocomplete API error:", response.status, response.statusText);
        return;
      }
      const data = await response.json();
      console.log("Autocomplete data:", data);
      currentSuggestions = data.features;
      renderAutocomplete(currentSuggestions);
    } catch (err) {
      console.error("Autocomplete fetch error:", err);
    }
  }

  function renderAutocomplete(suggestions) {
    autocompleteResults.innerHTML = '';
    if (!suggestions.length) {
      autocompleteResults.style.display = 'none';
      return;
    }
    suggestions.forEach((feature, idx) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.textContent = feature.properties.formatted;
      item.addEventListener('click', () => {
        searchInput.value = feature.properties.formatted;
        autocompleteResults.innerHTML = '';
        autocompleteResults.style.display = 'none';
        handleLocationSelect(feature);
      });
      autocompleteResults.appendChild(item);
    });
    autocompleteResults.style.display = 'block';
  }

  // Hide autocomplete when clicking outside
  document.addEventListener('click', function(e) {
    if (!autocompleteResults.contains(e.target) && e.target !== searchInput) {
      autocompleteResults.style.display = 'none';
    }
  });

  // ---- Fetch and display places after selecting a suggestion ----
  async function handleLocationSelect(feature) {
    const [lon, lat] = feature.geometry.coordinates;
    grid.innerHTML = '<div style="color:#a259ff;font-size:1.2rem;">Loading...</div>';
    try {
      const places = await fetchFamousPlaces(lat, lon, defaultRadius, placeCategory);
      await renderPlacesGrid(places);
    } catch (err) {
      console.error("Places fetch error:", err);
      grid.innerHTML = `<div style="color:red;">${err.message}</div>`;
    }
  }

  // ---- Place fetching and rendering ----
  async function fetchFamousPlaces(lat, lon, radius, category) {
    const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},${radius}&limit=18&apiKey=${apiKey}`;
    console.log("Fetching places:", url);
    const response = await fetch(url);
    console.log("Places response status:", response.status);
    if (!response.ok) {
      console.error("Places API error:", response.status, response.statusText);
      throw new Error('Failed to fetch places');
    }
    const data = await response.json();
    console.log("Places data:", data);
    return data.features;
  }

  async function getPlaceImage(properties) {
    if (
      properties.details &&
      properties.details.wiki_and_media &&
      properties.details.wiki_and_media.image
    ) {
      return properties.details.wiki_and_media.image;
    }
    if (properties.wikipedia) {
      const image = await fetchWikipediaImage(properties.wikipedia);
      if (image) return image;
    }
    return 'https://placehold.co/180x120?text=No+Image';
  }

  async function fetchWikipediaImage(wikipediaUrl) {
    if (!wikipediaUrl) return null;
    const title = wikipediaUrl.split('/').pop();
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) return null;
      const data = await response.json();
      return data.thumbnail ? data.thumbnail.source : null;
    } catch {
      return null;
    }
  }

  async function renderPlaceCard(place) {
    const name = place.properties.name || 'Unknown Place';
    const address = place.properties.formatted || '';
    const imageUrl = await getPlaceImage(place.properties);
    const card = document.createElement('div');
    card.className = 'place-card';
    card.innerHTML = `
      <img src="${imageUrl}" alt="Place image">
      <h3>${name}</h3>
      <p>${address}</p>
    `;
    grid.appendChild(card);
  }

  async function renderPlacesGrid(places) {
    grid.innerHTML = '';
    if (places.length === 0) {
      grid.innerHTML = '<div style="color:#ccc;">No places found in this area.</div>';
      return;
    }
    await Promise.all(places.map(renderPlaceCard));
  }

  // ---- On page load, show nothing ----
  grid.innerHTML = '';
});
