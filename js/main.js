// Logout button logic
document.querySelector('.logout-btn').addEventListener('click', function() {
    localStorage.removeItem('tripPlannerUser');
    sessionStorage.removeItem('tripPlannerUser');
    window.location.href = 'login.html';
  });
  
  // Personalize the username if stored in localStorage or sessionStorage
  document.addEventListener('DOMContentLoaded', function() {
    let username = localStorage.getItem('tripPlannerUser');
    if (!username) {
      username = sessionStorage.getItem('tripPlannerUser');
    }
    if (username) {
      document.querySelector('.sidebar-username').textContent = username;
      document.querySelector('.username-placeholder').textContent = username;
    } else {
      // If not logged in, redirect to login page
      window.location.href = 'login.html';
    }
  
    // Redirect to itinerary page when "New Trip" is clicked
    document.querySelector('.new-trip-btn').addEventListener('click', function() {
      window.location.href = 'itinerary.html';
    });
  });
  