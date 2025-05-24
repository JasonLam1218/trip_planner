document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
      alert('Please enter your username and password.');
      return;
  }

  try {
      // Use the correct backend endpoint!
      const response = await fetch('/api/users.js', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ username, password })
      });

      // Try to parse as JSON, but handle HTML error pages gracefully
      let result;
      try {
          result = await response.json();
      } catch (err) {
          const text = await response.text();
          console.error('Server returned non-JSON:', text);
          alert('Server error. Please try again later.');
          return;
      }

      if (response.ok) {
          if (document.getElementById('rememberMe').checked) {
              localStorage.setItem('tripPlannerUser', username);
          } else {
              sessionStorage.setItem('tripPlannerUser', username);
          }
          window.location.href = 'main.html';
      } else {
          if (result && result.message) {
              alert(result.message);
          } else {
              alert('Login failed. Please try again.');
          }
      }
  } catch (err) {
      alert('An error occurred. Please try again later.');
      console.error(err);
  }
});
