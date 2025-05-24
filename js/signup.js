document.addEventListener('DOMContentLoaded', function () {

    console.log('signup.js loaded!'); // Debug line

    const form = document.querySelector('.form-container form');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Remove previous errors
        removeErrors();

        // Get values
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const repeatPassword = document.getElementById('repeat-password').value;
        let valid = true;

        // Username validation
        if (username === '') {
            showError('username', 'Please enter a username.');
            valid = false;
        }

        // Email validation
        if (email === '') {
            showError('email', 'Please enter your email address.');
            valid = false;
        } else if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
            showError('email', 'Your email address appears to be invalid.');
            valid = false;
        }

        // Password validation
        if (password === '') {
            showError('password', 'Please enter a password.');
            valid = false;
        } else if (password.length < 8) {
            showError('password', 'Password must be at least 8 characters.');
            valid = false;
        }

        // Repeat password validation
        if (repeatPassword === '') {
            showError('repeat-password', 'Please repeat your password.');
            valid = false;
        } else if (password !== repeatPassword) {
            showError('repeat-password', 'Passwords do not match. Please try again.');
            valid = false;
        }

        if (!valid) return;

        // Prepare data
        const data = { username, email, password };

        // Submit to backend
        try {
            const response = await fetch('/api/signup.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                alert('Sign up successful! Redirecting to login...');
                window.location.href = 'login.html';
            } else {
                showGeneralError(result.message || 'Sign up failed. Please try again.');
            }
        } catch (error) {
            showGeneralError('A network error occurred. Please try again later.');
        }
    });

    // Show error message below a field
    function showError(fieldId, message) {
        const errorDiv = document.getElementById(fieldId + '-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    // Show a general error at the top of the form
    function showGeneralError(message) {
        const overlay = document.getElementById('popup-overlay');
        const msg = document.getElementById('popup-message');
        const closeBtn = document.getElementById('popup-close');
        msg.textContent = message;
        overlay.style.display = 'flex';
        closeBtn.onclick = function() {
            overlay.style.display = 'none';
        };
        overlay.onclick = function(e) {
            if (e.target === overlay) overlay.style.display = 'none';
        };
    }

    // Remove all error messages
    function removeErrors() {
        document.querySelectorAll('.error-message').forEach(function (el) {
            el.textContent = '';
            el.style.display = 'none';
        });
    }
});
