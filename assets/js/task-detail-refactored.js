import { getQueryParam, navigateTo } from './navigation.js';




// =========================================================
  // HELPERS & CONFIG
  // =========================================================
// =========================================================
  // HELPERS & CONFIG
  // =========================================================

  const accessToken = localStorage.getItem('authToken');
  const LOGIN_PAGE = '../index.html';


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

  function hideFormFields(fieldIds) {
    fieldIds.forEach(id => {
      const fieldElement = document.getElementById(id);
      if (fieldElement) {
        // Find the closest parent div with class 'mb-3' or 'col-md-3' and hide it
        let parentDiv = fieldElement.closest('.mb-3') || fieldElement.closest('.col-md-3');
        if (parentDiv) {
          parentDiv.style.display = 'none';
        } else {
          fieldElement.style.display = 'none'; // Fallback if no suitable parent found
        }
      }
    });
  }

  function hideTabs(tabIds) {
    tabIds.forEach(id => {
      const tabElement = document.getElementById(id);
      if (tabElement) {
        tabElement.style.display = 'none';
      }
    });
  }

  function hideUserManagementMenu() {
    const userRole = getUserRole();
    const userManagementMenu = document.getElementById('user-management-menu');
    if (userManagementMenu && (userRole === 'Insurance' || userRole === 'Bike')) {
      userManagementMenu.style.display = 'none';
    }
  }

  if (!accessToken) {
    navigateTo(LOGIN_PAGE);
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
    const API_URL = `https://be-claims-service.onrender.com/api/auth/profile`;
    if (!token) { navigateTo(LOGIN_PAGE); return; }
    const decoded = parseJwt(token);
    if (!decoded) { localStorage.removeItem('authToken'); navigateTo(LOGIN_PAGE); return; }

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
      navigateTo(LOGIN_PAGE);
      return;
    }

    try {
      const response = await fetch(API_URL, { headers: { 'Authorization': `${token}` } });
      if (!response.ok) {
        localStorage.removeItem('authToken');
        navigateTo(LOGIN_PAGE);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('authToken');
      navigateTo(LOGIN_PAGE);
    }
  }

  const uploadedPicCache = new Set();

  function renderUploadedImages(orderPics) {
    // If there are no pictures, ensure the damage field is cleared.
    if (!orderPics || orderPics.length === 0) {
        setTimeout(() => updateDamageDetailField(), 0);
        return;
    }

    const sectionsMap = {
        'around': document.getElementById('around-images-section')?.querySelector('.row'),
        'accessories': document.getElementById('accessories-images-section')?.querySelector('.row'),
        'inspection': document.getElementById('inspection-images-section')?.querySelector('.row'),
        'fiber': document.getElementById('fiber-documents-section')?.querySelector('.row'),
        'documents': document.getElementById('other-documents-section')?.querySelector('.row'),
        'signature': document.getElementById('signature-documents-section')?.querySelector('.row')
    };

    orderPics.forEach(pic => {
        if (!pic.pic_type || !pic.pic) return;

        const targetSection = sectionsMap[pic.pic_type]; // Use pic_type to determine section
        if (targetSection) {
            const uniqueId = `uploaded-image-${pic.pic_type}-${Date.now()}`;
            const newSlotHtml = `
                <div class="col-4 mb-3 text-center dynamic-image-slot" data-pic-type="${pic.pic_type}">
                    <label class="image-gallery w-100" data-filled="true" style="cursor:pointer; position:relative; display: block; border-radius:8px; overflow: hidden; height: 200px;">
                        <img src="${pic.pic}" style="width:100%; height:100%; object-fit: cover; display:block;" alt="${pic.pic_title || 'Uploaded Image'}" data-created-date="${pic.created_date || new Date().toISOString()}">
                        <div class="title" contenteditable="true" style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 6px 10px; background: rgba(0,0,0,0.8); color: white; font-weight: 600; font-size: 14px; text-align: center; box-sizing: border-box;">
                            ${pic.pic_title || 'กรุณาใส่ชื่อ'}
                        </div>
                        <input type="file" id="${uniqueId}" name="dynamic_image" data-category="${pic.pic_type}" hidden accept="image/*" capture="camera">
                        <button type="button" class="delete-btn" title="ลบภาพ" style="position: absolute; top: 6px; right: 6px; background: transparent; border: none; color: rgb(252, 7, 7); font-size: 24px; line-height: 1; cursor: pointer; z-index: 10; display: block;"><i class="bi bi-x-circle-fill"></i></button>
                        <button type="button" class="edit-title-btn" title="แก้ไขชื่อภาพ" style="position: absolute; top: 38px; right: 8px; width: 26px; height: 26px; background-color: #198754; color: #fff; border-radius: 50%; border: 2px solid white; font-weight: bold; font-size: 14px; line-height: 1; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);">A</button>
                    </label>
                </div>
            `;
            // Find the "Add Image" button for this category and insert before it
            const addImageBtn = targetSection.querySelector(`.add-image-btn[data-category="${pic.pic_type}"]`);
            if (addImageBtn) {
                addImageBtn.parentElement.insertAdjacentHTML('beforebegin', newSlotHtml);
            } else {
                targetSection.insertAdjacentHTML('beforeend', newSlotHtml);
            }
        }
    });

    // Call updateDamageDetailField after the loop to populate the textarea.
    setTimeout(() => updateDamageDetailField(), 0);
  }

  async function loadOrderData(orderId) {
    const token = localStorage.getItem('authToken') || '';
    try {
                  const response = await fetch(`https://be-claims-service.onrender.com/api/order-detail/inquiry`, {        method: 'POST',
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
        document.getElementById('s_detail').readOnly = true; // Make the field readonly
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

      // Specifically for Bike role, show the customer info card
      if (userRole === 'Bike') {
        const bikeCard = document.getElementById('bike-customer-info-card');
        const bikeName = document.getElementById('bike-customer-name');
        const bikePhone = document.getElementById('bike-customer-phone');

        if (bikeCard && order_details) {
          bikeName.textContent = order_details.c_insure || '-';
          bikePhone.textContent = order_details.c_tell || '-';
          const callBtn = document.getElementById('call-customer-btn');
          if (callBtn && order_details.c_tell) {
            callBtn.href = `tel:${order_details.c_tell.replace(/[^0-9]/g, '')}`;
          } else if (callBtn) {
            callBtn.style.display = 'none';
          }
          bikeCard.style.display = 'block';
        }
      }

    } catch (err) {
      alert('❌ ไม่สามารถโหลดข้อมูลได้');
      console.error('Inquiry Error:', err);
    }
  }

  async function loadAssignees(order, token) {
    try {
      const response = await fetch(`https://be-claims-service.onrender.com/api/user-management/assigners`, { headers: { 'Authorization': token } });
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
          const response = await fetch(`https://be-claims-service.onrender.com/api/order-status/update/${orderId}`, {
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

  async function updateImageTitle(orderId, picUrl, newTitle) {
    const token = localStorage.getItem('authToken') || '';
    try {
        const response = await fetch(`https://be-claims-service.onrender.com/api/order-pic/update-title`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ orderId, picUrl, newTitle })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'ไม่สามารถอัปเดตชื่อรูปภาพได้');
        }
        alert('✅ ' + result.message);
        return true;
    } catch (error) {
        console.error('Image title update error:', error);
        alert(`❌ เกิดข้อผิดพลาด: ${error.message}`);
        return false;
    }
  }

  // =========================================================
  // PHOTO RENDERING LOGIC
  // =========================================================

  function updateDamageDetailField() {
    const allImageTitles = [];
    // Query the whole document for image galleries that have been filled
    const filledLabels = document.querySelectorAll('label.image-gallery[data-filled="true"]');

    filledLabels.forEach(label => {
        const titleDiv = label.querySelector('.title');
        if (titleDiv) {
            allImageTitles.push(titleDiv.textContent.trim());
        }
    });

    const sDetailInput = document.getElementById('s_detail');
    if (sDetailInput) {
        sDetailInput.value = allImageTitles.join(', ');
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
        this.form.querySelectorAll('select, button, input[type="checkbox"], input[type="file"]').forEach(el => {
            // Don't disable tab buttons or the downloadAllBtn
            if (!el.classList.contains('nav-link') && el.id !== 'downloadAllBtn') {
                el.disabled = true;
            }
        });
        // Hide image manipulation buttons
        const replaceImageBtn = document.getElementById('replace-image-btn');
        if (replaceImageBtn) replaceImageBtn.style.display = 'none';
        document.querySelectorAll('.delete-btn, .edit-title-btn').forEach(btn => btn.style.display = 'none');

        if (this.saveBtn) this.saveBtn.style.display = 'none';
        const saveImagesBtn = document.getElementById('save-images-btn');
        if (saveImagesBtn) saveImagesBtn.style.display = 'none';
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
        this.setReadOnlyAll(); // Start by making everything read-only

        // 1. Fields to HIDE for the bike role (including customer info fields from the form)
        const fieldsToHide = [
            'taskId', 'transactionDate', 'creatorName', 'phone', 'phone2', 'phone3',
            'ownerName', 'jobType', 'channel', 'processType',
            'c_insure', 'c_tell',
            'carProvince', 'carEngine', 'carChassis', 'carYear', 'insuranceCompany',
            'insuranceBranch', 'reference1', 'reference2', 'policyNumber',
            'coverageStartDate', 'coverageEndDate', 'insuranceType', 's_ins_remark', 's_remark'
        ];
        hideFormFields(fieldsToHide);

        // 2. Hide unnecessary tabs, including the 'Upload' tab now
        hideTabs(['tab-appointments-li', 'tab-note-li', 'tab-history-li', 'tab-upload-li']);

        // 3. Configure the status dropdown
        const statusDropdown = document.getElementById('orderStatus');
        if (statusDropdown) {
            statusDropdown.disabled = false;
                        const allowedStatuses = [
                            "รับงาน",
                            "เริ่มงาน/กำลังเดินทาง",
                            "ถึงที่เกิดเหตุ/ปฏิบัติงาน",
                            "ส่งงาน/ตรวจสอบเบื้องต้น"
                        ];
            const currentStatus = statusDropdown.value;
            statusDropdown.innerHTML = '';
            if (!allowedStatuses.includes(currentStatus)) {
                const placeholder = document.createElement('option');
                placeholder.value = currentStatus;
                placeholder.textContent = currentStatus;
                placeholder.disabled = true;
                placeholder.selected = true;
                statusDropdown.appendChild(placeholder);
            }
            allowedStatuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (status === currentStatus) {
                    option.selected = true;
                }
                statusDropdown.appendChild(option);
            });
        }

        // 4. Show and enable specific car fields
        const fieldsToShowAndEdit = ['carBrand', 'c_mile', 'carType', 'carModel'];
        fieldsToShowAndEdit.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.disabled = false;
                if (el.readOnly) el.readOnly = false;
                const parentDiv = el.closest('.mb-3');
                if (parentDiv) {
                    parentDiv.style.display = 'block';
                    const boxContainer = parentDiv.closest('.py-3.px-4.rounded.bg-white.border');
                    if (boxContainer) boxContainer.style.display = 'block';
                }
            }
        });

        // Ensure the parent tab content for the above fields is visible
        const tabHome = document.getElementById('tab-home');
        if(tabHome) tabHome.classList.add('active', 'show');
        const tabHomeLink = document.querySelector('button[data-bs-target="#tab-home"]');
        if(tabHomeLink) tabHomeLink.parentElement.style.display = 'block';

        // 5. Keep Image Viewing Tab Active
        const imageTabLink = document.querySelector('button[data-bs-target="#tab-contact"]');
        if(imageTabLink) imageTabLink.parentElement.style.display = 'block';
        const imageTab = document.getElementById('tab-contact');
        if (imageTab) {
            imageTab.querySelectorAll('input, button, textarea, select').forEach(el => {
                if(el.id !== 'save-images-btn') el.disabled = false;
            });
        }
        const downloadAllBtn = document.getElementById('downloadAllBtn');
        if(downloadAllBtn) downloadAllBtn.disabled = false;
        const replaceImageBtn = document.getElementById('replace-image-btn');
        if (replaceImageBtn) {
            replaceImageBtn.style.display = 'inline-block';
            replaceImageBtn.disabled = false;
        }
        document.querySelectorAll('.delete-btn, .edit-title-btn').forEach(btn => {
            btn.style.display = 'block';
            btn.disabled = false;
        });

        // 6. Re-enable the main save button
        if (this.saveBtn) {
            this.saveBtn.style.display = 'inline-block';
            this.saveBtn.disabled = false;
        }
    }
}

class UIInsurancePermissionManager extends UIPermissionManager {
    configure(orderStatus, data) {
        this.setReadOnlyAll();
        let allowedStatuses = [];

        // Hide specific tabs for Insurance role
        hideTabs(['tab-appointments-li', 'tab-note-li', 'tab-history-li', 'tab-upload-li']);

        if (orderStatus === 'ส่งงาน/ตรวจสอบเบื้องต้น') {
            allowedStatuses = ['รออนุมัติ', orderStatus];
        } else if (orderStatus === 'Pre-Approved') {
            allowedStatuses = ['ผ่าน', 'ไม่ผ่าน'];
        }

        if (allowedStatuses.length > 0) {
            this.applyStatusPermissions(allowedStatuses);
        }

        // Hide empty image slots for Insurance role
        document.querySelectorAll('.image-gallery').forEach(label => {
            if (!label.hasAttribute('data-filled')) {
                const parentColDiv = label.closest('.col-4.mb-3.text-center');
                if (parentColDiv) {
                    parentColDiv.style.display = 'none';
                }
            }
        });
    }
}

function getUIPermissionManager(role) {
    switch (role) {
        case 'Admin':
        case 'Director':
        case 'Developer':
        case 'Admin Officer':
        case 'Officer':
        case 'Leader':
        case 'Sales Manager':
        case 'Operation Manager':
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

function populateModels(brandSelect, modelSelect) {
  if (!brandSelect || !modelSelect) return;
  const selectedBrand = brandSelect.value;
  const models = carModels[selectedBrand] || [];
  modelSelect.innerHTML = '<option selected disabled>เลือกรุ่น</option>';
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  });
  modelSelect.disabled = models.length === 0;
}

function initCarModelDropdown(brandSelect, modelSelect) {
  if (brandSelect && modelSelect) {
    brandSelect.addEventListener('change', () => populateModels(brandSelect, modelSelect));
  }
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

      // Clear existing static image blocks if any
      Object.values(sectionsMap).forEach(section => {
          if (section) section.innerHTML = '';
      });

      // Render "Add Image" buttons for each category
      for (const category in sectionsMap) {
          const targetSection = sectionsMap[category];
          if (targetSection) {
              const addImageButtonHtml = `
                  <div class="col-4 mb-3 text-center">
                      <button type="button" class="btn btn-outline-primary add-image-btn" data-category="${category}">
                          <i class="bi bi-plus-circle"></i> เพิ่มรูปภาพ
                      </button>
                  </div>
              `;
              targetSection.insertAdjacentHTML('beforeend', addImageButtonHtml);
          }
      }
  }

  // =========================================================
  // DOMContentLoaded - MAIN EXECUTION & EVENT LISTENERS
  // =========================================================

  document.addEventListener('DOMContentLoaded', function () {
    initCarModelDropdown(document.getElementById('carBrand'), document.getElementById('carModel'));

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
        console.log('Download All button clicked.');
        const zip = new JSZip();
        const orderId = document.getElementById('taskId').value.trim();
        const imageElements = Array.from(document.querySelectorAll('.image-gallery img')).filter(img => {
          const style = getComputedStyle(img);
          return (img.src && img.src.startsWith('https') && style.display !== 'none' && img.complete);
        });
        if (imageElements.length === 0) { alert('ไม่มีภาพให้ดาวน์โหลด'); return; }
        console.log(`Found ${imageElements.length} images to download.`);
        await Promise.all(
          imageElements.map(async (img, i) => {
            const originalImageUrl = img.src; // This is the Cloudinary URL
            const label = img.closest('label');
            const title = label?.querySelector('.title')?.innerText?.trim() || `image-${i + 1}`;
            const safeName = title.replace(/[\[\\\]^$.|?*+()]/g, '').replace(/\s+/g, '_'); // More robust safe name

            console.log(`Attempting to download image ${i + 1}: ${originalImageUrl}`);

            try {
                const token = localStorage.getItem('authToken') || '';
                                    const response = await fetch(`https://be-claims-service.onrender.com/api/upload/proxy-download`, {                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify({ imageUrl: originalImageUrl })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to download image from proxy: ${response.status} ${response.statusText} - ${errorText}`);
                }

                const blob = await response.blob();
                zip.file(`${safeName || `image-${i + 1}`}.jpg`, blob);
                console.log(`Successfully added image ${i + 1} to zip: ${safeName}.jpg`);
            } catch (err) {
                console.warn(`ข้ามภาพที่โหลดไม่ได้ (Proxy error): ${originalImageUrl}`, err);
            }
          })
        );
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, orderId + '.zip');
        console.log('ZIP file generated and ready for download.');
      });
    }

    // --- Dynamic Image Upload Logic ---
    function renderNewImageUploadSlot(category) {
        const uniqueId = `dynamic-upload-${category}-${Date.now()}`;
        const newSlotHtml = `
            <div class="col-4 mb-3 text-center dynamic-image-slot">
                <label class="image-gallery w-100" style="cursor:pointer; position:relative; display: block; border-radius:8px; overflow: hidden; height: 200px;">
                    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="width:100%; height:100%; object-fit: cover; display:block;" alt="New Image">
                    <div class="title" contenteditable="true" style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 6px 10px; background: rgba(0,0,0,0.8); color: white; font-weight: 600; font-size: 14px; text-align: center; box-sizing: border-box;">
                        กรุณาใส่ชื่อ
                    </div>
                    <input type="file" id="${uniqueId}" name="dynamic_image" data-category="${category}" hidden accept="image/*" capture="camera">
                    <button type="button" class="delete-btn" title="ลบภาพ" style="position: absolute; top: 6px; right: 6px; background: transparent; border: none; color: rgb(252, 7, 7); font-size: 24px; line-height: 1; cursor: pointer; z-index: 10; display: block;"><i class="bi bi-x-circle-fill"></i></button>
                </label>
            </div>
        `;
        return newSlotHtml;
    }

    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('add-image-btn')) {
            const category = e.target.dataset.category;
            const newSlotHtml = renderNewImageUploadSlot(category);
            e.target.parentElement.insertAdjacentHTML('beforebegin', newSlotHtml);
        }
    });

    // Delegated event listener for dynamically created file inputs
    document.addEventListener('change', async function(e) {
        if (e.target && e.target.name === 'dynamic_image') {
            const fileInput = e.target;
            const file = fileInput.files[0];
            if (!file) return;

            const label = fileInput.closest('label');
            const img = label.querySelector('img');
            const titleDiv = label.querySelector('.title');
            const customName = titleDiv.textContent.trim();
            const folderName = document.getElementById('taskId')?.value.trim() || 'default';
            const category = fileInput.dataset.category;

            img.src = 'https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca.gif'; // Show loader

            try {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                }
                console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                const compressedFile = await imageCompression(file, options);
                console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

                const formData = new FormData();
                formData.append('folder', folderName);
                formData.append('category', category);
                formData.append('images', compressedFile, customName + '.' + file.name.split('.').pop());

                const token = localStorage.getItem('authToken') || '';
                const response = await fetch(`https://be-claims-service.onrender.com/api/upload/image/transactions`, {
                    method: 'POST',
                    headers: { 'Authorization': token },
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.uploaded && result.uploaded.length > 0) {
                        img.src = result.uploaded[0].url + '?t=' + new Date().getTime();
                        label.setAttribute('data-filled', 'true');
                        updateDamageDetailField(); // Update damage field on successful upload
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
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Reset to placeholder on error
            }
        }
    });

    // Delegated event listener for delete buttons on dynamic image slots
    document.addEventListener('click', function(e) {
        if (e.target && e.target.closest('.delete-btn')) {
            e.preventDefault();
            const deleteBtn = e.target.closest('.delete-btn');
            const imageSlot = deleteBtn.closest('.dynamic-image-slot');
            if (imageSlot) {
                imageSlot.remove();
                updateDamageDetailField(); // Update the summary field after removal
            }
        }
    });

    loadUserProfile();
    hideUserManagementMenu(); // Call the new function here
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


    const orderId = getQueryParam('id');
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
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('authToken'); navigateTo(LOGIN_PAGE);
  });
    const logoutMenu = document.getElementById('logout-menu');
    if (logoutMenu) logoutMenu.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('authToken'); navigateTo(LOGIN_PAGE);
   });

    const manualSubmitBtn = document.getElementById('submittaskBtn');
    if (manualSubmitBtn) manualSubmitBtn.addEventListener('click', () => form.requestSubmit());

    const saveImagesBtn = document.getElementById('save-images-btn');
    if (saveImagesBtn) {
      saveImagesBtn.addEventListener('click', () => {
        const mainSaveBtn = document.getElementById('submittaskBtn');
        if (mainSaveBtn) {
            mainSaveBtn.click();
        }
      });
    }

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

    if (getUserRole() !== 'Bike') {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const currentUserRole = getUserRole();

        const token = localStorage.getItem('authToken') || '';
        const currentOrderId = getSafeValue('taskId');
        const created_by = getSafeValue('ownerName');
        let endpoint, data, method;

        const orderPic = [];
        document.querySelectorAll('label.image-gallery[data-filled="true"]').forEach(label => {
            const img = label.querySelector('img');
            const titleDiv = label.querySelector('.title');
            const fileInput = label.querySelector('input[type="file"]');

            if (img && img.src && img.src.startsWith('http') && titleDiv && fileInput) {
                const picType = fileInput.dataset.category || 'unknown'; // Get category from data-category
                const title = titleDiv.textContent.trim();
                orderPic.push({ pic: img.src.split('?')[0], pic_type: picType, pic_title: title, created_by: created_by });
            }
        });

        const date = getSafeValue('appointmentDate');
        const time = getSafeValue('appointmentTime');
        let appointment_date = null;
        if (date) appointment_date = time ? new Date(`${date}T${time}`).toISOString() : new Date(date).toISOString();
        const s_start = getSafeValue('coverageStartDate')?.trim();
        const s_end = getSafeValue('coverageEndDate')?.trim();

        const commonData = {
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

        if (!currentOrderId) { // Creating a new order
            endpoint = `https://be-claims-service.onrender.com/api/orders/create`;
            method = 'POST';
            data = { ...commonData, created_by: created_by }; // Ensure created_by is passed for new orders
        } else if (currentUserRole === 'Insurance') { // Updating status for Insurance role
            endpoint = `https://be-claims-service.onrender.com/api/order-status/update/${currentOrderId}`;
            method = 'PUT';
            data = {
                order_status: getSafeValue('orderStatus'),
                updated_by: created_by,
                order_hist: [{ icon: "📝", task: "อัปเดตสถานะ", detail: `อัปเดตโดยผู้ใช้: ${created_by}`, created_by }]
            };
        } else { // Updating existing order for other roles
            endpoint = `https://be-claims-service.onrender.com/api/orders/update/${currentOrderId}`;
            method = 'PUT';
            data = commonData;
        }

        try {
          const response = await fetch(endpoint, { method: method, headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` }, body:
    JSON.stringify(data) });
          const result = await response.json();
          if (response.ok) {
            alert('✅ ดำเนินการเรียบร้อยแล้ว'); // Changed message to be more generic
navigateTo('dashboard.html');
          } else {
            alert('❌ เกิดข้อผิดพลาด: ' + result.message);
          }
        } catch (error) {
          alert('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
          console.error('Fetch error:', error);
        }
      });
    }

    if (getUserRole() === 'Bike') {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
    
        const token = localStorage.getItem('authToken') || '';
        const currentOrderId = getSafeValue('taskId');
        const userInfoEl = document.getElementById('user-info');
        const updated_by = userInfoEl ? userInfoEl.innerText : 'Bike User';
    
        if (!currentOrderId) {
          alert('❌ ไม่พบรหัสงาน ไม่สามารถบันทึกได้');
          return;
        }
    
        let allSuccess = true;
        let successMessages = [];
        let errorMessages = [];
    
        // --- 1. Update Order Status ---
            let newStatus = getSafeValue('orderStatus');
            if (newStatus === 'ส่งงาน/ตรวจสอบเบื้องต้น') {
                newStatus = 'รออนุมัติ';
            }
            const statusPayload = {
              order_status: newStatus,
              updated_by: updated_by,
              order_hist: [{ icon: "🚲", task: "อัปเดตสถานะ", detail: `อัปเดตสถานะโดยผู้ใช้: ${updated_by}`, created_by: updated_by }]
            };        const statusEndpoint = `https://be-claims-service.onrender.com/api/order-status/update/${currentOrderId}`;    
        try {
          const statusResponse = await fetch(statusEndpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
            body: JSON.stringify(statusPayload)
          });
          const statusResult = await statusResponse.json();
          if (statusResponse.ok) {
            successMessages.push('✅ อัปเดตสถานะเรียบร้อยแล้ว');
          } else {
            allSuccess = false;
            errorMessages.push(`❌ ข้อผิดพลาดสถานะ: ${statusResult.message}`);
          }
        } catch (error) {
          allSuccess = false;
          errorMessages.push(`❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่ออัปเดตสถานะ: ${error.message}`);
          console.error('Fetch error for status update:', error);
        }
    
        // --- 2. Update Car Details and Pictures ---
        const carDetailsPayload = {
          c_brand: getSafeValue('carBrand'),
          c_version: getSafeValue('carModel'),
          c_mile: getSafeValue('c_mile'),
          c_type: getSafeValue('carType'),
          updated_by: updated_by,
          order_hist: [{ icon: "🚗", task: "อัปเดตข้อมูลรถ", detail: `อัปเดตข้อมูลรถโดยผู้ใช้: ${updated_by}`, created_by: updated_by }]
        };
    
        // Collect picture data
        const orderPic = [];
        document.querySelectorAll('label.image-gallery[data-filled="true"]').forEach(label => {
            const img = label.querySelector('img');
            const titleDiv = label.querySelector('.title');
            const fileInput = label.querySelector('input[type="file"]');

            if (img && img.src && img.src.startsWith('http') && titleDiv && fileInput) {
                const picType = fileInput.dataset.category || 'unknown'; // Get category from data-category
                const title = titleDiv.textContent.trim();
                orderPic.push({ pic: img.src.split('?')[0], pic_type: picType, pic_title: title, created_by: updated_by });
            }
        });
        carDetailsPayload.order_pic = orderPic;
    
        const carDetailsEndpoint = `https://be-claims-service.onrender.com/api/order-pic/update/${currentOrderId}`;
    
        try {
          const carDetailsResponse = await fetch(carDetailsEndpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
            body: JSON.stringify(carDetailsPayload)
          });
          const carDetailsResult = await carDetailsResponse.json();
          if (carDetailsResponse.ok) {
            successMessages.push('✅ อัปเดตข้อมูลรถและรูปภาพเรียบร้อยแล้ว');
          } else {
            allSuccess = false;
            errorMessages.push(`❌ ข้อผิดพลาดข้อมูลรถ/รูปภาพ: ${carDetailsResult.message}`);
          }
        } catch (error) {
          allSuccess = false;
          errorMessages.push(`❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่ออัปเดตข้อมูลรถ/รูปภาพ: ${error.message}`);
          console.error('Fetch error for car details/pic update:', error);
        }
    
        // --- Final Alert and Redirect ---
        if (allSuccess) {
          alert(successMessages.join('\n'));
          navigateTo('dashboard.html');
        } else {
          alert(errorMessages.join('\n'));
        }
      });
    }

    // --- Start of Image Preview and Replace Logic ---
    const imagePreviewModalEl = document.getElementById('imagePreviewModal');
    if (imagePreviewModalEl) {
        const imagePreviewModal = new bootstrap.Modal(imagePreviewModalEl);
        const previewImage = document.getElementById('previewImage');
        let context = {}; // To store context for the replace button

        // Listener for the "Replace Image" button in the modal
        const replaceBtn = document.getElementById('replace-image-btn');
        const downloadModalBtn = document.getElementById('download-modal-btn');
        const userRole = getUserRole(); // Get user role

        if (replaceBtn) {
            console.log('Current user role for replaceBtn visibility:', userRole); // Add this log
            // Hide replace button for Insurance role
            if (userRole === 'Insurance') {
                replaceBtn.style.display = 'none';
                console.log('replaceBtn hidden for Insurance role.'); // Add this log
            } else {
                replaceBtn.style.display = 'inline-block'; // Ensure visible for other roles
                console.log('replaceBtn visible for role:', userRole); // Add this log
            }
            // ...
        }

        // Listener for the "Download" button in the modal
        if (downloadModalBtn) {
            downloadModalBtn.addEventListener('click', async () => {
                const imageUrlToDownload = previewImage.src; // Get image URL from the preview
                if (!imageUrlToDownload || imageUrlToDownload.includes('data:image/gif')) {
                    alert('ไม่มีรูปภาพให้ดาวน์โหลด');
                    return;
                }

                try {
                    const token = localStorage.getItem('authToken') || '';
                  const response = await fetch(`https://be-claims-service.onrender.com/api/upload/proxy-download`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': token },
                        body: JSON.stringify({ imageUrl: imageUrlToDownload })
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Failed to download image from proxy: ${response.status} ${response.statusText} - ${errorText}`);
                    }

                    const blob = await response.blob();
                    const filenameWithQuery = imageUrlToDownload.split('/').pop();
                    const filename = filenameWithQuery.split('?')[0]; // Strip query parameters
                    saveAs(blob, filename);
                    console.log(`Successfully downloaded image from modal: ${filename}`);
                } catch (err) {
                    console.error(`Error downloading image from modal: ${imageUrlToDownload}`, err);
                    alert(`🚫 ไม่สามารถดาวน์โหลดรูปภาพได้: ${err.message}`);
                }
            });
        }

        // Delegated listener for all image-related actions
                                document.addEventListener('click', function(e) {
                                    const label = e.target.closest('label.image-gallery');
                                    const isDownloadButton = e.target.closest('.btn.bi-download'); // Check if the clicked element or its ancestor is the download button
                    
                                    // Exit if not a relevant click, or if the click originated from the download button
                                    if (!label || e.target.closest('.delete-btn') || e.target.closest('.edit-title-btn') || isDownloadButton) {
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
                                            
                                            // --- Timestamp Overlay Logic ---
                                            // Remove any existing timestamp overlay first
                                            const existingOverlay = imagePreviewModalEl.querySelector('.timestamp-overlay');
                                            if (existingOverlay) {
                                                existingOverlay.remove();
                                            }

                                            // Add new timestamp overlay if the date exists on the image's data attribute
                                            console.log('img.dataset.createdDate:', img.dataset.createdDate); // Debugging line
                                            if (img.dataset.createdDate) {
                                                const container = imagePreviewModalEl.querySelector('.image-preview-container');
                                                const timestamp = new Date(img.dataset.createdDate);
                                                // Format to DD-MM-YYYY HH:mm
                                                const formattedTimestamp = timestamp.toLocaleString('en-GB', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    timeZone: 'Asia/Bangkok'
                                                }).replace(/\//g, '-').replace(',', '');

                                                const timestampOverlay = document.createElement('div');
                                                timestampOverlay.className = 'timestamp-overlay';
                                                timestampOverlay.textContent = formattedTimestamp;
                                                // Force visibility and position for debugging
                                                timestampOverlay.style.cssText = 'position: absolute; bottom: 10px; right: 10px; background-color: transparent; color: blue; padding: 5px; border-radius: 3px; z-index: 1000;';
                                                
                                                if (container) {
                                                    container.appendChild(timestampOverlay);
                                                }
                                            }
                                            // --- End of Timestamp Overlay Logic ---

                                            previewImage.src = img.src;
                                            imagePreviewModal.show();
                                        }
                                    }
                                });
    }
    // --- End of Image Preview and Replace Logic ---

    

    document.addEventListener('click', async function(e) {
        if (e.target && e.target.closest('.edit-title-btn')) {
            e.preventDefault();
            const editBtn = e.target.closest('.edit-title-btn');
            const label = editBtn.closest('label.image-gallery');
            const img = label.querySelector('img');
            const titleDiv = label.querySelector('.title');

            if (!img || !img.src.startsWith('http')) {
                alert('ไม่สามารถแก้ไขชื่อรูปภาพที่ยังไม่ได้อัปโหลด');
                return;
            }

            const currentTitle = titleDiv.textContent;
            const newTitle = prompt('กรุณาใส่ชื่อรูปภาพใหม่:', currentTitle);

            if (newTitle && newTitle.trim() !== '' && newTitle !== currentTitle) {
                const orderId = getSafeValue('taskId');
                const picUrl = img.src.split('?')[0]; // Remove cache-busting query params

                const success = await updateImageTitle(orderId, picUrl, newTitle.trim());
                if (success) {
                    titleDiv.textContent = newTitle.trim();
                    updateDamageDetailField(); // Update the summary field
                }
            }
        }
    });


  
          function renderUploadedImages(orderPics) {
            // If there are no pictures, ensure the damage field is cleared.
            if (!orderPics || orderPics.length === 0) {
                setTimeout(() => updateDamageDetailField(), 0);
                return;
            }
    
            orderPics.forEach(pic => {
                // Use pic_type for a reliable match against the input's name attribute.
                if (!pic.pic_type || !pic.pic) return;
    
                const fileInput = document.querySelector(`input[type="file"][name="${pic.pic_type}"]`);
                if (fileInput) {
                    const label = fileInput.closest('label.image-gallery');
                    
                    // Ensure we don't re-process a slot that's already filled.
                    if (label && !label.hasAttribute('data-filled')) {
                        label.setAttribute('data-filled', 'true');
    
                        const imgTag = label.querySelector('img');
                        if (imgTag) {
                            imgTag.src = pic.pic;
                            imgTag.style.display = 'block';
                            // Store the timestamp on the image element itself
                            if (pic.created_date) {
                                imgTag.dataset.createdDate = pic.created_date;
                            }
                        }
    
                        // Update the title div with the title from the database, if available.
                        const titleDiv = label.querySelector('.title');
                        if (titleDiv && pic.pic_title) {
                            titleDiv.textContent = pic.pic_title;
                        }
                    }
                }
            });
    
            // Call updateDamageDetailField after the loop to populate the textarea.
            setTimeout(() => updateDamageDetailField(), 0);
          }
      }
  // เพิ่มบรรทัดนี้เพื่อปิด DOMContentLoaded listener ที่ขาดไป
  });