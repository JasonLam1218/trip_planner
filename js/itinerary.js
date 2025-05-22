// Sample famous places (replace or fetch from an API)
const PLACES = [
  "Petronas Twin Towers",
  "Batu Caves",
  "Central Market",
  "Merdeka Square",
  "KL Tower",
  "Bukit Bintang",
  "Thean Hou Temple",
  "Perdana Botanical Gardens",
  "National Museum",
  "Sunway Lagoon"
];

// Timetable configuration
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = ["09:00", "11:00", "13:00", "15:00", "17:00"];

// Populate places list
const placesList = document.getElementById('places-list');
function renderPlaces(filter = "") {
  placesList.innerHTML = "";
  PLACES.filter(p => p.toLowerCase().includes(filter.toLowerCase()))
    .forEach(place => {
      const li = document.createElement('li');
      li.textContent = place;
      li.draggable = true;
      li.classList.add('place-item');
      li.addEventListener('dragstart', onDragStart);
      li.addEventListener('dragend', onDragEnd);
      placesList.appendChild(li);
    });
}
renderPlaces();

// Search functionality
document.getElementById('place-search').addEventListener('input', function() {
  renderPlaces(this.value);
});

// Generate timetable grid
const timetable = document.getElementById('timetable');
function renderTimetable() {
  const table = document.createElement('table');
  table.className = 'timetable-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.appendChild(document.createElement('th')); // Empty corner
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
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  timetable.innerHTML = "";
  timetable.appendChild(table);
}
renderTimetable();

// Drag and Drop handlers
let draggedPlace = null;

function onDragStart(e) {
  draggedPlace = this.textContent;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = "move";
}

function onDragEnd() {
  this.classList.remove('dragging');
  draggedPlace = null;
}

function onDragOver(e) {
  e.preventDefault();
  this.classList.add('droppable');
}

function onDrop(e) {
  e.preventDefault();
  this.classList.remove('droppable');
  if (draggedPlace) {
    addEventToCell(this, draggedPlace);
  }
}

function addEventToCell(cell, place) {
  // Prevent duplicate in same cell
  if ([...cell.children].some(child => child.textContent.includes(place))) return;
  const eventDiv = document.createElement('div');
  eventDiv.className = 'timetable-event';
  eventDiv.textContent = place;

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.innerHTML = '&times;';
  removeBtn.onclick = function() {
    cell.removeChild(eventDiv);
  };
  eventDiv.appendChild(removeBtn);

  cell.appendChild(eventDiv);
}

// Remove droppable highlight when leaving cell
document.querySelectorAll('.timetable-table td').forEach(cell => {
  cell.addEventListener('dragleave', function() {
    this.classList.remove('droppable');
  });
});
