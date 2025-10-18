// Check if the user has a valid token and the required role
      const accessToken = localStorage.getItem('authToken'); // Check if token is available
      const RETURN_LOGIN_PAGE = '../index.html';

        // If there's no token, redirect to login
        if (!accessToken) {
          window.location.href = RETURN_LOGIN_PAGE;
        }

fetch('/version.json')
        .then(res => res.json())
        .then(data => {
          document.getElementById("appVersion").textContent = `App Version ${data.version}`;
        })
        .catch(() => {
          document.getElementById("appVersion").textContent = "App Version -";
        });

import { API_BASE_URL } from './api-config.js';

      // Function to decode JWT token and check for expiration
      function decodeJWT(token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          return JSON.parse(atob(base64));  // Decode the token
        } catch (e) {
          console.error('Failed to decode JWT:', e);
          return null;
        }
      }

      // Function to check if the token is expired
      function isTokenExpired(decodedToken) {
        const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
        return decodedToken && decodedToken.exp && decodedToken.exp < currentTime;
      }

      // Main logic
      async function loadUserProfile() {
        const token = localStorage.getItem('authToken'); // Check if token is available

        // If there's no token, redirect to login
        if (!token) {
          window.location.href = LOGIN_PAGE;
          return;
        }

        // Decode the JWT token (assuming it's a JWT token)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));

        const id = decoded.id;
        const userName = decoded.username;
        const fname = decoded.first_name;
        const lname = decoded.last_name;
        const email = decoded.email;
        const role = decoded.role;
        const myPicture = decoded.myPicture;

        document.getElementById('user-info').innerText = fname + ' ' + lname;
        document.getElementById('user-role').innerText = role;

        const imageUrl = myPicture;  // Extract the image URL from the response
        const imgElement = document.getElementById('userAvatar');
        const imgElement2 = document.getElementById('subUserAvatar');
        const imgElementProfile = document.getElementById('uploadedAvatar');
        imgElement.src = imageUrl;  // Update the image src dynamically
        imgElement2.src = imageUrl;  // Update the image src dynamically
        imgElementProfile.src = imageUrl;  // Update the image src dynamically

        if (decoded && isTokenExpired(decoded)) {
          // Token is expired
          localStorage.removeItem('authToken'); // Clear token
          window.location.href = LOGIN_PAGE; // Redirect to login page
          return;
        }
      }
      // Call the function to load the user profile
      loadUserProfile();

document.getElementById('formChangePassword').addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent form from reloading the page
    
        const token = localStorage.getItem('authToken'); // Check if token is available

        // Decode the JWT token (assuming it's a JWT token)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));

        const userName = decoded.username;
        const userData = {
          username: userName,
          newPassword: document.getElementById('newPassword').value
        };
    
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/update-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify(userData)
          });
    
          const result = await response.json();
    
          if (response.ok) {
            alert('Password updated successfully.');
            console.log(result);
          } else {
            alert(`Update failed: ${result.message}`);
            console.error(result);
          }
    
        } catch (err) {
          console.error('Error:', err);
          alert('Something went wrong while updating the password.');
        }
      });

// Check user role (example assumes role is stored in localStorage)
  const token = localStorage.getItem('authToken');
  if (token) {
    const user = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload

    // Check if the user has the 'admin' role
    if (user.role === 'Operation Manager' || user.role === 'Director' || user.role === 'Developer') {
      // Show the admin menu
      document.getElementById('admin-menu').style.display = 'block';
    }
    if (user.role === 'Officer') {
      localStorage.removeItem('authToken');
      window.location.href = '../index.html';
    }
  }

// Logout function to clear token and redirect
  document.getElementById('logout').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default anchor link behavior

    // Clear the token from localStorage
    localStorage.removeItem('authToken');

    // Optionally, redirect the user to the login page or home page
    window.location.href = '../index.html'; // Modify this if you want to redirect somewhere else
  });

