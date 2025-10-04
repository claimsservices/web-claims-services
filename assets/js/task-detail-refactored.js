// =========================================================
  // HELPERS & CONFIG
  // =========================================================

  const accessToken = localStorage.getItem('authToken');
  const RETURN_LOGIN_PAGE = '../index.html';
  const API_BASE_URL = 'https://be-claims-service.onrender.com'; // URL สำหรับ Production/Deploy
  // const API_BASE_URL = 'http://localhost:8181'; // URL สำหรับ Local development
  const LOGIN_PAGE = '../index.html';
  const API_URL = `${API_BASE_URL}/api/auth/profile`;

  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
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

  function getSafeValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : null;
  }

  if (!accessToken) {
    window.location.href = RETURN_LOGIN_PAGE;
  }

  fetch('/version.json')
    .then(res => res.json())
    .then(data => { if(document.getElementById("appVersion")) document.getElementById("appVersion").textContent = `App Version ${data.version}`; })
    .catch(() => { if(document.getElementById("appVersion")) document.getElementById("appVersion").textContent = "App Version -"; });

  function isTokenExpired(decodedToken) {
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken && decodedToken.exp && decodedToken.exp < currentTime;
  }

  // =========================================================
  // API & DATA LOADING FUNCTIONS
  // =========================================================

  async function loadUserProfile() {
    const token = localStorage.getItem('authToken');
    if (!token) { window.location.href = LOGIN_PAGE; return; }
    const decoded = parseJwt(token);
    if (!decoded) { localStorage.removeItem('authToken'); window.location.href = LOGIN_PAGE; return; }

    const { first_name, last_name, role, myPicture } = decoded;
    const userInfoEl = document.getElementById('user-info');
    if (userInfoEl) userInfoEl.innerText = `${first_name} ${last_name}`;
    const ownerNameEl = document.getElementById('ownerName');
    if (ownerNameEl) ownerNameEl.value = `${first_name} ${last_name}`;
    const userRoleEl = document.getElementById('user-role');
    if (userRoleEl) userRoleEl.innerText = role;
    const imgElement = document.getElementById('userAvatar');
    if (imgElement && myPicture) imgElement.src = myPicture;

    if (isTokenExpired(decoded)) {
      localStorage.removeItem('authToken');
      window.location.href = LOGIN_PAGE;
      return;
    }

    try {
      const response = await fetch(API_URL, { headers: { 'Authorization': `${token}` } });
      if (!response.ok) {
        localStorage.removeItem('authToken');
        window.location.href = LOGIN_PAGE;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('authToken');
      window.location.href = LOGIN_PAGE;
    }
  }

  async function loadOrderData(orderId) {
    const token = localStorage.getItem('authToken') || '';
    try {
                  console.log('Making API call to /order-detail/inquiry with method:', 'POST');
                  const response = await fetch(`${API_BASE_URL}/api/order-detail/inquiry`, {        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
        body: JSON.stringify({ order_id: orderId })
      });
      const result = await response.json();
      if (!response.ok) {
        alert('❌ ไม่พบข้อมูล: ' + result.message);
        return;
      }

      const { order, order_details, order_assign, order_hist, order_pic } = result;
      const userRole = getUserRole();
      if (userRole !== 'Bike' && userRole !== 'Insurance') {
        await loadAssignees(order, token);
      }

      const setValue = (id, value) => { const el = document.getElementById(id); if (el && value !== undefined && value !== null) el.value = value; };
      const setChecked = (id, value) => { const el = document.getElementById(id); if (el) el.checked = value; };

      setValue('taskId', order.id);
      setValue('jobType', order.order_type);
      setValue('orderStatus', order.order_status);
      setValue('channel', order.channel);
      setValue('processType', order.process_type);
      setValue('insuranceCompany', order.insur_comp);
      setValue('transactionDate', order.order_date?.slice(0, 19).replace('T', ' '));
      setValue('carRegistration', order.car_registration);
      setValue('address', order.location);

      if (order.appointment_date) {
        const dt = new Date(order.appointment_date);
        setValue('appointmentDate', dt.toISOString().slice(0, 10));
        setValue('appointmentTime', dt.toTimeString().slice(0, 5));
      }

      if (order_details) {
        setValue('phone', order_details.tell_1);
        setValue('phone2', order_details.tell_2);
        setValue('phone3', order_details.tell_3);
        setValue('c_insure', order_details.c_insure);
        setValue('c_tell', order_details.c_tell);
        setValue('carProvince', order_details.c_car_province);
        const brandSelect = document.getElementById('carBrand');
        if (brandSelect) {
          brandSelect.value = order_details.c_brand;
          brandSelect.dispatchEvent(new Event('change'));
        }
        setValue('carModel', order_details.c_version);
        setValue('carYear', order_details.c_year);
        setValue('carChassis', order_details.c_number);
        setValue('carEngine', order_details.c_engine);
        setValue('c_mile', order_details.c_mile);
        setValue('carType', order_details.c_type);
        setValue('carColor', order_details.c_coller);
        setChecked('received-doc', order_details.c_recieve);
        setValue('insuranceBranch', order_details.s_branch);
        setValue('reference1', order_details.s_ref);
        setValue('reference2', order_details.s_ref_2);
        setValue('policyNumber', order_details.s_number);
        if (order_details?.s_start) setValue('coverageStartDate', order_details.s_start.slice(0, 10));
        if (order_details?.s_end) setValue('coverageEndDate', order_details.s_end.slice(0, 10));
        setValue('insuranceType', order_details.s_type);
        setValue('s_remark', order_details.s_remark);
        setValue('s_ins_remark', order_details.s_ins_remark);
        setValue('s_detail', order_details.s_detail);
        setChecked('fleetCar', order_details.s_fleet);
        setValue('creatorName', order_details.c_name);
      }

      if (order_assign.length > 0) setChecked('contactedCustomer', order_assign[0].is_contact);

      const timelineEl = document.getElementById('historyTimeline');
      if (timelineEl) {
        timelineEl.innerHTML = '';
        if (order_hist && order_hist.length > 0) {
          order_hist.forEach(hist => {
            const date = new Date(hist.created_date);
            const formattedDate = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) + ' - ' + date.toLocaleTimeString('th-TH',
  { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }) + ' น.';
            const li = document.createElement('li');
            li.className = 'timeline-item';
            li.innerHTML = `<span class="timeline-icon bg-secondary">${hist.icon || '🕓'}</span><div class="timeline-content"><h6
  class="timeline-title">${hist.task}</h6><p class="timeline-description">${hist.detail}</p><small class="text-muted">${formattedDate}</small></div>`;
            timelineEl.appendChild(li);
          });
        } else {
          timelineEl.innerHTML = `<li class="timeline-item"><div class="timeline-content"><p class="timeline-description
  text-muted">ไม่มีประวัติการอัปเดต</p></div></li>`;
        }
      }

      // Render existing images if they exist
      if (order_pic && order_pic.length > 0) {
        renderUploadedImages(order_pic);
      }

      // Pass the full result to apply restrictions
      applyRoleBasedRestrictions(result);

    } catch (err) {
      alert('❌ ไม่สามารถโหลดข้อมูลได้');
      console.error('Inquiry Error:', err);
    }
  }

  async function loadAssignees(order, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-management/assigners`, { headers: { 'authorization': token } });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      const select = document.getElementById('responsiblePerson');
      if (!select) return;
      select.innerHTML = '<option value="">เลือกผู้รับผิดชอบ</option>';
      data.forEach(person => {
        const fullName = `${person.first_name} ${person.last_name}`.trim();
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = fullName;
        select.appendChild(option);
      });
      if (order?.owner) select.value = order.owner;
    } catch (err) {
      console.error('Error loading assigners:', err);
    }
  }

  async function updateStatus(orderId, newStatus) {
      const token = localStorage.getItem('authToken') || '';
      try {
          const response = await fetch(`${API_BASE_URL}/api/order-status/update/${orderId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': token },
              body: JSON.stringify({ order_status: newStatus })
          });
          if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.message || 'ไม่สามารถอัปเดตสถานะได้');
          }
          return true;
      } catch (error) {
          console.error('Status update error:', error);
          alert(`เกิดข้อผิดพลาด: ${error.message}`);
          return false;
      }
  }

  // =========================================================
  // PHOTO RENDERING LOGIC
  // =========================================================
    const photoCategories = {
        around: {
            title: 'ภาพถ่ายรอบคัน',
            containerId: 'around-car-pics',
            items: ['ด้านหน้ารถ', 'ด้านซ้ายส่วนหน้า', 'ด้านซ้ายตรง', 'ด้านซ้ายส่วนหลัง', 'ด้านท้ายรถ', 'ด้านขวาส่วนหลัง', 'ด้านขวาตรง', 'ด้านขวาส่วนหน้า', 'หลังคา']
        },
        interior: {
            title: 'ภาพถ่ายภายในรถและอุปกรณ์ตกแต่ง',
            containerId: 'interior-pics',
            items: ['ล้อรถ 4 ล้อ ด้านหน้าขวา', 'ล้อรถ 4 ล้อ ด้านหน้าซ้าย', 'ล้อรถ 4 ล้อ ด้านหลังขวา', 'ล้อรถ 4 ล้อ ด้านหลังซ้าย', 'ปียาง/ขนาดยาง', 'ห้องเครื่อง', 'วิทยุ', 'จอไมล์', 'กระจกมองหน้า', 'ฟิล์ม', 'กล้องหน้ารถ', 'แผงหน้าปัดหน้า', 'อื่นๆ']
        },
        damage: {
            title: 'ภาพถ่ายความเสียหาย',
            containerId: 'damage-pics',
            items: ['ความเสียหาย 1', 'ความเสียหาย 2', 'ความเสียหาย 3', 'ความเสียหาย 4', 'ความเสียหาย 5', 'ความเสียหาย 6', 'ความเสียหาย 7', 'ความเสียหาย 8', 'ความเสียหาย 9', 'ความเสียหาย 10']
        },
        documents: {
            title: 'เอกสาร',
            containerId: 'document-pics',
            items: ['ใบขับขี่', 'บัตรประชาชน', 'รายการจดทะเบียนรถ', 'เลขตัวถังหรือเลขคัสซี', 'ใบตรวจสภาพ', 'ลายเซ็น']
        }
    };

    function checkAllPhotosTaken() {
        const allPhotoItems = document.querySelectorAll('.photo-item');
        if (allPhotoItems.length === 0) return;

        let allTaken = true;
        allPhotoItems.forEach(item => {
            if (item.dataset.taken !== 'true') {
                allTaken = false;
            }
        });

        const submitBtn = document.getElementById('bike-submit-work-btn');
        if (submitBtn) {
            submitBtn.disabled = !allTaken;
        }
    }



  // =========================================================
  // ROLE-BASED UI RESTRICTIONS
  // =========================================================

class UIPermissionManager {
    constructor() {
        this.form = document.getElementById('taskForm');
        this.saveBtn = document.getElementById('submittaskBtn');
        this.statusDropdown = document.getElementById('orderStatus');
        this.tabButtons = document.querySelectorAll('.nav-tabs .nav-link');
    }

    disableAll() {
        if (!this.form) return;
        this.form.querySelectorAll('input, textarea, select, button').forEach(el => {
            if (!el.classList.contains('nav-link')) { // Explicitly ignore tab buttons
                el.disabled = true;
            }
        });
        if (this.saveBtn) this.saveBtn.style.display = 'none';
    }

    enableAll() {
        if (!this.form) return;
        this.form.querySelectorAll('input, textarea, select, button').forEach(el => {
            if (!el.classList.contains('nav-link')) { // Explicitly ignore tab buttons
                el.disabled = false;
            }
        });
        if (this.saveBtn) {
            this.saveBtn.disabled = false;
            this.saveBtn.style.display = 'inline-block';
        }
    }

    setReadOnlyAll() {
        if (!this.form) return;
        // Make text inputs readonly
        this.form.querySelectorAll('input[type="text"], input[type="date"], input[type="time"], textarea').forEach(el => {
            el.readOnly = true;
        });
        // Disable interactive elements
        this.form.querySelectorAll('select, button, input[type="checkbox"]').forEach(el => {
            if (!el.classList.contains('nav-link')) { // Don't disable tab buttons
                el.disabled = true;
            }
        });
        if (this.saveBtn) this.saveBtn.style.display = 'none';
    }

    applyStatusPermissions(allowedStatuses = []) {
        if (!this.statusDropdown) return;
        this.statusDropdown.disabled = false;
        Array.from(this.statusDropdown.options).forEach(option => {
            option.style.display = allowedStatuses.includes(option.value) ? 'block' : 'none';
        });
        if (this.saveBtn) {
            this.saveBtn.disabled = false;
            this.saveBtn.style.display = 'inline-block';
        }
    }

    configure(orderStatus, data) {
        this.disableAll();
    }
}

class UIAdminPermissionManager extends UIPermissionManager {
    configure(orderStatus, data) {
        this.enableAll();
    }
}

class UIBikePermissionManager extends UIPermissionManager {
    configure(orderStatus, data) {
        const cardBody = document.querySelector('.card-body');
        if (!cardBody) return;

        const details = data?.order_details;
        const order = data?.order;
        const orderId = order?.id;

        if (!details || !order || !orderId) {
            cardBody.innerHTML = '<p class="text-center text-danger">ไม่สามารถโหลดข้อมูลได้</p>';
            return;
        }

        const acceptStates = ['รับเรื่องแล้ว'];
        const workingStates = ['รับงาน', 'เริ่มงาน/กำลังเดินทาง', 'ถึงที่เกิดเหตุ/ปฏิบัติงาน', 'แก้ไข'];

        if (acceptStates.includes(orderStatus)) {
            // State 1: Show Accept/Reject buttons
            let buttonsHTML = `
                <div class="mt-4 d-grid gap-2 d-md-flex">
                    <button class="btn btn-danger me-md-2" id="bike-reject-btn">ปฏิเสธงาน</button>
                    <button class="btn btn-primary" id="bike-accept-btn">รับงาน</button>
                </div>
            `;
            cardBody.innerHTML = `
                <div class="py-3 px-4 mb-4 rounded bg-white border">
                    <h6 class="fw-bold text-primary border-bottom pb-2 mb-4">ข้อมูลเจ้าของรถ</h6>
                    <p><strong>รหัสงาน:</strong> ${order.id || '-'}</p>
                    <p><strong>ชื่อผู้เอาประกัน:</strong> ${details.c_insure || '-'}</p>
                    <p><strong>เบอร์โทรศัพท์:</strong> ${details.c_tell || '-'}</p>
                    <p><strong>ทะเบียนรถ:</strong> ${order.car_registration || '-'}</p>
                </div>
                ${buttonsHTML}
                <a href="dashboard.html" class="btn btn-secondary w-100 mt-2">กลับไปหน้าหลัก</a>
            `;

            document.getElementById('bike-accept-btn').addEventListener('click', async () => {
                const success = await updateStatus(orderId, 'รับงาน');
                if (success) {
                    alert('รับงานเรียบร้อยแล้ว! กำลังเตรียมหน้าอัปโหลดรูปภาพ...');
                    window.location.reload();
                }
            });

            document.getElementById('bike-reject-btn').addEventListener('click', async () => {
                const success = await updateStatus(orderId, 'ปฏิเสธงาน');
                if (success) {
                    alert('ปฏิเสธงานเรียบร้อยแล้ว');
                    window.location.href = 'dashboard.html';
                }
            });

        } else if (workingStates.includes(orderStatus)) {
            // State 2: Use the standard, robust image upload UI
            cardBody.innerHTML = `
                <div class="tab-pane fade show active" id="tab-contact" role="tabpanel">
                    <section class="upload-section mb-4" id="around-images-section">
                      <h5><i class="bi bi-car-front text-success me-2"></i>ภาพถ่ายรอบคัน</h5>
                      <div class="row"></div>
                    </section>
                    <section class="upload-section mb-4" id="accessories-images-section">
                      <h5><i class="bi bi-speedometer2 text-primary me-2"></i>ภาพถ่ายภายในรถ และอุปกรณ์ตกแต่ง</h5>
                      <div class="row"></div>
                    </section>
                    <section class="upload-section mb-4" id="inspection-images-section">
                      <h5><i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>ภาพถ่ายความเสียหาย</h5>
                      <div class="row"></div>
                    </section>
                    <section class="upload-section mb-4" id="fiber-documents-section">
                      <h5><i class="bi bi-file-earmark-check-fill text-success me-2"></i>เอกสารใบตรวจสภาพรถ</h5>
                      <div class="row"></div>
                    </section>
                    <section class="upload-section mb-4" id="other-documents-section">
                      <h5><i class="bi bi-file-earmark-text-fill text-warning me-2"></i>เอกสารอื่นๆ</h5>
                      <div class="row"></div>
                    </section>
                    <section class="upload-section mb-4" id="signature-documents-section">
                      <h5><i class="bi bi-pen-fill text-info me-2"></i>ลายเซ็น</h5>
                      <div class="row"></div>
                    </section>
                </div>
                <div class="mt-4">
                    <button class="btn btn-primary w-100" id="bike-submit-work-btn">ส่งงาน</button>
                </div>
                 <a href="dashboard.html" class="btn btn-secondary w-100 mt-2">กลับไปหน้าหลัก</a>
            `;

            // Call the global, working functions
            populateImageSections();
            renderUploadedImages(data.order_pic || []);

            // Re-attach listener for the submit button
            document.getElementById('bike-submit-work-btn').addEventListener('click', async () => {
                 const confirmSubmit = confirm('คุณต้องการส่งงานเพื่อตรวจสอบใช่หรือไม่?');
                if (confirmSubmit) {
                    const success = await updateStatus(orderId, 'ส่งงาน/ตรวจสอบเบื้องต้น');
                    if (success) {
                        alert('ส่งงานเรียบร้อยแล้ว');
                        window.location.href = 'dashboard.html';
                    }
                }
            });



        } else {
            // Default read-only view for other statuses
            cardBody.innerHTML = `
            <div class="py-3 px-4 mb-4 rounded bg-white border">
                <h6 class="fw-bold text-primary border-bottom pb-2 mb-4">ข้อมูลเจ้าของรถ</h6>
                <p><strong>รหัสงาน:</strong> ${order.id || '-'}</p>
                <p><strong>สถานะ:</strong> ${order.order_status || '-'}</p>
                <p><strong>ชื่อผู้เอาประกัน:</strong> ${details.c_insure || '-'}</p>
            </div>
            <a href="dashboard.html" class="btn btn-secondary w-100 mt-2">กลับไปหน้าหลัก</a>
        `;
        }
    }
}

class UIInsurancePermissionManager extends UIPermissionManager {
    configure(orderStatus, data) {
        this.setReadOnlyAll();
        let allowedStatuses = [];

        if (orderStatus === 'ส่งงาน/ตรวจสอบเบื้องต้น') {
            allowedStatuses = ['รออนุมัติ', orderStatus];
        } else if (orderStatus === 'Pre-Approved') {
            allowedStatuses = ['ผ่าน', 'ไม่ผ่าน'];
        }

        if (allowedStatuses.length > 0) {
            this.applyStatusPermissions(allowedStatuses);
        }
    }
}

function getUIPermissionManager(role) {
    switch (role) {
        case 'Admin':
        case 'Director':
        case 'Developer':
            return new UIAdminPermissionManager();
        case 'Bike':
            return new UIBikePermissionManager();
        case 'Insurance':
            return new UIInsurancePermissionManager();
        default:
            return new UIPermissionManager();
    }
}

function applyRoleBasedRestrictions(data) {
    const userRole = getUserRole();
    const orderStatus = data.order.order_status;
    const permissionManager = getUIPermissionManager(userRole);
    permissionManager.configure(orderStatus, data);
}


  // =========================================================
  // DOMContentLoaded - MAIN EXECUTION & EVENT LISTENERS
  // =========================================================

  document.addEventListener('DOMContentLoaded', function () {
    const brandSelect = document.getElementById('carBrand');
    const modelSelect = document.getElementById('carModel');
    if (brandSelect && modelSelect) {
      brandSelect.addEventListener('change', function () {
        const selectedBrand = this.value;
        const models = carModels[selectedBrand] || [];
        modelSelect.innerHTML = '<option selected disabled>เลือกรุ่น</option>';
        models.forEach(model => {
          const option = document.createElement('option');
          option.value = model;
          option.textContent = model;
          modelSelect.appendChild(option);
        });
        if (getUserRole() !== 'Bike') {
          modelSelect.disabled = models.length === 0;
        }
      });
    }

    const openMapBtn = document.getElementById('openMap');
    if (openMapBtn) {
      openMapBtn.addEventListener('click', function () {
        const address = document.getElementById('address').value.trim();
        if (!address) { alert('กรุณากรอกที่อยู่ก่อนเปิดแผนที่'); return; }
        const query = encodeURIComponent(address);
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
        window.open(mapUrl, '_blank');
      });
    }

    const downloadAllBtn = document.getElementById('downloadAllBtn');
    if (downloadAllBtn) {
      downloadAllBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        const zip = new JSZip();
        const orderId = document.getElementById('taskId').value.trim();
        const imageElements = Array.from(document.querySelectorAll('.image-gallery img')).filter(img => {
          const style = getComputedStyle(img);
          return (img.src && img.src.startsWith('https') && style.display !== 'none' && img.complete);
        });
        if (imageElements.length === 0) { alert('ไม่มีภาพให้ดาวน์โหลด'); return; }
        await Promise.all(
          imageElements.map(async (img, i) => {
            const url = img.src;
            const label = img.closest('label');
            const title = label?.querySelector('.title')?.innerText?.trim() || `image-${i + 1}`;
            const safeName = title.replace(/[^\wก-๙\s-]/g, '').replace(/\s+/g, '_');
            try {
              const response = await fetch(url);
              if (!response.ok) throw new Error(`โหลดภาพไม่ได้: ${url}`);
              const blob = await response.blob();
              zip.file(`${safeName || `image-${i + 1}`}.jpg`, blob);
            } catch (err) { console.warn(`ข้ามภาพที่โหลดไม่ได้: ${url}`, err); }
          })
        );
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, orderId + '.zip');
      });
    }

    loadUserProfile();
    populateImageSections();

    const userRole = getUserRole();
    if (userRole) {
      if (['Operation Manager', 'Director', 'Developer'].includes(userRole)) {
        const adminMenuEl = document.getElementById('admin-menu');
        if(adminMenuEl) adminMenuEl.style.display = 'block';
      } else if (userRole === 'Admin Officer') {
        const orderStatusSelect = document.getElementById('orderStatus');
        if (orderStatusSelect) orderStatusSelect.setAttribute('disabled', 'disabled');
      }
      if (userRole === 'Officer') {
        localStorage.removeItem('authToken');
        window.location.href = '../index.html';
      }
    }

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (orderId) {
      loadOrderData(orderId);
    } else {
      const now = new Date();
      const options = { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12:
   false };
      const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(now);
      const getPart = (type) => parts.find(p => p.type === type)?.value;
      const formatted = `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
      const transactionDateEl = document.getElementById('transactionDate');
      if(transactionDateEl) transactionDateEl.value = formatted;
    }

    const form = document.getElementById('taskForm');
    if (!form) return;

    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('authToken'); window.location.href = '../index.html';
  });
    const logoutMenu = document.getElementById('logout-menu');
    if (logoutMenu) logoutMenu.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('authToken'); window.location.href = '../index.html';
   });

    const manualSubmitBtn = document.getElementById('submittaskBtn');
    if (manualSubmitBtn) manualSubmitBtn.addEventListener('click', () => form.requestSubmit());

    // Fix for Tab Switching based on legacy code
    document.querySelectorAll('.nav-tabs .nav-link[data-bs-toggle="tab"]').forEach(button => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Tab button clicked!', this);

        const targetPaneId = this.getAttribute('data-bs-target');
        console.log('Target Pane ID:', targetPaneId);
        const targetPane = document.querySelector(targetPaneId);

        if (!targetPane) {
            console.error('Target pane not found!');
            return;
        }

        console.log('Removing active classes from all tabs and panes...');
        document.querySelectorAll('.nav-tabs .nav-link').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content .tab-pane').forEach(pane => pane.classList.remove('active', 'show'));

        console.log('Adding active class to clicked button:', this);
        this.classList.add('active');
        
        console.log('Adding active and show class to target pane:', targetPane);
        targetPane.classList.add('active', 'show');

        console.log('Tab switch complete. Active button:', document.querySelector('.nav-tabs .nav-link.active'));
        console.log('Active pane:', document.querySelector('.tab-content .tab-pane.active'));
      });
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const token = localStorage.getItem('authToken') || '';
      const currentOrderId = document.getElementById('taskId').value;
      const created_by = document.getElementById('ownerName').value;
      const currentUserRole = getUserRole();
      let endpoint, data;

      const orderPic = [];
      document.querySelectorAll('.upload-section img').forEach(img => {
        if (!img.src || img.style.display === 'none' || !img.src.startsWith('http')) return;
        const input = img.closest('label')?.querySelector('input[type="file"]');
        const picType = input?.name || 'unknown';
        const title = img.closest('label')?.querySelector('.title')?.innerText || '';
        orderPic.push({ pic: img.src, pic_type: picType, pic_title: title, created_by: created_by });
      });

      if (currentUserRole === 'Bike' || currentUserRole === 'Insurance') {
        endpoint = `${API_BASE_URL}/api/order-status/update/${currentOrderId}`;
        data = {
          order_status: document.getElementById('orderStatus').value,
          updated_by: created_by,
          order_hist: [{ icon: "📝", task: "อัปเดตสถานะ", detail: `อัปเดตโดยผู้ใช้: ${created_by}`, created_by }]
        };
         if (currentUserRole === 'Bike') data.order_pic = orderPic;

      } else {
        endpoint = `${API_BASE_URL}/api/orders/update/${currentOrderId}`;
        const date = getSafeValue('appointmentDate');
        const time = getSafeValue('appointmentTime');
        let appointment_date = null;
        if (date) appointment_date = time ? new Date(`${date}T${time}`).toISOString() : new Date(date).toISOString();
        const s_start = getSafeValue('coverageStartDate')?.trim();
        const s_end = getSafeValue('coverageEndDate')?.trim();
        data = {
          creator: getSafeValue('ownerName'),
          owner: getSafeValue('responsiblePerson'),
          order_type: getSafeValue('jobType'),
          order_status: getSafeValue('orderStatus'),
          channel: getSafeValue('channel'),
          process_type: getSafeValue('processType'),
          insur_comp: getSafeValue('insuranceCompany'),
          order_date: getSafeValue('transactionDate'),
          appointment_date: appointment_date,
          car_registration: getSafeValue('carRegistration'),
          location: getSafeValue('address'),
          created_by,
          incident_province: getSafeValue('carProvince'),
          tell_1: getSafeValue('phone'),
          tell_2: getSafeValue('phone2'),
          tell_3: getSafeValue('phone3'),
          c_insure: getSafeValue('c_insure'),
          c_tell: getSafeValue('c_tell'),
          c_licent: getSafeValue('carRegistration'),
          c_car_province: getSafeValue('carProvince'),
          c_brand: getSafeValue('carBrand'),
          c_version: getSafeValue('carModel'),
          c_year: getSafeValue('carYear'),
          c_number: getSafeValue('carChassis'),
          c_engine: getSafeValue('carEngine'),
          c_mile: getSafeValue('c_mile'),
          c_type: getSafeValue('carType'),
          c_coller: getSafeValue('carColor'),
          c_recieve: document.getElementById('received-doc')?.checked || false,
          s_insure: getSafeValue('insuranceCompany'),
          s_branch: getSafeValue('insuranceBranch'),
          s_ref: getSafeValue('reference1'),
          s_ref_2: getSafeValue('reference2'),
          s_number: getSafeValue('policyNumber'),
          ...(s_start ? { s_start } : {}),
          ...(s_end ? { s_end } : {}),
          s_type: getSafeValue('insuranceType'),
          s_remark: getSafeValue('s_remark'),
          s_ins_remark: getSafeValue('s_ins_remark'),
          s_detail: getSafeValue('s_detail'),
          s_fleet: document.getElementById('fleetCar')?.checked || false,
          updated_by: created_by,
          c_name: getSafeValue('creatorName'),
          order_pic: orderPic,
          order_hist: [{ icon: "📝", task: "อัปเดตรายการ", detail: `อัปเดตโดยผู้ใช้: ${created_by}`, created_by }]
        };
      }

      try {
        const response = await fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` }, body:
  JSON.stringify(data) });
        const result = await response.json();
        if (response.ok) {
          alert('✅ อัปเดตข้อมูลเรียบร้อยแล้ว');
          window.location.href = 'dashboard.html';
        } else {
          alert('❌ เกิดข้อผิดพลาด: ' + result.message);
        }
      } catch (error) {
        alert('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
        console.error('Fetch error:', error);
      }
    });


    // --- Start of Image Preview and Replace Logic ---
    const imagePreviewModalEl = document.getElementById('imagePreviewModal');
    if (imagePreviewModalEl) {
        const imagePreviewModal = new bootstrap.Modal(imagePreviewModalEl);
        const previewImage = document.getElementById('previewImage');
        const replaceBtn = document.getElementById('replace-image-btn');
        let context = {}; // To store context for the replace button

        // Listener for the "Replace Image" button in the modal
        if (replaceBtn && !replaceBtn.hasAttribute('data-listener-set')) {
            replaceBtn.addEventListener('click', () => {
                if (!context.field || !context.imgElement) return;

                const modalInstance = bootstrap.Modal.getInstance(imagePreviewModalEl);
                if (modalInstance) modalInstance.hide();

                // Create a temporary file input to handle the upload
                const tempInput = document.createElement('input');
                tempInput.type = 'file';
                tempInput.accept = 'image/*';
                
                tempInput.addEventListener('change', async () => {
                    const file = tempInput.files[0];
                    if (!file) return;

                    const { field, imgElement, labelElement } = context;
                    const customName = labelElement.querySelector('.title').textContent.trim();
                    const folderName = document.getElementById('taskId')?.value.trim() || 'default';
                    
                    const formData = new FormData();
                    formData.append('folder', folderName);
                    formData.append('category', field.section);
                    formData.append('images', file, customName + '.' + file.name.split('.').pop());

                    imgElement.src = 'https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca.gif';

                    try {
                        const token = localStorage.getItem('authToken') || '';
                        const response = await fetch(`${API_BASE_URL}/api/upload/image/transactions`, {
                            method: 'POST',
                            headers: { 'Authorization': token },
                            body: formData
                        });

                        if (response.ok) {
                            const result = await response.json();
                            if (result.uploaded && result.uploaded.length > 0) {
                                imgElement.src = result.uploaded[0].url + '?t=' + new Date().getTime();
                                labelElement.setAttribute('data-filled', 'true');
                                uploadedPicCache.add(field.name);
                            } else { throw new Error('Upload response error.'); }
                        } else { 
                            const errorResult = await response.json();
                            throw new Error(errorResult.message || 'Upload failed');
                        }
                    } catch (err) {
                        console.error('Upload error:', err);
                        alert('🚫 ไม่สามารถอัปโหลดรูปภาพได้: ' + err.message);
                        imgElement.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                    }
                });

                tempInput.click();
            });
            replaceBtn.setAttribute('data-listener-set', 'true');
        }

        // Delegated listener for all image-related actions
        document.addEventListener('click', function(e) {
            const label = e.target.closest('label.image-gallery');

            // Exit if not a relevant click
            if (!label || e.target.closest('.delete-btn') || e.target.closest('.edit-title-btn')) {
                return;
            }

            const img = label.querySelector('img');
            const isPlaceholder = !img || !img.src || img.src.includes('data:image/gif');

            if (isPlaceholder) {
                // This is an empty slot. Let the default browser action proceed.
                // The click will fall through to the hidden file input, which has a 'change' listener
                // that will handle the new upload. We do nothing here.
                return;
            } else {
                // This is an existing image. Prevent the default action (which would open the file dialog)
                // and instead open our modal for the replacement workflow.
                e.preventDefault();
                
                const fileInput = label.querySelector('input[type="file"]');
                if (!fileInput) return;

                const fieldName = fileInput.name;
                const field = imageFields.find(f => f.name === fieldName);
                if (field) {
                    // The global `context` variable is used by the modal's replace button
                    context = { field: field, imgElement: img, labelElement: label };
                    previewImage.src = img.src;
                    imagePreviewModal.show();
                }
            }
        });

        // Separate listeners for buttons to keep logic clear
        document.addEventListener('click', function(e) {
            // Handle clicking the delete button
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                e.stopPropagation();
                e.preventDefault();
                if (!window.confirm('คุณต้องการลบภาพนี้หรือไม่?')) return;
                
                const label = deleteBtn.closest('label.image-gallery');
                if (!label) return;

                const input = label.querySelector('input[type="file"]');
                if (input) {
                    uploadedPicCache.delete(input.name);
                    input.value = '';
                }

                const img = label.querySelector('img');
                if (img) {
                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                }
                label.removeAttribute('data-filled');
            }

            // Handle clicking the edit title button
            const editBtn = e.target.closest('.edit-title-btn');
            if (editBtn) {
                e.stopPropagation();
                e.preventDefault();
                const label = editBtn.closest('label.image-gallery');
                const titleDiv = label.querySelector('.title');
                const currentTitle = titleDiv.textContent.trim();
                const newTitle = prompt('แก้ไขชื่อภาพ:', currentTitle);
                if (newTitle && newTitle.trim() !== '') {
                    titleDiv.textContent = newTitle.trim();
                    titleDiv.setAttribute('data-custom', 'true');
                }
            }
        });
    }
    // --- End of Image Preview and Replace Logic ---

    const categorySelect = document.getElementById('categorySelect');
    if(categorySelect) {
      const categoryConfig = {
          accessories: { count: 20, labels: Array.from({length: 20}, (_, i) => `อุปกรณ์ตกแต่ง ${i + 1}.`), idRender: Array.from({length: 20}, (_, i) => `interior_${i + 1}`) },
          documents: { count: 8, labels: ['ใบขับขี่', 'บัตรประชาชน', 'เอกสารยืนยันตัวรถ', 'เลขตัวถังและทะเบียนรถ', 'ลายเซ็น', 'อื่นๆ', 'อื่นๆ', 'อื่นๆ'], idRender: ['license',      
  'id_card', 'car_doc', 'car_number', 'doc_other_9', 'other_1', 'other_2', 'other_3'] },
          inspection: { count: 10, labels: Array.from({length: 10}, (_, i) => `รายละเอียดความเสียหาย ${i + 1}.`), idRender: Array.from({length: 10}, (_, i) =>
  `damage_images_${i + 1}`) },
          around: { count: 9, labels: ['ภาพถ่ายรอบคัน - ด้านหน้ารถ', 'ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหน้า', 'ภาพถ่ายรอบคัน - ด้านซ้ายตรง', 'ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหลัง',
  'ภาพถ่ายรอบคัน - ด้านท้ายรถ', 'ภาพถ่ายรอบคัน - ด้านขวาส่วนหลัง', 'ภาพถ่ายรอบคัน - ด้านขวาตรง', 'ภาพถ่ายรอบคัน - ด้านขวาส่วนหน้า', 'หลังคา'], idRender: ['exterior_front',
  'exterior_left_front', 'exterior_left_center', 'exterior_left_rear', 'exterior_rear', 'exterior_right_rear', 'exterior_right_center', 'exterior_right_front',
  'exterior_roof'] },
          signature: { count: 1, labels: ['ลายเซ็น'], idRender: ['doc_other_9'] },
          fiber: { count: 9, labels: Array.from({length: 9}, (_, i) => `ใบตรวจสภาพรถ ${i + 1}`), idRender: Array.from({length: 9}, (_, i) => `doc_other_${i+1}`) }
      };
      categorySelect.addEventListener('change', function () {
        const selected = this.value;
        const area = document.getElementById('dynamicUploadArea');
        area.innerHTML = '';
        if (!selected || !categoryConfig[selected]) return;
        const { count, labels, idRender } = categoryConfig[selected];
        for (let i = 0; i < count; i++) {
          const group = document.createElement('div');
          group.className = 'mb-3 col-md-6';
          const fileInputId = `fileInput-${selected}-${i + 1}`;
          const labelText = labels[i] || `Item ${i + 1}`;
          const idRenderValue = idRender[i] || selected;
          const isUploaded = uploadedPicCache.has(idRenderValue);
          const fileInputHTML = isUploaded ? `<div class="text-danger small">📁 ไฟล์อัปโหลดแล้ว</div>` : `<input type="file" class="form-control" id="${fileInputId}"
  accept="image/*" />`;
          group.innerHTML = `
            <label class="form-label d-block mb-1">${labelText}</label>
            <div class="row g-2 align-items-center">
              <div class="col-6"><input type="text" class="form-control" placeholder="ระบุชื่อไฟล์" ${isUploaded ? 'disabled' : ''} /></div>
              <div class="col-6">${fileInputHTML}</div>
            </div>`;
          area.appendChild(group);
          setTimeout(() => {
            const fileInput = document.getElementById(fileInputId);
            if(!fileInput) return;
            const textInput = group.querySelector('input[type="text"]');
            fileInput.addEventListener('change', async () => {
              const file = fileInput.files[0];
              if (!file) return;
              const customName = textInput.value.trim() || file.name.split('.').slice(0, -1).join('.') || `image_${i}`;
              const folderName = document.getElementById('taskId')?.value.trim() || 'default';
              const formData = new FormData();
              formData.append('folder', folderName);
              formData.append('category', selected);
              formData.append('images', file, customName + '.' + file.name.split('.').pop());
              const progressWrapper = document.getElementById('uploadProgressWrapper');
              progressWrapper.classList.remove('d-none');
              try {
                const token = localStorage.getItem('authToken') || '';
                const response = await fetch(`${API_BASE_URL}/api/upload/image/transactions`, { 
                    method: 'POST',
                    headers: { 'Authorization': token },
                    body: formData 
                });
                if (response.ok) {
                  const result = await response.json();
                  const inputElem = document.querySelector(`input[name="${idRenderValue}"]`);
                  if (inputElem) {
                    const label = inputElem.closest('label.image-gallery');
                    if (label) {
                      const previewImg = label.querySelector('img');
                      const titleDiv = label.querySelector('.title');
                      const col = label.closest('.col-4');
                      if (previewImg) {
                        previewImg.src = result.uploaded[0].url + '?t=' + new Date().getTime();
                        previewImg.style.display = 'block';
                        previewImg.alt = customName;
                      }
                      if (titleDiv) titleDiv.textContent = customName;
                      if (col) col.style.display = 'block';
                    }
                  }
                } else {
                  alert('❌ อัปโหลดไม่สำเร็จ');
                }
              } catch (err) {
                console.error(err);
                alert('🚫 ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
              } finally {
                progressWrapper.classList.add('d-none');
              }
            });
          }, 0);
        }
      });
    }
  });

  // =========================================================
  // IMAGE UPLOAD HELPERS (GLOBAL SCOPE)
  // =========================================================

  const uploadedPicCache = new Set();
  const imageFields = [
      { name: 'exterior_front', altText: 'ภาพถ่ายรอบคัน - ด้านหน้ารถ', section: 'around' },
      { name: 'exterior_left_front', altText: 'ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหน้า', section: 'around' },
      { name: 'exterior_left_center', altText: 'ภาพถ่ายรอบคัน - ด้านซ้ายตรง', section: 'around' },
      { name: 'exterior_left_rear', altText: 'ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหลัง', section: 'around' },
      { name: 'exterior_rear', altText: 'ภาพถ่ายรอบคัน - ด้านท้ายรถ', section: 'around' },
      { name: 'exterior_right_rear', altText: 'ภาพถ่ายรอบคัน - ด้านขวาส่วนหลัง', section: 'around' },
      { name: 'exterior_right_center', altText: 'ภาพถ่ายรอบคัน - ด้านขวาตรง', section: 'around' },
      { name: 'exterior_right_front', altText: 'ภาพถ่ายรอบคัน - ด้านขวาส่วนหน้า', section: 'around' },
      { name: 'exterior_roof', altText: 'ภาพถ่ายรอบคัน - หลังคา', section: 'around' },
      { name: 'interior_wheels_1', altText: 'ล้อรถ 4 ล้อ 1', section: 'accessories' },
      { name: 'interior_wheels_2', altText: 'ล้อรถ 4 ล้อ 2', section: 'accessories' },
      { name: 'interior_wheels_3', altText: 'ล้อรถ 4 ล้อ 3', section: 'accessories' },
      { name: 'interior_wheels_4', altText: 'ล้อรถ 4 ล้อ 4', section: 'accessories' },
      { name: 'interior_dashboard', altText: 'ปีผลิต/ขนาดล้อ/ยางอะไหล่', section: 'accessories' },
      { name: 'interior_6', altText: 'ห้องเครื่อง', section: 'accessories' },
      { name: 'interior_7', altText: 'จอไมล์', section: 'accessories' },
      { name: 'interior_8', altText: 'คอนโซล', section: 'accessories' },
      { name: 'interior_9', altText: 'วิทยุ', section: 'accessories' },
      { name: 'interior_10', altText: 'กล้องติดหน้ารถ', section: 'accessories' },
      { name: 'interior_11', altText: 'กล้องติดหน้ารถ', section: 'accessories' },
      { name: 'interior_12', altText: 'กล้องติดหน้ารถ', section: 'accessories' },
      { name: 'interior_13', altText: 'กล้องติดหน้ารถ', section: 'accessories' },
      { name: 'interior_14', altText: 'กล้องติดหน้ารถ', section: 'accessories' },
      { name: 'interior_15', altText: 'กล้องติดหน้ารถ', section: 'accessories' },
      { name: 'interior_16', altText: 'กล้องติดหน้ารถ', section: 'accessories' },
      { name: 'interior_17', altText: 'กล้องติดหน้ารถ', section: 'accessories' },
      { name: 'interior_18', altText: 'กล้องติดหน้ารถ', section: 'accessories' },
      { name: 'interior_19', altText: 'กล้องติดหน้ารถ', section: 'accessories' },
      { name: 'interior_20', altText: 'กล้องติดหน้ารถ', section: 'accessories' },
      { name: 'damage_images_1', altText: 'ภาพถ่ายความเสียหาย 1', section: 'inspection' },
      { name: 'damage_images_2', altText: 'ภาพถ่ายความเสียหาย 2', section: 'inspection' },
      { name: 'damage_images_3', altText: 'ภาพถ่ายความเสียหาย 3', section: 'inspection' },
      { name: 'damage_images_4', altText: 'ภาพถ่ายความเสียหาย 4', section: 'inspection' },
      { name: 'damage_images_5', altText: 'ภาพถ่ายความเสียหาย 5', section: 'inspection' },
      { name: 'damage_images_6', altText: 'ภาพถ่ายความเสียหาย 6', section: 'inspection' },
      { name: 'damage_images_7', altText: 'ภาพถ่ายความเสียหาย 7', section: 'inspection' },
      { name: 'damage_images_8', altText: 'ภาพถ่ายความเสียหาย 8', section: 'inspection' },
      { name: 'damage_images_9', altText: 'ภาพถ่ายความเสียหาย 9', section: 'inspection' },
      { name: 'damage_images_10', altText: 'ภาพถ่ายความเสียหาย 10', section: 'inspection' },
      { name: 'doc_identity', altText: 'เอกสารยืนยันตัวบุคคล', section: 'fiber' },
      { name: 'doc_other_1', altText: 'เอกสารยืนยันตัวรถ', section: 'fiber' },
      { name: 'doc_other_2', altText: 'เลขตัวถังและทะเบียนรถ', section: 'fiber' },
      { name: 'doc_other_3', altText: 'เอกสารอื่น ๆ', section: 'fiber' },
      { name: 'doc_other_4', altText: 'เอกสารอื่น ๆ', section: 'fiber' },
      { name: 'doc_other_5', altText: 'เอกสารอื่น ๆ', section: 'fiber' },
      { name: 'doc_other_6', altText: 'เอกสารอื่น ๆ', section: 'fiber' },
      { name: 'doc_other_7', altText: 'เอกสารอื่น ๆ', section: 'fiber' },
      { name: 'doc_other_8', altText: 'เอกสารอื่น ๆ', section: 'fiber' },
      { name: 'license', altText: 'เอกสารอื่น ๆ', section: 'documents' },
      { name: 'id_card', altText: 'เอกสารอื่น ๆ', section: 'documents' },
      { name: 'car_doc', altText: 'เอกสารอื่น ๆ', section: 'documents' },
      { name: 'car_number', altText: 'เอกสารอื่น ๆ', section: 'documents' },
      { name: 'other_1', altText: 'เอกสารอื่น ๆ', section: 'documents' },
      { name: 'other_2', altText: 'เอกสารอื่น ๆ', section: 'documents' },
      { name: 'other_3', altText: 'เอกสารอื่น ๆ', section: 'documents' },
      { name: 'doc_other_9', altText: 'ลายเซ็น', section: 'signature' }
  ];
  function renderImageUploadBlock(field, fileInputId) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-4 mb-3 text-center';

    const label = document.createElement('label');
    label.className = 'image-gallery w-100';
    label.style.cssText = 'cursor:pointer; position:relative; display: block; border-radius:8px; overflow: hidden; height: 200px;';

    const img = document.createElement('img');
    img.alt = field.altText;
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    img.style.cssText = 'width:100%; height:100%; object-fit: cover; display:block;';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'title';
    titleDiv.style.cssText = 'position: absolute; bottom: 0; left: 0; width: 100%; padding: 6px 10px; background: rgba(0,0,0,0.8); color: white; font-weight: 600; font-size: 14px; text-align: center; box-sizing: border-box;';
    titleDiv.textContent = field.altText;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = field.name;
    fileInput.id = fileInputId; // Assign the unique ID
    fileInput.hidden = true;
    fileInput.accept = 'image/*';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = 'ลบภาพ';
    deleteBtn.style.cssText = 'position: absolute; top: 6px; right: 6px; background: transparent; border: none; color: rgb(252, 7, 7); font-size: 24px; line-height: 1; cursor: pointer; z-index: 10; display: block;';
    deleteBtn.innerHTML = '<i class="bi bi-x-circle-fill"></i>';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'edit-title-btn';
    editBtn.title = 'แก้ไขชื่อภาพ';
    editBtn.style.cssText = 'position: absolute; top: 38px; right: 8px; width: 26px; height: 26px; background-color: #198754; color: #fff; border-radius: 50%; border: 2px solid white; font-weight: bold; font-size: 14px; line-height: 1; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);';
    editBtn.textContent = 'A';

    label.appendChild(img);
    label.appendChild(titleDiv);
    label.appendChild(fileInput);
    label.appendChild(deleteBtn);
    label.appendChild(editBtn);
    colDiv.appendChild(label);

    return colDiv.outerHTML;
}

  function populateImageSections() {
      const sectionsMap = {
          'around': document.getElementById('around-images-section')?.querySelector('.row'),
          'accessories': document.getElementById('accessories-images-section')?.querySelector('.row'),
          'inspection': document.getElementById('inspection-images-section')?.querySelector('.row'),
          'fiber': document.getElementById('fiber-documents-section')?.querySelector('.row'),
          'documents': document.getElementById('other-documents-section')?.querySelector('.row'),
          'signature': document.getElementById('signature-documents-section')?.querySelector('.row')
      };

      imageFields.forEach(field => {
          const targetSection = sectionsMap[field.section];
          if (targetSection) {
              const fileInputId = `file-input-${field.name}`;
              targetSection.insertAdjacentHTML('beforeend', renderImageUploadBlock(field, fileInputId));
              
              const fileInput = document.getElementById(fileInputId);
              if (fileInput) {
                  fileInput.addEventListener('change', async () => {
                      const file = fileInput.files[0];
                      if (!file) return;

                      const label = fileInput.closest('label');
                      const img = label.querySelector('img');
                      const titleDiv = label.querySelector('.title');
                      const customName = titleDiv.textContent.trim();
                      const folderName = document.getElementById('taskId')?.value.trim() || 'default';

                      const formData = new FormData();
                      formData.append('folder', folderName);
                      formData.append('category', field.section);
                      formData.append('images', file, customName + '.' + file.name.split('.').pop());

                      img.src = 'https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca.gif';

                      try {
                          const token = localStorage.getItem('authToken') || '';
                          const response = await fetch(`${API_BASE_URL}/api/upload/image/transactions`, {
                              method: 'POST',
                              headers: { 'Authorization': token },
                              body: formData
                          });

                          if (response.ok) {
                              const result = await response.json();
                              if (result.uploaded && result.uploaded.length > 0) {
                                  img.src = result.uploaded[0].url + '?t=' + new Date().getTime();
                                  label.setAttribute('data-filled', 'true');
                                  uploadedPicCache.add(fileInput.name);
                              } else {
                                  throw new Error('Upload response did not contain uploaded file information.');
                              }
                          } else {
                              const errorResult = await response.json();
                              throw new Error(errorResult.message || 'Upload failed');
                          }
                      } catch (err) {
                          console.error('Upload error:', err);
                          alert('🚫 ไม่สามารถอัปโหลดรูปภาพได้: ' + err.message);
                          img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                      }
                  });
              }
          }
      });
  }

  function renderUploadedImages(orderPics) {
    // Helper to create a download URL for Cloudinary
    const createDownloadUrl = (cloudinaryUrl) => {
        if (!cloudinaryUrl || !cloudinaryUrl.includes('/upload/')) {
            return '#'; // Return a safe link if it's not a valid Cloudinary URL
        }
        return cloudinaryUrl.replace('/upload/', '/upload/fl_attachment/');
    };

    orderPics.forEach(pic => {
        if (!pic.pic_title || !pic.pic) return;

        const titleDivs = document.querySelectorAll('div.title');
        let found = false;
        titleDivs.forEach(div => {
            const label = div.closest('label.image-gallery');
            // Use flexible matching (.includes) and ensure the slot isn't already filled
            if (!found && label && !label.hasAttribute('data-filled') && div.innerText.trim().includes(pic.pic_title.trim())) {
                
                label.setAttribute('data-filled', 'true'); // Mark as filled

                const imgTag = label.querySelector('img');
                const icon = label.querySelector('i');

                if (imgTag) {
                    imgTag.src = pic.pic;
                    imgTag.style.display = 'block';
                }
                if (icon) {
                    icon.style.display = 'none';
                }

                // Add a download button
                const downloadUrl = createDownloadUrl(pic.pic);
                const downloadBtn = document.createElement('a');
                downloadBtn.href = downloadUrl;
                downloadBtn.setAttribute('download', '');
                downloadBtn.className = 'btn btn-sm btn-outline-primary position-absolute top-0 end-0 m-2';
                downloadBtn.innerHTML = '<i class="bi bi-download"></i>';
                downloadBtn.title = 'ดาวน์โหลดรูปภาพ';
                label.appendChild(downloadBtn);

                found = true; // Mark as found and move to the next picture
            }
        });
    });
}