// Check if the user has a valid token and the required role
      const accessToken = localStorage.getItem('authToken'); // Check if token is available
      const RETURN_LOGIN_PAGE = '../index.html';
      console.log("aaa" + accessToken);

      // If there's no token, redirect to login
      if (!accessToken) {
        window.location.href = RETURN_LOGIN_PAGE;
      }

// Function to decode JWT token
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode JWT:', e);
      return null;
    }
  }

  // Function to get user role from token
  function getUserRole() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const decoded = parseJwt(token);
    return decoded ? decoded.role : null;
  }

document.addEventListener('DOMContentLoaded', () => {
    const userRole = getUserRole();
    console.log('User Role:', userRole); // For debugging

    const addNewItemBtn = document.getElementById('add-new-item-btn');
    const headerOrderDate = document.getElementById('header-order-date');
    const headerOrderType = document.getElementById('header-order-type');
    const headerAmount = document.getElementById('header-amount');
    const headerOwner = document.getElementById('header-owner');

    if (userRole === 'Insurance') {
      if (addNewItemBtn) addNewItemBtn.classList.add('hidden-by-role');
      if (headerOrderDate) headerOrderDate.style.display = 'none';
      if (headerOrderType) headerOrderType.style.display = 'none';
      if (headerAmount) headerAmount.style.display = 'none';
      if (headerOwner) headerOwner.style.display = 'none';
    } else if (userRole === 'Bike') {
      if (addNewItemBtn) addNewItemBtn.classList.add('hidden-by-role');
      if (headerOrderDate) headerOrderDate.style.display = 'none';
      if (headerOrderType) headerOrderType.style.display = 'none';
    }

    // New logic for 'Insurance' role to pre-select and disable insur_comp filter
    if (userRole === 'Insurance') {
      const token = localStorage.getItem('authToken');
      if (token) {
        const decodedToken = parseJwt(token);
        const userInsurComp = decodedToken ? decodedToken.insur_comp : '';
        const userRoleSelect = document.getElementById('UserRole');
        if (userRoleSelect && userInsurComp) {
          userRoleSelect.value = userInsurComp;
          userRoleSelect.disabled = true;
        }
      }
    }
  });

fetch('/version.json')
        .then(res => res.json())
        .then(data => {
          document.getElementById("appVersion").textContent = `App Version ${data.version}`;
        })
        .catch(() => {
          document.getElementById("appVersion").textContent = "App Version -";
        });

const API_BASE_URL = 'https://be-claims-service.onrender.com';
      // Constants for URLs and other fixed strings
      const LOGIN_PAGE = '../index.html';
      const API_URL = `${API_BASE_URL}/api/order-status/inquiry`;

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
            method: 'POST',
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

          const result = await response.json();
          const order = result.order;

          // ✅ อัปเดต DOM
          document.getElementById('totalOrders').textContent = order.total_orders || 0;
          document.getElementById('pendingOrders').textContent = order.pending_orders || 0;
          document.getElementById('inProgressOrders').textContent = order.in_progress_orders || 0;
          document.getElementById('completedOrders').textContent = order.completed_orders || 0;

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

// Check user role
  const userRole = getUserRole();
  if (userRole) {
    // Check if the user has the 'admin' role
    if (userRole === 'Operation Manager' || userRole === 'Director' || userRole === 'Developer') {
      // Show the admin menu
      document.getElementById('admin-menu').style.display = 'block';
    }
    if (userRole === 'Officer') {
      localStorage.removeItem('authToken');
      window.location.href = '../index.html';
    }
  }

const itemsPerPage = 20;
  let currentPage = 1;
  let allData = [];
  let fetchDataCalled = false; // flag ป้องกันเรียกซ้ำ

  // debounce function ลดการเรียกซ้ำ
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  async function fetchData() {
    if (fetchDataCalled) return; // ถ้าเคยเรียกแล้ว return เลย
    fetchDataCalled = true;
    console.log("fetchData called");

    try {
      const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
      if (!token) {
        console.error('❌ Error: No token found in localStorage. User not authenticated.');
        // Optionally, redirect to login page or show a message
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/orders/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!res.ok) throw new Error('Fetch failed');

      const data = await res.json();
      allData = data;
      currentPage = 1;
      renderTableData(currentPage);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }

  const debouncedFetchData = debounce(fetchData, 300);

  function renderTableData(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = allData.slice(start, end);

    const tableBody = document.querySelector("#userTable tbody");
    tableBody.innerHTML = "";

    paginatedData.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><a href="task-detail.html?id=${item.id}" class="text-primary">${item.id}</a></td>
        <td>${item.insur_comp || ''}</td>
        <td>${item.order_date || ''}</td>
        <td>${item.appointment_date || ''}</td>
        <td>${item.car_registration || ''}</td>
        <td>${item.location || ''}</td>
        <td>${item.order_type || ''}</td>
        <td>${item.order_status || ''}</td>
        <td>${item.amount || ''}</td>
        <td>${item.owner_full_name || ''}</td>
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
    prevButton.addEventListener("click", e => {
      e.preventDefault();
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
      pageItem.addEventListener("click", e => {
        e.preventDefault();
        currentPage = i;
        renderTableData(currentPage);
      });
      paginationContainer.appendChild(pageItem);
    }

    const nextButton = document.createElement("li");
    nextButton.classList.add("page-item");
    nextButton.innerHTML = `<a class="page-link" href="#">ถัดไป</a>`;
    nextButton.addEventListener("click", e => {
      e.preventDefault();
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

  // เรียก fetchData ครั้งแรกตอนโหลดหน้า
  document.addEventListener('DOMContentLoaded', () => {
    debouncedFetchData();
  });

let itemsPerPage2 = 20;
  let currentPage2 = 1;
  let allData2 = [];

  function getDateRange(range) {
    const today = new Date();
    let fromDate, toDate;
    const formatDate = (d) => d.toISOString().slice(0, 10);

    switch (range) {
      case 'today': fromDate = toDate = today; break;
      case 'yesterday': fromDate = toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1); break;
      case 'last7': toDate = today; fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6); break;
      case 'last30': toDate = today; fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29); break;
      case 'thisMonth': fromDate = new Date(today.getFullYear(), today.getMonth(), 1); toDate = today; break;
      case 'lastMonth': fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); toDate = new Date(today.getFullYear(), today.getMonth(), 0); break;
      default: fromDate = toDate = null;
    }

    return { from: fromDate ? formatDate(fromDate) : null, to: toDate ? formatDate(toDate) : null };
  }

  function getFilters() {
    const filter = {
      insur_comp: document.getElementById('UserRole')?.value || '',
      branch: document.getElementById('UserPlan')?.value || '',
      transaction_type: document.getElementById('FilterTransaction1')?.value !== 'งานทั้งหมด' ? document.getElementById('FilterTransaction1')?.value : '',
      order_type: document.getElementById('FilterTransaction2')?.value || '',
      order_status: document.getElementById('FilterTransaction3')?.value || '',
      id: document.getElementById('filterJobCode')?.value || '',
      created_by: document.getElementById('filterCreatedBy')?.value || '',
      owner: document.getElementById('filterAssignedTo')?.value || ''
    };

    const dateField = document.getElementById('FilterTransaction4')?.value || '';
    const dateRangeRaw = document.getElementById('filterDateTime')?.value || '';

    if (dateRangeRaw.includes(' to ')) {
      const [fromRaw, toRaw] = dateRangeRaw.split(" to ").map(s => s.trim());
      const from = fromRaw + " 00:00:00";
      const to = toRaw + " 23:59:59";
      if (dateField === "วันที่สร้างงาน") {
        filter.order_date_from = from;
        filter.order_date_to = to;
      } else if (dateField === "วันที่นัดหมาย") {
        filter.appointment_date_from = from;
        filter.appointment_date_to = to;
      }
    }

    return filter;
  }

  async function fetchData(filter = {}) {
    try {
      const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
      if (!token) {
        console.error('❌ Error: No token found in localStorage. User not authenticated.');
        // Optionally, redirect to login page or show a message
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/orders/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filter)
      });
      if (!res.ok) throw new Error('Fetch failed');
      allData2 = await res.json();
      currentPage2 = 1;
      renderTableData(currentPage2);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
    }
  }

  function renderTableData(page) {
    const start = (page - 1) * itemsPerPage2;
    const end = start + itemsPerPage2;
    const paginatedData = allData2.slice(start, end);

    const tableBody = document.querySelector("#userTable tbody");
    tableBody.innerHTML = "";

    paginatedData.forEach(item => {
      const row = document.createElement("tr");
      let rowContent = `
        <td><a href="task-detail.html?id=${item.id}" class="text-primary" target="_blank" rel="noopener noreferrer">${item.id}</a></td>
        <td>${item.insur_comp || ''}</td>
      `;

      const userRole = getUserRole(); // Get user role from token
      if (userRole === 'Insurance') { // If 'Insurance' role, show only specific columns
        rowContent += `
          <td>${item.appointment_date || ''}</td>
          <td>${item.car_registration || ''}</td>
          <td>${item.location || ''}</td>
          <td>${item.order_status || ''}</td>
        `;
      } else if (userRole === 'Bike') {
        rowContent += `
          <td>${item.appointment_date || ''}</td>
          <td>${item.car_registration || ''}</td>
          <td>${item.location || ''}</td>
          <td>${item.order_status || ''}</td>
          <td>${item.amount || ''}</td>
          <td>${item.owner_full_name || ''}</td>
        `;
      } else { // If not 'Insurance' role, show all original columns
        rowContent += `
          <td>${item.order_date || ''}</td>
          <td>${item.appointment_date || ''}</td>
          <td>${item.car_registration || ''}</td>
          <td>${item.location || ''}</td>
          <td>${item.order_type || ''}</td>
          <td>${item.order_status || ''}</td>
          <td>${item.amount || ''}</td>
          <td>${item.owner_full_name || ''}</td>
        `;
      }
      row.innerHTML = rowContent;
      tableBody.appendChild(row);
    });

    generatePagination();
  }

  function generatePagination() {
    const totalPages = Math.ceil(allData2.length / itemsPerPage2);
    const paginationContainer = document.querySelector(".pagination");
    paginationContainer.innerHTML = "";

    const prevButton = document.createElement("li");
    prevButton.classList.add("page-item");
    prevButton.innerHTML = `<a class="page-link" href="#">ก่อนหน้า</a>`;
    prevButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage2 > 1) {
        currentPage2--;
        renderTableData(currentPage2);
      }
    });
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement("li");
      pageItem.classList.add("page-item");
      pageItem.id = `page-${i}`;
      pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      pageItem.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage2 = i;
        renderTableData(currentPage2);
      });
      paginationContainer.appendChild(pageItem);
    }

    const nextButton = document.createElement("li");
    nextButton.classList.add("page-item");
    nextButton.innerHTML = `<a class="page-link" href="#">ถัดไป</a>`;
    nextButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage2 < totalPages) {
        currentPage2++;
        renderTableData(currentPage2);
      }
    });
    paginationContainer.appendChild(nextButton);

    setActivePage(currentPage2);
  }

  function setActivePage(pageNumber) {
    document.querySelectorAll(".pagination .page-item").forEach(p => p.classList.remove("active"));
    const activePage = document.querySelector(`#page-${pageNumber}`);
    if (activePage) activePage.classList.add("active");
  }

  function setupFilterListeners() {
    // Range dropdown
    document.querySelectorAll('.dropdown-menu a.dropdown-item').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const range = a.getAttribute('data-range');
        if (ranges[range]) fp.setDate(ranges[range], true);
      });
    });

    // Enter ใน input text
    ['filterJobCode', 'filterCreatedBy', 'filterAssignedTo'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            currentPage2 = 1;
            fetchData(getFilters());
          }
        });
      }
    });

    // ปุ่มค้นหา
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage2 = 1;
        fetchData(getFilters());
      });
    }
  }

  let fp;
  const ranges = {
    today: [new Date(), new Date()],
    yesterday: [new Date(new Date().setDate(new Date().getDate() - 1)), new Date(new Date().setDate(new Date().getDate() - 1))],
    last7: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()],
    last30: [new Date(new Date().setDate(new Date().getDate() - 29)), new Date()],
    thisMonth: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()],
    lastMonth: [new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), new Date(new Date().getFullYear(), new Date().getMonth(), 0)]
  };

  document.addEventListener('DOMContentLoaded', () => {
    // fetchData(); // โหลดครั้งแรก - ปิดการใช้งานเพื่อให้ตารางว่างในตอนเริ่มต้น
    setupFilterListeners();

    const nowInBangkok = new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
    const todayBangkok = new Date(nowInBangkok);
    todayBangkok.setHours(6, 0, 0, 0);

    fp = flatpickr("#filterDateTime", {
      mode: "range",
      dateFormat: "Y-m-d",
      locale: "th",
      defaultDate: [todayBangkok, todayBangkok],
      time_24hr: true,
      onChange: function (selectedDates) {
        if (selectedDates.length === 2) {
          const from = selectedDates[0].toISOString().slice(0, 10);
          const to = selectedDates[1].toISOString().slice(0, 10);
          document.getElementById('filterDateTime').value = `${from} to ${to}`;
          // ไม่ fetch ทันที
        }
      }
    });
  });

  document.getElementById('exportExcelBtn').addEventListener('click', () => {
    if (!allData2 || allData2.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    // สร้าง worksheet จากข้อมูล allData2
    const worksheetData = allData2.map(item => ({
      "รหัสงาน": item.id,
      "บริษัทประกัน": item.insur_comp,
      "วันที่ทำรายการ": item.order_date,
      "วันที่นัดหมาย": item.appointment_date,
      "ทะเบียนรถ": item.car_registration,
      "สถานที่": item.location,
      "ประเภทงาน": item.order_type,
      "สถานะงาน": item.order_status,
      "ผู้สร้างงาน": item.creator,
      "ผู้รับผิดชอบ": item.owner_full_name,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    XLSX.writeFile(workbook, "orders_export.xlsx");
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

