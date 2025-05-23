const apiKey = '3093a86a55c04f38a88f76f5b7e3341d'; // Geoapify API key
const pexelsApiKey = '3ALWgUIgB3TKe9XKjiHc7PnviX2JLZFf5saoKL0HCDZMVJYOZWaSvRKi'; // Pexels API key
const placeCategory = 'tourism.sights';
const defaultRadius = 10000; // 10km

document.addEventListener('DOMContentLoaded', function() {
  const grid = document.querySelector('.places-grid');
  const searchInput = document.getElementById('location-search');
  const autocompleteResults = document.getElementById('autocomplete-results');
  const mainContent = document.getElementById('main-content');
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
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Autocomplete API error:", response.status, response.statusText);
        return;
      }
      const data = await response.json();
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
    suggestions.forEach((feature) => {
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
    const placeName = feature.properties.name || feature.properties.city || feature.properties.formatted;
    grid.innerHTML = '<div class="loading">Loading places...</div>';
    setMainBgImageFromPexels(placeName);

    // Fetch places from Geoapify
    const placesUrl = `https://api.geoapify.com/v2/places?categories=${placeCategory}&filter=circle:${lon},${lat},${defaultRadius}&limit=12&apiKey=${apiKey}`;
    try {
      const response = await fetch(placesUrl);
      if (!response.ok) {
        grid.innerHTML = '<div class="error">Failed to load places.</div>';
        return;
      }
      const data = await response.json();
      renderPlacesGrid(data.features);
    } catch (err) {
      grid.innerHTML = '<div class="error">Failed to load places.</div>';
    }
  }

  // Render all places in a grid
  function renderPlacesGrid(places) {
    grid.innerHTML = '';
    if (places.length === 0) {
      grid.innerHTML = '<div class="no-results">No places found.</div>';
      return;
    }
    places.forEach(place => {
      const card = document.createElement('div');
      card.className = 'place-card';

      const name = place.properties.name || 'Unnamed Place';
      const address = place.properties.formatted || '';
      const imgSrc = place.properties.datasource && place.properties.datasource.raw && place.properties.datasource.raw.image
        ? place.properties.datasource.raw.image
        : 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200';

      card.innerHTML = `
        <img src="${imgSrc}" alt="${name}">
        <h3>${name}</h3>
        <p>${address}</p>
      `;
      grid.appendChild(card);
    });
  }

  // ---- Fetch image from Pexels API and update only main panel background ----
  async function setMainBgImageFromPexels(query) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: pexelsApiKey
        }
      });
      if (!response.ok) {
        setDefaultMainBgImage();
        return;
      }
      const data = await response.json();
      const photo = data.photos && data.photos.length > 0 ? data.photos[0] : null;
      if (photo && photo.src && photo.src.landscape) {
        mainContent.style.backgroundImage = `url('${photo.src.landscape}')`;
      } else {
        setDefaultMainBgImage();
      }
    } catch (err) {
      setDefaultMainBgImage();
    }
  }

  function setDefaultMainBgImage() {
    const defaultImg = "https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
    mainContent.style.backgroundImage = `url('${defaultImg}')`;
  }
});
