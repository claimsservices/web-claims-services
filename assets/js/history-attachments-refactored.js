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

import { API_BASE_URL } from './api-config.js';
      // Constants for URLs and other fixed strings
      const LOGIN_PAGE = '../index.html';
      const API_URL = `${API_BASE_URL}/api/auth/profile`;

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
        function parseJwt(token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          return JSON.parse(jsonPayload);
        }

        // ใช้งาน
        const decoded = parseJwt(token);

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
        imgElement.src = imageUrl;  // Update the image src dynamically

        if (decoded && isTokenExpired(decoded)) {
          // Token is expired
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
      document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
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

const itemsPerPage = 20;
  let currentPage = 1;
  let allData = []; // จะเก็บข้อมูลที่ได้จาก API ทั้งหมด

  async function fetchData() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/history-agent/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({}) // สามารถใส่ filter ได้ เช่น { insur_comp: 'AIA' }
      });

      if (!res.ok) throw new Error('Fetch failed');

      const data = await res.json();
      allData = data;
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
        <td>${item.id}
        </td>
        <td>${item.appointment_date || ''}</td>
        <td>${item.location}
    </td>
        <td>${item.creator}</td>
        <td>${item.order_status}</td>
      `;
      tableBody.appendChild(row);
    });

    generatePagination();
  }

  function generatePagination() {
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = "";

    const prevButton = document.createElement("li");
    prevButton.classList.add("page-item");
    prevButton.innerHTML = `<a class="page-link" href="#">ก่อนหน้า</a>`;
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTableData(currentPage);
      }
    });
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement("li");
      pageItem.classList.add("page-item");
      pageItem.id = `page-${i}`;
      pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      pageItem.addEventListener("click", () => {
        currentPage = i;
        renderTableData(currentPage);
      });
      paginationContainer.appendChild(pageItem);
    }

    const nextButton = document.createElement("li");
    nextButton.classList.add("page-item");
    nextButton.innerHTML = `<a class="page-link" href="#">ถัดไป</a>`;
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTableData(currentPage);
      }
    });
    paginationContainer.appendChild(nextButton);

    setActivePage(currentPage);
  }

  function setActivePage(pageNumber) {
    const pages = document.querySelectorAll(".pagination .page-item");
    pages.forEach(page => page.classList.remove("active"));
    const activePage = document.querySelector(`#page-${pageNumber}`);
    if (activePage) activePage.classList.add("active");
  }

  // เริ่มโหลดข้อมูลเมื่อหน้าโหลด
  fetchData();

document.addEventListener('DOMContentLoaded', function () {
    // สร้างวันที่ใน timezone Asia/Bangkok และตั้งเวลาเป็น 06:00
    const nowInBangkok = new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
    const todayBangkok = new Date(nowInBangkok);
    todayBangkok.setHours(6, 0, 0, 0); // ตั้งเวลาเป็น 06:00:00

    // เปิด Flatpickr
    flatpickr("#filterDateTime", {
      enableTime: true,
      dateFormat: "d/m/Y H:i",  // dd/MM/yyyy HH:mm
      defaultDate: todayBangkok,
      time_24hr: true,
      locale: "th"
    });
  });

document.getElementById('logout').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('authToken');
    window.location.href = '../index.html';
  });

  document.getElementById('logout-menu').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('authToken');
    window.location.href = '../index.html';
  });

