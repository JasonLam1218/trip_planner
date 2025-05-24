document.addEventListener('DOMContentLoaded', function() {

  // --- Username display and login protection ---
  let username = localStorage.getItem('tripPlannerUser') || sessionStorage.getItem('tripPlannerUser');
  if (!username) {
    window.location.href = 'login.html';
    return;
  }

  // Show username in sidebar and header
  const sidebarUsername = document.getElementById('sidebar-username');
  if (sidebarUsername) sidebarUsername.textContent = username;
  const mainUsername = document.getElementById('main-username');
  if (mainUsername) mainUsername.textContent = username;

  // --- Logout button ---
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('tripPlannerUser');
      sessionStorage.removeItem('tripPlannerUser');
      window.location.href = 'login.html';
    });
  }

  // --- New Trip Button Navigation ---
  document.querySelector('.new-trip-btn').addEventListener('click', function() {
    window.location.href = 'itinerary.html';
  });

  // --- Checklist Modal Logic ---
  const checklistBtn = document.getElementById('checklist-btn');
  const checklistModal = document.getElementById('checklist-modal');
  const closeChecklist = document.getElementById('close-checklist');
  if (checklistBtn && checklistModal && closeChecklist) {
    checklistBtn.addEventListener('click', function() {
      checklistModal.style.display = 'block';
    });
    closeChecklist.addEventListener('click', function() {
      checklistModal.style.display = 'none';
    });
    window.addEventListener('click', function(event) {
      if (event.target === checklistModal) {
        checklistModal.style.display = 'none';
      }
    });
  }

  // --- Existing trip planner logic ---
  const apiKey = '3093a86a55c04f38a88f76f5b7e3341d';
  const pexelsApiKey = '3ALWgUIgB3TKe9XKjiHc7PnviX2JLZFf5saoKL0HCDZMVJYOZWaSvRKi';
  const placeCategory = 'tourism.sights';
  const defaultRadius = 10000;
  const grid = document.querySelector('.places-grid');
  const searchInput = document.getElementById('location-search');
  const autocompleteResults = document.getElementById('autocomplete-results');
  const mainContent = document.getElementById('main-content');
  let currentSuggestions = [];
  let debounceTimer = null;

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

  document.addEventListener('click', function(e) {
    if (!autocompleteResults.contains(e.target) && e.target !== searchInput) {
      autocompleteResults.style.display = 'none';
    }
  });

  async function handleLocationSelect(feature) {
    const [lon, lat] = feature.geometry.coordinates;
    const placeName = feature.properties.name || feature.properties.city || feature.properties.formatted;
    // ... (rest of your dynamic place loading logic)
  }

});
