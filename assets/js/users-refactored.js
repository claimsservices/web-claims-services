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

import API_BASE_URL from './api-config.js';


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

let allUsers = []; // Cache all users

let currentEditUsername = null; // Track if we are in edit mode

const offcanvasElement = document.getElementById('offcanvasAddUser');

const offcanvas = new bootstrap.Offcanvas(offcanvasElement);

const addNewUserForm = document.getElementById("addNewUserForm");

const offcanvasTitle = document.getElementById('offcanvasAddUserLabel');



function populateTable(users) {

    allUsers = users; // Cache the user data

    const tableBody = document.getElementById('userTableBody');

    tableBody.innerHTML = ''; // Clear existing table rows



    users.forEach((user) => {

        const row = document.createElement('tr');

        // Store the full user object in a data attribute, safely stringified

        const userJson = JSON.stringify(user).replace(/'/g, '&apos;');



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



  <td>${user.phone || 'N/A'}</td>

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

      <a href="javascript:;" class="btn btn-icon edit-record" data-username="${user.username}">

        <i class="icon-base bx bx-edit icon-md"></i>

      </a>

      <a href="javascript:;" class="btn btn-icon delete-record" data-username="${user.username}">

        <i class="icon-base bx bx-trash icon-md"></i>

      </a>

    </div>

  </td>

`;



        tableBody.appendChild(row);

    });

}



function setupFormForEdit(username) {

    const user = allUsers.find(u => u.username === username);

    if (!user) return;



    currentEditUsername = username;

    offcanvasTitle.textContent = 'Edit User';



    // Populate form fields

    document.getElementById("add-user-username").value = user.username;

    document.getElementById("add-user-name").value = user.first_name || '';

    document.getElementById("add-user-surename").value = user.last_name || '';

    document.getElementById("add-user-email").value = user.email || '';

    document.getElementById("add-user-contact").value = user.phone || '';

    document.getElementById("user-role-regist").value = user.role || '';



    // Disable fields that should not be changed during edit

    document.getElementById("add-user-username").disabled = true;

    document.getElementById("add-user-password").disabled = true;

    document.getElementById("add-user-confirm-password").disabled = true;



    // Handle insurance company field visibility

    const insuranceField = document.getElementById('insur-comp-field');

    if (user.role === 'Insurance') {

        insuranceField.style.display = 'block';

        document.getElementById('add-user-insur-comp').value = user.insur_comp || '';

    } else {

        insuranceField.style.display = 'none';

    }



    offcanvas.show();

}



function resetFormForAdd() {

    currentEditUsername = null;

    offcanvasTitle.textContent = 'Add User';

    addNewUserForm.reset();



    // Re-enable potentially disabled fields

    document.getElementById("add-user-username").disabled = false;

    document.getElementById("add-user-password").disabled = false;

    document.getElementById("add-user-confirm-password").disabled = false;

    document.getElementById('insur-comp-field').style.display = 'none';

}



// Load users on page load

fetchUsers();



// Handle Form Submission for both ADD and EDIT

addNewUserForm.onsubmit = async function (e) {

    e.preventDefault();



    const token = localStorage.getItem('authToken');

    const username = document.getElementById("add-user-username").value;



    // Base data object

    const data = {

        username: username,

        first_name: document.getElementById("add-user-name").value,

        last_name: document.getElementById("add-user-surename").value,

        email: document.getElementById("add-user-email").value,

        phone: document.getElementById("add-user-contact").value,

        role: document.getElementById("user-role-regist").value,

    };



    let url, method;



    if (currentEditUsername) { // EDIT MODE

        url = `${API_BASE_URL}/api/user-management/update-user`;

        method = 'PUT';

        // is_active can be added here if needed



    } else { // ADD MODE

        url = `${API_BASE_URL}/api/auth/register`;

        method = 'POST';

        const password = document.getElementById("add-user-password").value;

        const confirmPassword = document.getElementById("add-user-confirm-password").value;

        if (password !== confirmPassword) {

            alert("Passwords do not match!");

            return;

        }

        data.password = password;

    }

    

    if (data.role === 'Insurance') {

        data.insur_comp = document.getElementById("add-user-insur-comp").value;

    }



    try {

        const response = await fetch(url, {

            method: method,

            headers: {

                'Content-Type': 'application/json',

                'Authorization': token

            },

            body: JSON.stringify(data),

        });



        const result = await response.json();



        if (response.ok) {

            alert(`User ${currentEditUsername ? 'updated' : 'added'} successfully!`);

            offcanvas.hide();

            fetchUsers(); // Refresh the table

        } else {

            alert(`Failed: ${result.message}`);

        }



    } catch (error) {

        console.error('Error submitting form:', error);

        alert('An unexpected error occurred.');

    }

};



// Event delegation for dynamic buttons

document.addEventListener('click', async (event) => {

    const editButton = event.target.closest('.edit-record');

    const deleteButton = event.target.closest('.delete-record');



    if (editButton) {

        const username = editButton.getAttribute('data-username');

        setupFormForEdit(username);

        return;

    }



    if (deleteButton) {

        const username = deleteButton.getAttribute('data-username');

        if (!username) return;



        const confirmDelete = confirm(`Are you sure you want to delete the user: ${username}?`);

        if (!confirmDelete) return;



        const token = localStorage.getItem('authToken');

        if (!token) {

            alert('Session expired. Please log in again.');

            return;

        }



        try {

            const response = await fetch(`${API_BASE_URL}/api/user-management/delete-user`, {

                method: 'DELETE',

                headers: {

                    'Content-Type': 'application/json',

                    'Authorization': token,

                },

                body: JSON.stringify({ username }),

            });



            const result = await response.json();

            if (response.ok) {

                alert('User deleted successfully.');

                fetchUsers(); // Refresh table

            } else {

                alert(`Error: ${result.message}`);

            }

        } catch (error) {

            console.error('Error deleting user:', error);

            alert('An unexpected error occurred.');

        }

        return;

    }

});



// Reset form when Add New User button is clicked

document.getElementById('new-user-btn').addEventListener('click', resetFormForAdd);



// Check user role to display admin menu
const token = localStorage.getItem('authToken');
if (token) {
    const user = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    const adminRoles = ['Director', 'Admin Officer', 'Officer', 'Operation Manager', 'Sales Manager', 'Leader', 'Developer'];

    // This check is handled by the main layout, but we keep it here as a safeguard
    if (adminRoles.includes(user.role)) {
        const adminMenu = document.getElementById('admin-menu');
        if (adminMenu) {
            // adminMenu.style.display = 'block'; // This is handled by account-refactored.js now
        }
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