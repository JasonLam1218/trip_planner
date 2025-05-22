document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  // Simple demo authentication (replace with real authentication in production)
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (username && password) {
    // Optionally store in localStorage if "Remember me" is checked
    if (document.getElementById('rememberMe').checked) {
      localStorage.setItem('tripPlannerUser', username);
    } else {
      // Always set for session, clear on logout
      sessionStorage.setItem('tripPlannerUser', username);
    }
    // Redirect to main page
    window.location.href = 'main.html';
  } else {
    alert('Please enter your username and password.');
  }
});
