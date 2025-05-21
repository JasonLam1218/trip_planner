// itinerary.js
document.getElementById('itinerary-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;
    const list = document.getElementById('itinerary-list');
    const item = document.createElement('li');
    item.textContent = `${destination} on ${date}`;
    list.appendChild(item);
    this.reset();
  });
  