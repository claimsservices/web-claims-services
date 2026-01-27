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
  let currentFilterType = 'work'; // Default filter for Bike role

  const workBtn = document.getElementById('filter-work-btn');
  const preApprovedBtn = document.getElementById('filter-pre-approved-btn');

  // Event listeners for the new filter buttons
  if (workBtn) {
    workBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentFilterType = 'work';
      workBtn.classList.add('btn-primary');
      workBtn.classList.remove('btn-outline-primary');
      preApprovedBtn.classList.add('btn-outline-primary');
      preApprovedBtn.classList.remove('btn-primary');

      const filters = getFilters();
      delete filters.order_status;
      filters.order_status_not = 'Pre-Approved';
      console.log('Fetching data with filters for "Work":', JSON.stringify(filters, null, 2));
      fetchData(filters);
    });
  }

  if (preApprovedBtn) {
    preApprovedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentFilterType = 'pre-approved';
      preApprovedBtn.classList.add('btn-primary');
      preApprovedBtn.classList.remove('btn-outline-primary');
      workBtn.classList.add('btn-outline-primary');
      workBtn.classList.remove('btn-primary');

      const filters = getFilters();
      delete filters.order_status_not;
      filters.order_status = 'Pre-Approved';
      console.log('Fetching data with filters for "Pre Approved":', JSON.stringify(filters, null, 2));
      fetchData(filters);
    });
  }

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

  // Role-based UI adjustments
  if (userRole === 'Bike') {
    if (summaryCards) summaryCards.classList.add('hidden-by-role');
    if (accountSettingsMenu) accountSettingsMenu.classList.add('hidden-by-role');
    if (exportExcelBtn) exportExcelBtn.classList.add('hidden-by-role');
  }

  if (userRole === 'Bike') {
    if (filterControls) filterControls.classList.add('hidden-by-role');
    // Ensure the new filter buttons are visible for Bike role
    if (workBtn) workBtn.style.display = 'inline-block';
    if (preApprovedBtn) preApprovedBtn.style.display = 'inline-block';

    // Initial fetch for Bike role
    const initialFilters = getFilters();
    initialFilters.order_status_not = 'Pre-Approved';
    console.log('Initial fetch for Bike role with filters:', JSON.stringify(initialFilters, null, 2));
    // fetchData(initialFilters); // Default to Work tasks
  } else {
    // Hide the new filter buttons for non-Bike roles
    if (workBtn) workBtn.style.display = 'none';
    if (preApprovedBtn) preApprovedBtn.style.display = 'none';
    // For non-Bike roles, fetch data with existing filters
    // fetchData(getFilters());
  }

  if (userRole === 'Insurance') {
    if (headerOrderDate) headerOrderDate.style.display = 'none';
    if (headerOrderType) headerOrderType.style.display = 'none';
    if (headerAmount) headerAmount.style.display = 'none';
    if (headerOwner) headerOwner.style.display = 'none';
  } else if (userRole === 'Bike') {
    if (addNewItemBtn) addNewItemBtn.classList.add('hidden-by-role');
    if (headerOrderDate) headerOrderDate.style.display = 'none';
    if (headerOrderType) headerOrderType.style.display = 'none';
    if (filterAssignedTo) filterAssignedTo.style.display = 'none';
  }

  if (userRole === 'Insurance') {
    const pendingOrdersCard = document.getElementById('pendingOrdersCard');
    const inProgressOrdersCard = document.getElementById('inProgressOrdersCard');
    const completedOrdersCard = document.getElementById('completedOrdersCard');

    if (pendingOrdersCard) pendingOrdersCard.style.display = 'none';
    if (inProgressOrdersCard) inProgressOrdersCard.style.display = 'none';
    if (completedOrdersCard) completedOrdersCard.style.display = 'none';

    const userRoleSelect = document.getElementById('UserRole');
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = parseJwt(token);
      const userInsurComp = decodedToken ? decodedToken.insur_comp : '';
      if (userRoleSelect && userInsurComp) {
        userRoleSelect.value = userInsurComp;
        userRoleSelect.disabled = true;
      }
    }
  }

  // Robustly handle admin menu visibility using polling
  const adminRoles = ['Operation Manager', 'Director'];
  if (adminRoles.includes(userRole)) {
    const interval = setInterval(() => {
      const adminMenu = document.getElementById('admin-menu');
      if (adminMenu) {
        adminMenu.style.display = 'block';
        clearInterval(interval); // Stop polling once the element is found and updated
      }
    }, 100); // Check every 100ms
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
    onChange: function (selectedDates, dateStr, instance) {
      if (selectedDates.length === 2) {
        // Fix: Use instance.formatDate to strictly use the local date selected by the user.
        // Previous code used toISOString() which converted local time (00:00) to UTC (prev day 17:00), causing the -1 day error.
        const from = instance.formatDate(selectedDates[0], "Y-m-d");
        const to = instance.formatDate(selectedDates[1], "Y-m-d");
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

// const API_BASE_URL = 'http://localhost:8181'; // URL สำหรับ Local development
const ORDER_STATUS_API_URL = `https://be-claims-service.onrender.com/api/order-status/inquiry`;

// User profile loading
async function loadUserProfile() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = RETURN_LOGIN_PAGE;
    return;
  }

  const decoded = parseJwt(token);
  if (decoded && isTokenExpired(decoded)) {
    localStorage.removeItem('authToken');
    window.location.href = RETURN_LOGIN_PAGE;
    return;
  }

  if (decoded) {
    document.getElementById('user-info').innerText = decoded.first_name + ' ' + decoded.last_name;
    document.getElementById('user-role').innerText = decoded.role;

    const userAvatar = document.getElementById('userAvatar');
    if (decoded.myPicture) {
      userAvatar.src = decoded.myPicture;
    } else {
      userAvatar.src = '../assets/img/avatars/A1.png'; // Default avatar
    }
  }

  try {
    const userRole = getUserRole(); // Get user role here

    let body = {};
    if (userRole === 'Admin' || userRole === 'Director' || userRole === 'Developer' || userRole === 'Admin Officer' || userRole === 'Officer' || userRole === 'Leader' || userRole === 'Sales Manager') {
      body = {
        total_orders_status_not: 'ยกเลิก',
        pending_orders_status: 'เปิดงาน',
        in_progress_orders_status: 'รับเรื่อง'
      };
    }

    const response = await fetch(ORDER_STATUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {

      console.error('API call to ORDER_STATUS_API_URL failed:', response.status, await response.text());

      localStorage.removeItem('authToken');

      window.location.href = RETURN_LOGIN_PAGE;

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
  return function (...args) {
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
    let endpoint = `https://be-claims-service.onrender.com/api/orders/inquiry`;
    let body = filter;

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
    updateSummaryCards(allData); // Calculate counters based on filtered data
    renderTableData(currentPage);
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

// Format Date/Time to Local Thai Time (Reusable)
const formatDateTime = (dateStr) => {
  if (!dateStr) return '';

  let rawDate = dateStr;

  // Ensure we are working with a string for manipulation
  if (typeof dateStr === 'string') {
    // Replace space with T for ISO 8601 compatibility (e.g., "2024-01-01 12:00:00" -> "2024-01-01T12:00:00")
    if (rawDate.includes(' ')) {
      rawDate = rawDate.replace(' ', 'T');
    }

    // Force UTC interpretation if no timezone is specified (no 'Z' and no offset like +07:00)
    // This fixes issues where local strings are interpreted as browser local time.
    const hasTimeZone = rawDate.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(rawDate);
    if (!hasTimeZone) {
      rawDate += 'Z';
    }
  }

  const date = new Date(rawDate);

  if (isNaN(date.getTime())) {
    return dateStr; // Fallback if parsing fails
  }

  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok'
  });
};



function renderTableData(page) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedData = allData.slice(start, end);

  const tableBody = document.querySelector("#userTable tbody");
  tableBody.innerHTML = "";

  paginatedData.forEach(item => {
    const row = document.createElement('tr');

    const displayAppointmentDate = formatDateTime(item.appointment_date);
    const displayOrderDate = formatDateTime(item.order_date);

    let rowContent = `
      <td><a href="task-detail.html?id=${item.id}" class="text-primary" target="_blank" rel="noopener noreferrer">${item.id}</a></td>
    `;

    // Fix Task 9: Show amount for multiple statuses (Pass, Pre-Approved, etc.)
    const canShowAmount = ['ผ่าน', 'Pre-Approved', 'คีย์งานแล้ว'].includes(item.order_status);
    const amountToDisplay = canShowAmount && item.amount ? Number(item.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-';

    const userRole = getUserRole();
    if (userRole === 'Insurance') {
      rowContent += `
        <td>${item.insur_comp || ''}</td>
        <td>${displayAppointmentDate}</td>
        <td>${item.car_registration || ''}</td>
        <td>${item.location || ''}</td>
        <td>${item.order_status || ''}</td>
      `;
    } else if (userRole === 'Bike') {
      rowContent += `
        <td>${item.insur_comp || ''}</td>
        <td>${displayAppointmentDate}</td>
        <td>${item.car_registration || ''}</td>
        <td>${item.location || ''}</td>
        <td>${item.order_status || ''}</td>
        <td>${amountToDisplay}</td>
        <td>${item.owner_full_name || ''}</td>
      `;
    } else { // Default for other roles
      rowContent += `
        <td>${item.insur_comp || ''}</td>
        <td>${formatDateTime(item.created_date)}</td>
        <td>${displayAppointmentDate}</td>
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

function updateSummaryCards(data) {
  if (!data) return;

  // 1. Total Work (งานทั้งหมด)
  // Count based on what's in the table
  const total = data.length;
  document.getElementById('totalOrders').textContent = total || 0;

  // 2. Not Appointed (งานยังไม่ได้นัดหมาย) -> order_status == 'เปิดงาน'
  const pending = data.filter(item => item.order_status === 'เปิดงาน').length;
  document.getElementById('pendingOrders').textContent = pending || 0;

  // 3. Wait Assign (งานรอ Assign) -> Not currently assigned (no owner) AND (maybe check appointment_date or status?)
  // Based on requirement: "งานรอ Assign" usually means ready for assign but no owner yet.
  // The previous logic for this card was server-side so we approximate or use specific rule.
  // Let's assume: Appointment Date exists, but Owner is null/empty.
  // OR simply check if 'owner' field is null/empty if that data is available. 
  // From backend response, we have 'owner_full_name' and 'owner' ID.
  const inProgress = data.filter(item => !item.owner_full_name && item.appointment_date).length;
  document.getElementById('inProgressOrders').textContent = inProgress || 0;

  // 4. Alert (งานแจ้งเตือน) -> order_status == 'รออนุมัติ' (Wait for Approval) or 'Completed'?
  // The previous code mapped 'completedOrders' to 'งานแจ้งเตือน'.
  // Let's assume 'รออนุมัติ' is what they want to track as "Alert" / Notification needed.
  // Or if it was 'Completed' previously, maybe it means 'Job Done'?
  // Re-reading task requirement: "งานทั้งหมด,งานยังไม่ได้นัดหมาย,งานรอ Assign,งานแจ้งเตือน"
  // Let's use 'รออนุมัติ' as "Alert" for now as it usually requires attention.
  const completed = data.filter(item => item.order_status === 'รออนุมัติ').length;
  document.getElementById('completedOrders').textContent = completed || 0;
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
    car_registration: document.getElementById('filterCarRegistration')?.value || '',
    owner: document.getElementById('filterAssignedTo')?.value || ''
  };

  const dateField = document.getElementById('FilterTransaction4')?.value || '';
  const dateRangeRaw = document.getElementById('filterDateTime')?.value || '';

  if (dateRangeRaw.includes(' to ')) {
    const [fromRaw, toRaw] = dateRangeRaw.split(" to ").map(s => s.trim());

    // Construct BKK Date objects
    // fromRaw is "YYYY-MM-DD" e.g. "2024-01-14"
    // We want 2024-01-14 00:00:00 BKK -> 2024-01-13 17:00:00 UTC
    // We want 2024-01-16 23:59:59 BKK -> 2024-01-16 16:59:59 UTC

    const fromDate = new Date(`${fromRaw}T00:00:00+07:00`);
    const toDate = new Date(`${toRaw}T23:59:59+07:00`);

    // Helper to format as "YYYY-MM-DD HH:mm:ss" in UTC
    const toUTCString = (date) => {
      return date.toISOString().replace('T', ' ').slice(0, 19);
    };

    const from = toUTCString(fromDate);
    const to = toUTCString(toDate);

    if (dateField === "วันที่สร้างงาน") {
      filter.order_date_from = from;
      filter.order_date_to = to;
    } else if (dateField === "วันที่นัดหมาย") {
      filter.appointment_date_from = from;
      filter.appointment_date_to = to;
    }
  }

  console.log('[DEBUG] getFilters returning:', JSON.stringify(filter, null, 2));
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

  ['filterJobCode', 'filterCarRegistration', 'filterAssignedTo'].forEach(id => {
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
    "วันที่ทำรายการ": formatDateTime(item.created_date),
    "วันที่นัดหมาย": formatDateTime(item.appointment_date),
    "ทะเบียนรถ": item.car_registration,
    "สถานที่": item.location,
    "ประเภทงาน": item.order_type,
    "สถานะงาน": item.order_status,
    "ผู้สร้างงาน": item.creator,
    "ผู้รับผิดชอบ": item.owner_full_name,
    "ข้อมูลอ้างอิง": item.s_ref,
    "ข้อมูลอ้างอิง (เพิ่มเติม)": item.s_ref_2
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