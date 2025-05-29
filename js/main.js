document.addEventListener('DOMContentLoaded', async function() {
  // --- Username display and login protection ---
  let username = localStorage.getItem('tripPlannerUser') || sessionStorage.getItem('tripPlannerUser');
  if (!username) {
    window.location.href = 'login.html';
    return;
  }
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
  const newTripBtn = document.querySelector('.new-trip-btn');
  if (newTripBtn) {
    newTripBtn.addEventListener('click', function() {
      window.location.href = 'itinerary.html';
    });
  }

  // --- Checklist Modal Logic ---
  const checklistBtn = document.getElementById('checklist-btn') || document.getElementById('sidebar-checklist-btn');
  const checklistModal = document.getElementById('checklist-modal');
  const closeChecklist = document.getElementById('close-checklist');
  if (checklistBtn && checklistModal && closeChecklist) {
    checklistBtn.addEventListener('click', function() {
      checklistModal.style.display = 'block';
      renderChecklist();
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

  // --- Editable Checklist Feature with Default Items Always Shown on Modal Open ---
  const DEFAULT_CHECKLIST = [
    "Passport", "Medications", "Travel Insurance", "Tickets/Itinerary",
    "Electronics", "Chargers", "Clothes", "Money/Cards"
  ];
  function getChecklist() {
    const stored = localStorage.getItem('checklistItems');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [...DEFAULT_CHECKLIST];
  }
  function saveChecklist(list) {
    localStorage.setItem('checklistItems', JSON.stringify(list));
  }
  function renderChecklist() {
    const checklist = getChecklist();
    const list = document.getElementById('checklist-items');
    if (!list) return;
    list.innerHTML = '';
    checklist.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'checklist-row';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'checklist-checkbox';
      checkbox.id = `check-${idx}`;
      const label = document.createElement('label');
      label.className = 'checklist-label';
      label.htmlFor = `check-${idx}`;
      label.textContent = item;
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.type = 'button';
      delBtn.className = 'delete-checklist-item';
      delBtn.onclick = () => {
        const current = getChecklist();
        current.splice(idx, 1);
        saveChecklist(current);
        renderChecklist();
      };
      li.appendChild(checkbox);
      li.appendChild(label);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  }
  const addChecklistBtn = document.getElementById('add-checklist-item');
  if (addChecklistBtn) {
    addChecklistBtn.onclick = function() {
      const input = document.getElementById('new-checklist-item');
      if (!input) return;
      const value = input.value.trim();
      if (value) {
        const current = getChecklist();
        current.push(value);
        saveChecklist(current);
        input.value = '';
        renderChecklist();
      }
    };
  }
  const checklistInput = document.getElementById('new-checklist-item');
  if (checklistInput) {
    checklistInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        if (addChecklistBtn) addChecklistBtn.click();
        e.preventDefault();
      }
    });
  }

  // --- Location Search with Autocomplete ---
  const apiKey = '3093a86a55c04f38a88f76f5b7e3341d';
  const searchInput = document.getElementById('location-search');
  const autocompleteResults = document.getElementById('autocomplete-results');
  let currentSuggestions = [];
  let debounceTimer = null;
  if (searchInput && autocompleteResults) {
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
  }

  // --- Random Place Cards: Each Card Unique and Random ---
  const randomLocations = [
    { name: "Bali", country: "Indonesia" },
    { name: "Maldives", country: "Maldives" },
    { name: "Santorini", country: "Greece" },
    { name: "Cappadocia", country: "Turkey" },
    { name: "Kyoto", country: "Japan" },
    { name: "Paris", country: "France" },
    { name: "Banff", country: "Canada" },
    { name: "Rome", country: "Italy" },
    { name: "Barcelona", country: "Spain" },
    { name: "Queenstown", country: "New Zealand" }
  ];

  function getRandomUniqueLocations(count) {
    // Shuffle and pick first N
    const arr = [...randomLocations];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, count);
  }

  async function fetchLocationImage(locationName) {
    const pexelsApiKey = '3ALWgUIgB3TKe9XKjiHc7PnviX2JLZFf5saoKL0HCDZMVJYOZWaSvRKi';
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(locationName)}&per_page=1`;
    try {
      const response = await fetch(url, {
        headers: { Authorization: pexelsApiKey }
      });
      if (!response.ok) throw new Error('Image fetch failed');
      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.landscape || data.photos[0].src.medium;
      }
    } catch (e) {
      console.error("Failed to fetch image for", locationName, e);
    }
    // Fallback image
    return "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&w=600";
  }

  async function showRandomPlaceCards() {
    const placeCards = document.querySelectorAll('.place-card');
    if (!placeCards.length) return;
    // Get as many unique random locations as there are cards (or as many as possible)
    const uniqueLocations = getRandomUniqueLocations(placeCards.length);
    await Promise.all(Array.from(placeCards).map(async (placeCard, idx) => {
      const location = uniqueLocations[idx] || getRandomUniqueLocations(1)[0];
      const imageUrl = await fetchLocationImage(location.name);
      placeCard.innerHTML = '';
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = location.name;
      const title = document.createElement('h3');
      title.textContent = location.name;
      const country = document.createElement('div');
      country.className = 'place-country';
      country.textContent = location.country;
      placeCard.appendChild(img);
      placeCard.appendChild(title);
      placeCard.appendChild(country);
    }));
  }

  showRandomPlaceCards();
});
