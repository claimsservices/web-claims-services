
import API_BASE_URL from './api-config.js';

// --- Authentication and User Profile --- //
const accessToken = localStorage.getItem('authToken');
const RETURN_LOGIN_PAGE = '../index.html';

if (!accessToken) {
  window.location.href = RETURN_LOGIN_PAGE;
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

async function loadUserProfile() {
  if (!accessToken) return;

  const decoded = parseJwt(accessToken);
  if (!decoded) {
    localStorage.removeItem('authToken');
    window.location.href = RETURN_LOGIN_PAGE;
    return;
  }

  // Check for token expiration
  const currentTime = Math.floor(Date.now() / 1000);
  if (decoded.exp < currentTime) {
    localStorage.removeItem('authToken');
    window.location.href = RETURN_LOGIN_PAGE;
    return;
  }

  // Update UI with user info
  document.getElementById('user-info').innerText = `${decoded.first_name} ${decoded.last_name}`;
  document.getElementById('user-role').innerText = decoded.role;
  if (decoded.myPicture) {
    document.getElementById('userAvatar').src = decoded.myPicture;
  }
}

// --- Data Fetching and Table Rendering --- //
const itemsPerPage = 20;
let currentPage = 1;
let allData = [];

async function fetchData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/order-agent/inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken
      },
      body: JSON.stringify({})
    });

    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('authToken');
            window.location.href = RETURN_LOGIN_PAGE;
        }
        throw new Error('Fetch failed');
    }

    allData = await res.json();
    renderTableData(currentPage);
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

function renderTableData(page) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedData = allData.slice(start, end);

  const tableBody = document.querySelector("#userTable tbody");
  tableBody.innerHTML = "";

  paginatedData.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <a href="task-detail.html?id=${item.id}" class="text-primary">${item.id}</a>
      </td>
      <td>${item.appointment_date || ''}</td>
      <td>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}" target="_blank" rel="noopener noreferrer">
          ${item.location}
        </a>
      </td>
      <td>${item.creator || ''}</td>
      <td>${item.order_status || ''}</td>
    `;
    tableBody.appendChild(row);
  });

  generatePagination();
}

// --- Pagination --- //
function generatePagination() {
  const totalPages = Math.ceil(allData.length / itemsPerPage);
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  const createPageItem = (text, pageNumber, isDisabled = false, isActive = false) => {
    const li = document.createElement("li");
    li.className = `page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "#";
    a.innerText = text;
    if (!isDisabled) {
        a.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = pageNumber;
            renderTableData(currentPage);
        });
    }
    li.appendChild(a);
    return li;
  };

  // Previous button
  paginationContainer.appendChild(createPageItem('ก่อนหน้า', currentPage - 1, currentPage === 1));

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.appendChild(createPageItem(i, i, false, i === currentPage));
  }

  // Next button
  paginationContainer.appendChild(createPageItem('ถัดไป', currentPage + 1, currentPage === totalPages));
}


// --- Event Listeners --- //
function setupEventListeners() {
    const logoutButton = document.getElementById('logout');
    if(logoutButton) {
        logoutButton.addEventListener('click', function (event) {
            event.preventDefault();
            localStorage.removeItem('authToken');
            window.location.href = RETURN_LOGIN_PAGE;
        });
    }
}

// --- Initial Load --- //
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  fetchData();
  setupEventListeners();
});
