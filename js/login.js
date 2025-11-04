import { navigateTo } from '../assets/js/navigation.js';

document.getElementById("formAuthentication").addEventListener("submit", async function (event) {
  event.preventDefault();

  // Get field values
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const apiUrl = `${window.API_BASE_URL}/api/auth/login`;

  let isValid = true;

  // Reset previous error messages
  const usernameError = document.getElementById("username-error");
  usernameError.style.display = "none";
  usernameError.innerText = "";

  // Add password error container
  let passwordError = document.getElementById("password-error");
  if (!passwordError) {
    passwordError = document.createElement("div");
    passwordError.id = "password-error";
    passwordError.className = "text-danger";
    passwordError.style.display = "none";
    document.querySelector(".form-password-toggle").appendChild(passwordError);
  }
  passwordError.style.display = "none";
  passwordError.innerText = "";

  // Front-end validation
  if (!username) {
    usernameError.innerText = "Please enter your username.";
    usernameError.style.display = "block";
    isValid = false;
  }

  if (!password) {
    passwordError.innerText = "Please enter your password.";
    passwordError.style.display = "block";
    isValid = false;
  }

  // Stop execution if front-end validation fails
  if (!isValid) return;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('role', data.role);

      if (data.role === 'Bike') {
        navigateTo('html/agent-dashboard.html');
      } else {
        navigateTo('html/dashboard.html');
      }

    } else {
      const errorMessage = await response.text(); // Get backend error message
      usernameError.innerText = "Invalid username or password.";
      usernameError.style.display = "block";
    }
  } catch (error) {
    console.error("Error during login:", error);
    usernameError.innerText = "An error occurred. Please try again.";
    usernameError.style.display = "block";
  }
});