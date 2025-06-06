const apiKey = '3093a86a55c04f38a88f76f5b7e3341d';
const hongKongCoords = { lat: 22.302711, lon: 114.177216 };
const placeCategory = 'tourism.sights';
const defaultRadius = 10000;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", 
               "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
               "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", 
               "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", 
               "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00"];

let draggedPlace = null;
let dragSource = null; // "list" or "timetable"
let placesData = [];
let currentSuggestions = [];
let debounceTimer = null;

// DOM Elements
const placesList = document.getElementById('places-list');
const searchInput = document.getElementById('place-search');
const searchSection = searchInput.parentNode;
const autocompleteResults = document.getElementById('autocomplete-results');
if (!autocompleteResults) {
  autocompleteResults = document.createElement('div');
  autocompleteResults.className = 'autocomplete-results';
  searchSection.appendChild(autocompleteResults);
}

// --- Autocomplete logic (same as index.js, but positioned in sidebar) ---
searchInput.addEventListener('input', function() {
  const value = searchInput.value.trim();
  clearTimeout(debounceTimer);
  autocompleteResults.innerHTML = '';
  autocompleteResults.style.display = 'none';
  renderPlaces([]);
  if (value.length < 2) {
    return;
  }
  debounceTimer = setTimeout(() => {
    fetchAutocompleteSuggestions(value);
  }, 250);
});

async function fetchAutocompleteSuggestions(query) {
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=7&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      renderAutocomplete([]);
      return;
    }
    const data = await response.json();
    currentSuggestions = data.features;
    renderAutocomplete(currentSuggestions);
  } catch (err) {
    renderAutocomplete([]);
  }
}

function renderAutocomplete(suggestions) {
  autocompleteResults.innerHTML = '';
  if (!suggestions.length) {
    autocompleteResults.style.display = 'none';
    return;
  }
  // Style the container for better appearance
  autocompleteResults.style.display = 'block';
  autocompleteResults.style.background = '#fff';
  autocompleteResults.style.border = '1px solid #ccc';
  autocompleteResults.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  autocompleteResults.style.position = 'absolute';
  autocompleteResults.style.zIndex = '1000';
  autocompleteResults.style.width = searchInput.offsetWidth + 'px';

  suggestions.forEach((feature) => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.textContent = feature.properties.formatted;
    item.style.padding = '10px 16px';
    item.style.cursor = 'pointer';
    item.style.borderBottom = '1px solid #eee';
    item.addEventListener('mouseover', () => {
      item.style.background = '#f5f5f5';
    });
    item.addEventListener('mouseout', () => {
      item.style.background = '#fff';
    });
    item.addEventListener('click', () => {
      searchInput.value = feature.properties.formatted;
      autocompleteResults.innerHTML = '';
      autocompleteResults.style.display = 'none';
      handlePlaceSelect(feature);
    });
    autocompleteResults.appendChild(item);
  });
  // Remove last border
  if (autocompleteResults.lastChild) {
    autocompleteResults.lastChild.style.borderBottom = 'none';
  }
}

// Hide autocomplete when clicking outside
document.addEventListener('click', function(e) {
  if (!autocompleteResults.contains(e.target) && e.target !== searchInput) {
    autocompleteResults.style.display = 'none';
  }
});

// --- Place selection and list rendering ---
async function handlePlaceSelect(feature) {
  const [lon, lat] = feature.geometry && feature.geometry.coordinates
    ? feature.geometry.coordinates
    : [hongKongCoords.lon, hongKongCoords.lat];
  await fetchNearbyPlaces(lat, lon);
}

async function fetchNearbyPlaces(lat, lon) {
  const url = `https://api.geoapify.com/v2/places?categories=${placeCategory}&filter=circle:${lon},${lat},${defaultRadius}&limit=20&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      renderPlaces([]);
      return;
    }
    const data = await response.json();
    placesData = (data.features || []).map(f => ({
      name: f.properties.name || f.properties.formatted,
      feature: f
    })).filter(p => p.name);
    renderPlaces(placesData.map(p => p.name));
  } catch (err) {
    renderPlaces([]);
  }
}

function renderPlaces(places) {
  placesList.innerHTML = "";
  if (!places || !places.length) {
    return;
  }
  places.forEach(place => {
    const li = document.createElement('li');
    li.textContent = place;
    li.draggable = true;
    li.classList.add('place-item');
    li.addEventListener('dragstart', onListDragStart);
    li.addEventListener('dragend', onListDragEnd);
    placesList.appendChild(li);
  });
}

// --- Timetable logic ---
const timetable = document.getElementById('timetable');
renderTimetable();

function renderTimetable() {
  const table = document.createElement('table');
  table.className = 'timetable-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.appendChild(document.createElement('th'));
  DAYS.forEach(day => {
    const th = document.createElement('th');
    th.textContent = day;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  HOURS.forEach(hour => {
    const row = document.createElement('tr');
    const hourCell = document.createElement('th');
    hourCell.textContent = hour;
    row.appendChild(hourCell);

    DAYS.forEach(day => {
      const cell = document.createElement('td');
      cell.dataset.day = day;
      cell.dataset.hour = hour;
      cell.addEventListener('dragover', onDragOver);
      cell.addEventListener('drop', onDrop);
      cell.addEventListener('dragleave', onDragLeave);
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  timetable.innerHTML = "";
  timetable.appendChild(table);
}

// --- Drag and Drop handlers ---

// For dragging from the search list
function onListDragStart(e) {
  draggedPlace = this.textContent;
  dragSource = "list";
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = "move";
}
function onListDragEnd() {
  this.classList.remove('dragging');
  draggedPlace = null;
  dragSource = null;
}

// For dragging timetable events
function onEventDragStart(e) {
  draggedPlace = this.textContent.replace('×','').trim();
  dragSource = "timetable";
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = "move";
}
function onEventDragEnd() {
  this.classList.remove('dragging');
  draggedPlace = null;
  dragSource = null;
}

function onDragOver(e) {
  e.preventDefault();
  this.classList.add('droppable');
}

function onDragLeave(e) {
  this.classList.remove('droppable');
}

function onDrop(e) {
  e.preventDefault();
  this.classList.remove('droppable');
  if (draggedPlace) {
    // If dropping from list, add event to cell
    if (dragSource === "list") {
      addEventToCell(this, draggedPlace);
    }
    // If dropping from timetable, move event to new cell
    else if (dragSource === "timetable") {
      addEventToCell(this, draggedPlace);
      // Remove from old cell handled by dragend
    }
  }
}

// Make the search list a drop target for timetable events
placesList.addEventListener('dragover', function(e) {
  e.preventDefault();
  this.classList.add('dragover');
});
placesList.addEventListener('dragleave', function(e) {
  this.classList.remove('dragover');
});
placesList.addEventListener('drop', function(e) {
  e.preventDefault();
  this.classList.remove('dragover');
  if (draggedPlace && dragSource === "timetable") {
    // Remove the event from the timetable
    removeEventFromTimetable(draggedPlace);
    // Optionally, add back to search list if not already there
    if (![...placesList.children].some(li => li.textContent === draggedPlace)) {
      const li = document.createElement('li');
      li.textContent = draggedPlace;
      li.draggable = true;
      li.classList.add('place-item');
      li.addEventListener('dragstart', onListDragStart);
      li.addEventListener('dragend', onListDragEnd);
      placesList.appendChild(li);
    }
  }
});

function addEventToCell(cell, place) {
  // Prevent duplicate in same cell
  if ([...cell.children].some(child => child.classList.contains('timetable-event') && child.textContent.replace('×','').trim() === place)) return;

  const eventDiv = document.createElement('div');
  eventDiv.className = 'timetable-event';
  eventDiv.textContent = place;

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.innerHTML = '×';
  removeBtn.onclick = function(e) {
    e.stopPropagation();
    cell.removeChild(eventDiv);
    // Optionally, add back to search list
    if (![...placesList.children].some(li => li.textContent === place)) {
      const li = document.createElement('li');
      li.textContent = place;
      li.draggable = true;
      li.classList.add('place-item');
      li.addEventListener('dragstart', onListDragStart);
      li.addEventListener('dragend', onListDragEnd);
      placesList.appendChild(li);
    }
  };

  eventDiv.appendChild(removeBtn);

  // Make event draggable
  eventDiv.draggable = true;
  eventDiv.addEventListener('dragstart', onEventDragStart);
  eventDiv.addEventListener('dragend', onEventDragEnd);

  cell.appendChild(eventDiv);

  // Remove from search list if present
  [...placesList.children].forEach(li => {
    if (li.textContent === place) {
      placesList.removeChild(li);
    }
  });
}

function removeEventFromTimetable(place) {
  document.querySelectorAll('.timetable-event').forEach(ev => {
    if (ev.textContent.replace('×','').trim() === place) {
      ev.parentElement.removeChild(ev);
    }
  });
}

// --- Save and Save Image buttons ---
document.getElementById('save-btn').addEventListener('click', function() {
  alert('Save functionality not implemented yet.');
});

document.getElementById('save-image-btn').addEventListener('click', function() {
  const timetableDiv = document.querySelector('.timetable');
  html2canvas(timetableDiv).then(function(canvas) {
    // Download the image
    const link = document.createElement('a');
    link.download = 'timetable.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});
