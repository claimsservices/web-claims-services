// JWT and user role handling
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

function getUserRole() {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  const decoded = parseJwt(token);
  return decoded ? decoded.role : null;
}

// DOMContentLoaded listener for UI adjustments
document.addEventListener('DOMContentLoaded', () => {
  const userRole = getUserRole();
  console.log('User Role:', userRole);

  const addNewItemBtn = document.getElementById('add-new-item-btn');
  const headerOrderDate = document.getElementById('header-order-date');
  const headerOrderType = document.getElementById('header-order-type');
  const headerAmount = document.getElementById('header-amount');
  const headerOwner = document.getElementById('header-owner');
  const filterAssignedTo = document.getElementById('filterAssignedTo');
  const summaryCards = document.getElementById('summaryCardsContainer');
  const accountSettingsMenu = document.getElementById('account-settings-menu');
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  const filterPanel = document.getElementById('filter-panel');
  const filterControls = document.getElementById('filter-controls');

  if (userRole === 'Insurance' || userRole === 'Bike') {
    if(summaryCards) summaryCards.classList.add('hidden-by-role');
    if(accountSettingsMenu) accountSettingsMenu.classList.add('hidden-by-role');
    if(exportExcelBtn) exportExcelBtn.classList.add('hidden-by-role');
  }

  if (userRole === 'Bike') {
    if(filterControls) filterControls.classList.add('hidden-by-role');
    fetchData(getFilters()); // Automatically fetch data for Bike role on load
  }
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
    if(filterAssignedTo) filterAssignedTo.style.display = 'none';
  }

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

  if (userRole === 'Operation Manager' || userRole === 'Director' || userRole === 'Developer') {
    const adminMenu = document.getElementById('admin-menu');
    if(adminMenu) adminMenu.style.display = 'block';
  }
  if (userRole === 'Officer') {
    localStorage.removeItem('authToken');
    window.location.href = '../index.html';
  }

  loadUserProfile();
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
      }
    }
  });
});

// Version fetching
fetch('/version.json')
  .then(res => res.json())
  .then(data => {
    document.getElementById("appVersion").textContent = `App Version ${data.version}`;
  })
  .catch(() => {
    document.getElementById("appVersion").textContent = "App Version -";
  });

// API and constants
const API_BASE_URL = 'https://be-claims-service.onrender.com'; // URL สำหรับ Production/Deploy
// const API_BASE_URL = 'http://localhost:8181'; // URL สำหรับ Local development
const ORDER_STATUS_API_URL = `${API_BASE_URL}/api/order-status/inquiry`;

// User profile loading
async function loadUserProfile() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = LOGIN_PAGE;
    return;
  }

  const decoded = parseJwt(token);
  if (decoded && isTokenExpired(decoded)) {
    localStorage.removeItem('authToken');
    window.location.href = LOGIN_PAGE;
    return;
  }

  if(decoded){
    document.getElementById('user-info').innerText = decoded.first_name + ' ' + decoded.last_name;
    document.getElementById('user-role').innerText = decoded.role;
    document.getElementById('userAvatar').src = decoded.myPicture;
  }

  try {
    const response = await fetch(ORDER_STATUS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `${token}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem('authToken');
      window.location.href = LOGIN_PAGE;
      return;
    }

    const result = await response.json();
    const order = result.order;

    document.getElementById('totalOrders').textContent = order.total_orders || 0;
    document.getElementById('pendingOrders').textContent = order.pending_orders || 0;
    document.getElementById('inProgressOrders').textContent = order.in_progress_orders || 0;
    document.getElementById('completedOrders').textContent = order.completed_orders || 0;

  } catch (error) {
    console.error('Error fetching user profile:', error);
    localStorage.removeItem('authToken');
    window.location.href = LOGIN_PAGE;
  }
}

function isTokenExpired(decodedToken) {
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken && decodedToken.exp && decodedToken.exp < currentTime;
}

// Data fetching and table rendering
const itemsPerPage = 20;
let currentPage = 1;
let allData = [];

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

async function fetchData(filter = {}) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found');
      return;
    }

    const userRole = getUserRole();
    let endpoint = `${API_BASE_URL}/api/orders/inquiry`;
    let body = filter;

    // If the user is a Bike, use the specific endpoint for them
    if (userRole === 'Bike') {
      endpoint = `${API_BASE_URL}/api/order-agent/inquiry`;
      body = {}; // Agent endpoint doesn't need a filter body
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error('Fetch failed');
    allData = await res.json();
    currentPage = 1;
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
    const showAmount = ['Pre-Approved', 'คีย์งานแล้ว', 'ผ่าน'].includes(item.order_status);
    const amountToDisplay = showAmount ? (item.amount || '') : '';

    let rowContent = `
      <td><a href="task-detail.html?id=${item.id}" class="text-primary" target="_blank" rel="noopener noreferrer">${item.id}</a></td>
    `;

    const userRole = getUserRole();
    if (userRole === 'Insurance') {
      rowContent += `
        <td>${item.insur_comp || ''}</td>
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
        <td>${amountToDisplay}</td>
        <td>${item.owner_full_name || ''}</td>
      `;
    } else { // Default for other roles
      rowContent += `
        <td>${item.insur_comp || ''}</td>
        <td>${item.order_date || ''}</td>
        <td>${item.appointment_date || ''}</td>
        <td>${item.car_registration || ''}</td>
        <td>${item.location || ''}</td>
        <td>${item.order_type || ''}</td>
        <td>${item.order_status || ''}</td>
        <td>${amountToDisplay}</td>
        <td>${item.owner_full_name || ''}</td>
      `;
    }
    row.innerHTML = rowContent;
    tableBody.appendChild(row);
  });

  generatePagination();
}

// Pagination
function generatePagination() {
  const totalPages = Math.ceil(allData.length / itemsPerPage);
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = "";

  const prevButton = document.createElement("li");
  prevButton.classList.add("page-item");
  prevButton.innerHTML = `<a class="page-link" href="#">ก่อนหน้า</a>`;
  prevButton.addEventListener("click", (e) => {
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
    pageItem.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderTableData(currentPage);
    });
    paginationContainer.appendChild(pageItem);
  }

  const nextButton = document.createElement("li");
  nextButton.classList.add("page-item");
  nextButton.innerHTML = `<a class="page-link" href="#">ถัดไป</a>`;
  nextButton.addEventListener("click", (e) => {
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
  document.querySelectorAll(".pagination .page-item").forEach(p => p.classList.remove("active"));
  const activePage = document.querySelector(`#page-${pageNumber}`);
  if (activePage) activePage.classList.add("active");
}

// Filters
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

function setupFilterListeners() {
  document.querySelectorAll('.dropdown-menu a.dropdown-item').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const range = a.getAttribute('data-range');
      if (ranges[range]) fp.setDate(ranges[range], true);
    });
  });

  ['filterJobCode', 'filterCreatedBy', 'filterAssignedTo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          currentPage = 1;
          fetchData(getFilters());
        }
      });
    }
  });

  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = 1;
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

// Export to Excel
document.getElementById('exportExcelBtn').addEventListener('click', () => {
  if (!allData || allData.length === 0) {
    alert('ไม่มีข้อมูลสำหรับส่งออก');
    return;
  }

  const worksheetData = allData.map(item => ({
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

// Logout
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