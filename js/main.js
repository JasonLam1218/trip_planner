document.addEventListener('DOMContentLoaded', function() {

  // --- Username display and login protection ---
  let username = localStorage.getItem('tripPlannerUser') || sessionStorage.getItem('tripPlannerUser');
  if (!username) {
    window.location.href = 'login.html';
    return;
  }

  // Show username in header
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

// Editable Checklist Feature with Default Items Always Shown on Modal Open

// Default checklist items
const DEFAULT_CHECKLIST = [
  "Passport",
  "Medications",
  "Travel Insurance",
  "Tickets/Itinerary",
  "Electronics",
  "Chargers",
  "Clothes",
  "Money/Cards"
];

// Load checklist from localStorage or use default
function getChecklist() {
  const stored = localStorage.getItem('checklistItems');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  // If nothing stored, return a copy of the default
  return [...DEFAULT_CHECKLIST];
}

// Save checklist to localStorage
function saveChecklist(list) {
  localStorage.setItem('checklistItems', JSON.stringify(list));
}

// Render checklist items in the popup
function renderChecklist() {
  const checklist = getChecklist();
  const list = document.getElementById('checklist-items');
  list.innerHTML = '';
  checklist.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'checklist-row';

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checklist-checkbox';
    checkbox.id = `check-${idx}`;

    // Label
    const label = document.createElement('label');
    label.className = 'checklist-label';
    label.htmlFor = `check-${idx}`;
    label.textContent = item;

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.type = 'button';
    delBtn.className = 'delete-checklist-item';
    delBtn.onclick = () => {
      // Remove item, save, and re-render
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

// Add new item to checklist
document.getElementById('add-checklist-item').onclick = function() {
  const input = document.getElementById('new-checklist-item');
  const value = input.value.trim();
  if (value) {
    const current = getChecklist();
    current.push(value);
    saveChecklist(current);
    input.value = '';
    renderChecklist();
  }
};

// Allow Enter key to add item
document.getElementById('new-checklist-item').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('add-checklist-item').click();
    e.preventDefault();
  }
});

// Show checklist modal and render items
document.getElementById('sidebar-checklist-btn').onclick = function() {
  document.getElementById('checklist-modal').style.display = 'block';
  renderChecklist();
};

// Hide checklist modal
document.getElementById('close-checklist').onclick = function() {
  document.getElementById('checklist-modal').style.display = 'none';
};

// Hide modal if user clicks outside it
window.onclick = function(event) {
  const modal = document.getElementById('checklist-modal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};
