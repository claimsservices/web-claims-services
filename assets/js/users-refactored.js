// Check if the user has a valid token and the required role
const accessToken = localStorage.getItem('authToken'); // Check if token is available
const RETURN_LOGIN_PAGE = '../index.html';
console.log("aaa" + accessToken);

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

document.getElementById('user-role-regist').addEventListener('change', function () {
    const insuranceField = document.getElementById('insur-comp-field');
    if (this.value === 'Insurance') {
        insuranceField.style.display = 'block';
    } else {
        insuranceField.style.display = 'none';
    }
});

import { API_BASE_URL } from './api-config.js';

import { API_BASE_URL } from './api-config.js';

// Constants for URLs and other fixed strings
const API_URL = `${API_BASE_URL}/api/auth/profile`;
const API_URL_USERS = `${API_BASE_URL}/api/user-management/users`; // Update with your backend URL

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
    const decoded = decodeJWT(token);

    // Extract user info (name and role)
    if (decoded) {
        const id = decoded.id;
        const userName = decoded.username;
        const email = decoded.email;
        const role = decoded.role;
        const myPicture = decoded.myPicture;

        // Display user information in the HTML
        document.getElementById('user-info').innerText = userName;
        document.getElementById('user-role').innerText = role;

        const imageUrl = myPicture;  // Extract the image URL from the response
        const imgElement = document.getElementById('userAvatar');
        if (imgElement) {
            imgElement.src = imageUrl;  // Update the image src dynamically
        }
        const imgElement2 = document.getElementById('subUserAvatar');
        if (imgElement2) {
            imgElement2.src = imageUrl;  // Update the image src dynamically
        }

        if (isTokenExpired(decoded)) {
            // Token is expired
            localStorage.removeItem('authToken'); // Clear token
            window.location.href = LOGIN_PAGE; // Redirect to login page
            return;
        }
    } else {
        // Token is invalid
        localStorage.removeItem('authToken'); // Clear token
        window.location.href = LOGIN_PAGE; // Redirect to login page
        return;
    }


    // If the token is valid, fetch user profile
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`,  // Use the token in the Authorization header
            },
        });
        console.log(response);
        if (!response.ok) {
            //If the response is not OK(e.g., 401 Unauthorized), clear token and redirect
            localStorage.removeItem('authToken');
            window.location.href = LOGIN_PAGE;
            return;
        }
    } catch (error) {
        //Handle fetch errors(network issues, etc.)
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('authToken');
        window.location.href = LOGIN_PAGE; // Redirect to login page on error
    }
}


// Call the function to load the user profile
loadUserProfile();


async function fetchUsers() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../index.html'; // Redirect if no token
        return;
    }

    try {
        const response = await fetch(API_URL_USERS, {
            method: 'GET',
            headers: {
                Authorization: token,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch users:', response.status);
            //window.location.href = '../index.html'; // Redirect on error
            return;
        }

        const data = await response.json();
        populateTable(data.results);
    } catch (error) {
        console.error('Error fetching users:', error);
        ///window.location.href = '../index.html'; // Redirect on network error
    }
}

function populateTable(users) {
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = ''; // Clear existing table rows

    users.forEach((user) => {
        const row = document.createElement('tr');

        row.innerHTML = `
  <td>
  <div class="d-flex align-items-center">
    <img 
      src="${user.profile_picture ? user.profile_picture : '../assets/img/avatars/A1.png'}" 
      alt="Avatar" 
      class="rounded-circle" 
      width="30" 
    />
    <div class="ms-3">
      <strong>${user.username}</strong><br />
      <small>${user.email}</small>
    </div>
  </div>
</td>

  <td>${user.phone}</td>
 <td class="user-role">
  ${user.role === 'Operations Manager' ?
                `<i class="icon-base bx bx-desktop text-danger me-2"></i>${user.role}` :
                `<i class="icon-base bx bx-user text-success me-2"></i>${user.role}`}
</td>

  <td>
    ${user.is_active ? '<span class="badge bg-label-success" text-capitalized="">Active</span>' : '<span class="badge bg-label-secondary" text-capitalized="">Inactive</span>'}
  </td>
  <td>
    <div class="d-flex align-items-center">
      <a href="javascript:;" class="btn btn-icon delete-record" data-username="${user.username}">
        <i class="icon-base bx bx-trash icon-md"></i>
      </a>
      <a href="app-user-view-account.html" class="btn btn-icon">
        <i class="icon-base bx bx-show icon-md"></i>
      </a>
      <a href="javascript:;" class="btn btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
        <i class="icon-base bx bx-dots-vertical-rounded icon-md"></i>
      </a>
      <div class="dropdown-menu dropdown-menu-end m-0">
        <a href="javascript:;" class="dropdown-item">Active</a>
        <a href="javascript:;" class="dropdown-item">Inactive</a>
      </div>
    </div>
  </td>
`;

        tableBody.appendChild(row);
    });
}

// Load users on page load
fetchUsers();

document.getElementById("addNewUserForm").onsubmit = function (e) {
    e.preventDefault();

    var username = document.getElementById("add-user-username").value;
    var password = document.getElementById("add-user-password").value;
    var confirmPassword = document.getElementById("add-user-confirm-password").value;
    var firstName = document.getElementById("add-user-name").value;
    var lastName = document.getElementById("add-user-surename").value;
    var email = document.getElementById("add-user-email").value;
    var contact = document.getElementById("add-user-contact").value;
    var role = document.getElementById("user-role-regist").value;

    var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Email regex pattern

    if (!email || email.trim() === "") {
        alert("Please enter a email address.");
        return;
    }

    if (!contact || contact.trim() === "") {
        alert("Please enter a contact number.");
        return;
    }

    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Prepare the data for the API call
    var data = {
        username: username,
        password: password,
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: contact,
        role: role
    };

    if (role === 'Insurance') {
        data.insur_comp = document.getElementById("add-user-insur-comp").value;
    }

    // Send a POST request to the API using fetch
    fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the API
            console.log('Success:', data);
            alert('User added successfully!');
            // Optionally, reset the form or close the offcanvas
            document.getElementById("addNewUserForm").reset();
            // Optionally, close the offcanvas (if you're using Bootstrap's offcanvas)
            var offcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvasAddUser'));
            offcanvas.hide();
            // Refresh the page
            location.reload();
        })
        .catch((error) => {
            // Handle any errors
            console.error('Error:', error);
            alert('Failed to add user!');
        });
};

// Event delegation for dynamically added delete buttons
document.addEventListener('click', async (event) => {
    // Check if the clicked element is a delete button
    const deleteButton = event.target.closest('.delete-record');
    if (!deleteButton) return;

    // Retrieve the username from the data attribute
    const username = deleteButton.getAttribute('data-username');
    if (!username) {
        alert('Error: No username found for this record.');
        return;
    }

    // Retrieve the authentication token
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Session expired. Redirecting to login.');
        window.location.href = '../index.html'; // Redirect if no token
        return;
    }

    // Confirm the action with the user
    const confirmDelete = confirm(`Are you sure you want to delete the user: ${username}?`);
    if (!confirmDelete) return;

    try {
        // Disable the button to prevent multiple requests
        deleteButton.disabled = true;

        // Send the DELETE request to the server
        const response = await fetch(`${API_BASE_URL}/api/user-management/delete-user`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                authorization: token,
            },
            body: JSON.stringify({ username }),
        });

        // Handle the server response
        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        } else {
            alert('User deleted successfully.');
            // Remove the user's row from the UI
            const userRow = deleteButton.closest('tr'); // Adjust selector to match your DOM
            if (userRow) userRow.remove();
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('An unexpected error occurred. Please try again later.');
    } finally {
        // Re-enable the button after the request completes
        deleteButton.disabled = false;
    }
});

// Check user role (example assumes role is stored in localStorage)
const token = localStorage.getItem('authToken');
if (token) {
    const user = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload

    // Check if the user has the 'admin' role
    if (user.role === 'Operation Manager' || user.role === 'Director' || user.role === 'Developer') {
        // Show the admin menu
        // document.getElementById('admin-menu').style.display = 'block';
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
});''