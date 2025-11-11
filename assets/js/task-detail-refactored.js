import { getQueryParam, navigateTo } from './navigation.js';


export const staticImageConfig = {
    around: [
        { name: "exterior_front", defaultTitle: "ภาพถ่ายรอบคัน - ด้านหน้ารถ" },
        { name: "exterior_left_front", defaultTitle: "ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหน้า" },
        { name: "exterior_left_center", defaultTitle: "ภาพถ่ายรอบคัน - ด้านซ้ายตรง" },
        { name: "exterior_left_rear", defaultTitle: "ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหลัง" },
        { name: "exterior_rear", defaultTitle: "ภาพถ่ายรอบคัน - ด้านท้ายรถ" },
        { name: "exterior_right_rear", defaultTitle: "ภาพถ่ายรอบคัน - ด้านขวาส่วนหลัง" },
        { name: "exterior_right_center", defaultTitle: "ภาพถ่ายรอบคัน - ด้านขวาตรง" },
        { name: "exterior_right_front", defaultTitle: "ภาพถ่ายรอบคัน - ด้านขวาส่วนหน้า" },
        { name: "exterior_roof", defaultTitle: "ภาพถ่ายรอบคัน - หลังคา" }
    ],
    accessories: [
        { name: "interior_wheels_1", defaultTitle: "ล้อหน้าซ้าย" },
        { name: "interior_wheels_2", defaultTitle: "ล้อหน้าขวา" },
        { name: "interior_wheels_3", defaultTitle: "ล้อหลังซ้าย" },
        { name: "interior_wheels_4", defaultTitle: "ล้อหลังขวา" },
        { name: "interior_dashboard", defaultTitle: "ปีผลิต/ขนาดล้อ/ยางอะไหล่" },
        { name: "interior_6", defaultTitle: "ห้องเครื่อง" },
        { name: "interior_7", defaultTitle: "จอไมล์" },
        { name: "interior_8", defaultTitle: "คอนโซล" },
        { name: "interior_9", defaultTitle: "วิทยุ" },
        { name: "interior_10", defaultTitle: "อื่นๆ" },
        { name: "interior_11", defaultTitle: "อื่นๆ" },
        { name: "interior_12", defaultTitle: "อื่นๆ" },
        { name: "interior_13", defaultTitle: "อื่นๆ" },
        { name: "interior_14", defaultTitle: "อื่นๆ" },
        { name: "interior_15", defaultTitle: "อื่นๆ" },
        { name: "interior_16", defaultTitle: "อื่นๆ" },
        { name: "interior_17", defaultTitle: "อื่นๆ" },
        { name: "interior_18", defaultTitle: "อื่นๆ" },
        { name: "interior_19", defaultTitle: "อื่นๆ" },
        { name: "interior_20", defaultTitle: "อื่นๆ" }
    ],
    inspection: [
        { name: "damage_images_1", defaultTitle: "รายละเอียดความเสียหาย 1." },
        { name: "damage_images_2", defaultTitle: "รายละเอียดความเสียหาย 2." },
        { name: "damage_images_3", defaultTitle: "รายละเอียดความเสียหาย 3." },
        { name: "damage_images_4", defaultTitle: "รายละเอียดความเสียหาย 4." },
        { name: "damage_images_5", defaultTitle: "รายละเอียดความเสียหาย 5." },
        { name: "damage_images_6", defaultTitle: "รายละเอียดความเสียหาย 6." },
        { name: "damage_images_7", defaultTitle: "รายละเอียดความเสียหาย 7." },
        { name: "damage_images_8", defaultTitle: "รายละเอียดความเสียหาย 8." },
        { name: "damage_images_9", defaultTitle: "รายละเอียดความเสียหาย 9." },
        { name: "damage_images_10", defaultTitle: "รายละเอียดความเสียหาย 10." }
    ],
    fiber: [
        { name: "doc_identity", defaultTitle: "เอกสารยืนยันตัวบุคคล" },
        { name: "doc_other_1", defaultTitle: "เอกสารยืนยันตัวรถ" },
        { name: "doc_other_2", defaultTitle: "เลขตัวถังและทะเบียนรถ" },
        { name: "doc_other_3", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "doc_other_4", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "doc_other_5", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "doc_other_6", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "doc_other_7", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "doc_other_8", defaultTitle: "เอกสารอื่น ๆ" }
    ],
    documents: [
        { name: "license", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "id_card", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "car_doc", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "car_number", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "other_1", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "other_2", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "doc_other_9", defaultTitle: "เอกสารอื่น ๆ" },
        { name: "other_3", defaultTitle: "เอกสารอื่น ๆ" }
    ],
    signature: [
        { name: "doc_other_9", defaultTitle: "ลายเซ็น" }
    ]
};





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

  // Map to hold files staged for upload
  const filesToUpload = new Map();

  // Function to add a watermark to an image file
  function addWatermark(imageFile) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');

                  canvas.width = img.width;
                  canvas.height = img.height;

                  // Draw the original image
                  ctx.drawImage(img, 0, 0);

                  // Prepare the watermark text
                  const now = new Date();
                  const day = String(now.getDate()).padStart(2, '0');
                  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                  const year = now.getFullYear();
                  const hours = String(now.getHours()).padStart(2, '0');
                  const minutes = String(now.getMinutes()).padStart(2, '0');
                  const watermarkText = `STSERVICE-${day}-${month}-${year} ${hours}:${minutes}`;

                  // Style the watermark
                  const fontSize = Math.max(18, Math.min(img.width / 30, img.height / 20)); // Dynamic font size
                  ctx.font = `bold ${fontSize}px Arial`;
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                  ctx.textAlign = 'right';
                  ctx.textBaseline = 'bottom';

                  // Add a slight shadow for better visibility
                  ctx.shadowColor = 'black';
                  ctx.shadowBlur = 4;
                  ctx.shadowOffsetX = 2;
                  ctx.shadowOffsetY = 2;

                  // Draw the watermark text at the bottom-right corner
                  ctx.fillText(watermarkText, canvas.width - 10, canvas.height - 10);

                  // Convert canvas to blob and resolve the promise
                  canvas.toBlob((blob) => {
                      if (blob) {
                          resolve(blob);
                      } else {
                          reject(new Error('Canvas to Blob conversion failed'));
                      }
                  }, 'image/jpeg', 0.9); // Use JPEG for good compression
              };
              img.onerror = (err) => {
                  reject(new Error('Failed to load image for watermarking.'));
              };
              img.src = event.target.result;
          };
          reader.onerror = (err) => {
              reject(new Error('Failed to read file for watermarking.'));
          };
          reader.readAsDataURL(imageFile);
      });
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

export function renderUploadedImages(orderPics) {
    console.log('[renderUploadedImages] Function called with orderPics:', orderPics);
    if (!orderPics || orderPics.length === 0) {
        console.log('[renderUploadedImages] No pictures to render or orderPics is empty.');
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

    orderPics.forEach((pic, index) => {
        console.log(`[renderUploadedImages] Processing pic #${index}:`, pic);
        if (!pic.pic_type || !pic.pic) {
            console.warn(`[renderUploadedImages] Skipping pic #${index} due to missing pic_type or pic URL.`);
            return;
        }

        let mainCategory = null;
        if (staticImageConfig.hasOwnProperty(pic.pic_type)) {
            mainCategory = pic.pic_type;
        } else {
            for (const key in staticImageConfig) {
                if (staticImageConfig[key].some(item => item.name === pic.pic_type)) {
                    mainCategory = key;
                    break;
                }
            }
        }

        if (!mainCategory) {
            console.warn(`[renderUploadedImages] Pic #${index}: Could not find main category for pic_type: '${pic.pic_type}'. Skipping.`);
            return;
        }

        const targetSection = sectionsMap[mainCategory];
        if (!targetSection) {
            console.warn(`[renderUploadedImages] Pic #${index}: Target section not found for main category: '${mainCategory}'. Skipping.`);
            return;
        }

        let filledExistingSlot = false;
        const placeholderSlot = targetSection.querySelector(`input[name="${pic.pic_type}"]`)?.closest('.dynamic-image-slot');

        if (placeholderSlot) {
            const img = placeholderSlot.querySelector('img');
            const titleInput = placeholderSlot.querySelector('.image-title-input');
            const deleteBtn = placeholderSlot.querySelector('.delete-btn');
            const editTitleBtn = placeholderSlot.querySelector('.edit-title-btn');

            if (img) {
                img.src = pic.pic;
                img.alt = pic.pic_title || 'Uploaded Image';
                if (pic.created_date) img.dataset.createdDate = pic.created_date;
            }
            if (titleInput) titleInput.value = pic.pic_title || 'กรุณาใส่ชื่อ';
            if (deleteBtn) deleteBtn.style.display = 'block';
            if (editTitleBtn) editTitleBtn.style.display = 'inline-block';
            
            placeholderSlot.setAttribute('data-uploaded', 'true');
            placeholderSlot.setAttribute('data-pic-url', pic.pic);
            placeholderSlot.setAttribute('data-pic-type', pic.pic_type);
            filledExistingSlot = true;
            console.log(`[renderUploadedImages] Pic #${index}: Filled existing placeholder for pic_type '${pic.pic_type}'.`);
        }

        if (!filledExistingSlot) {
            const uniqueId = `uploaded-image-${mainCategory}-${Date.now()}`;
            const defaultTitleConfig = staticImageConfig[mainCategory]?.find(item => item.name === pic.pic_type)?.defaultTitle;
            const displayTitle = pic.pic_title || defaultTitleConfig || 'กรุณาใส่ชื่อ';
            const newSlotHtml = `
                <div class="col-4 mb-3 dynamic-image-slot" data-pic-type="${pic.pic_type}" data-pic-url="${pic.pic}" data-uploaded="true">
                    <div class="image-container" style="position:relative; border-radius:8px; overflow: hidden; height: 200px; margin-bottom: 8px; cursor: pointer;">
                        <img src="${pic.pic}" style="width:100%; height:100%; object-fit: cover; display:block;" alt="${displayTitle}" data-created-date="${pic.created_date || new Date().toISOString()}">
                        <button type="button" class="delete-btn" title="ลบภาพ" style="position: absolute; top: 6px; right: 6px; background: transparent; border: none; color: rgb(252, 7, 7); font-size: 24px; line-height: 1; cursor: pointer; z-index: 10; display: block;"><i class="bi bi-x-circle-fill"></i></button>
                        <button type="button" class="upload-btn" title="เปลี่ยนรูป" style="position: absolute; bottom: 6px; left: 6px; background-color: rgba(0, 0, 0, 0.5); border: none; color: white; font-size: 18px; line-height: 1; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 32px; height: 32px;"><i class="bi bi-camera"></i></button>
                    </div>
                    <div class="d-flex align-items-center">
                        <input type="text" class="form-control image-title-input" value="${displayTitle}" placeholder="กรุณาใส่ชื่อ" style="flex-grow: 1; margin-right: 8px;">
                        <button type="button" class="btn btn-sm btn-outline-primary edit-title-btn" title="บันทึกชื่อ"><i class="bi bi-pencil"></i></button>
                    </div>
                    <input type="file" id="${uniqueId}" name="${pic.pic_type}" data-category="${mainCategory}" hidden accept="image/*" capture="camera">
                </div>
            `;
            const addImageBtnContainer = targetSection.querySelector('.add-image-btn')?.parentElement;
            if (addImageBtnContainer) {
                addImageBtnContainer.insertAdjacentHTML('beforebegin', newSlotHtml);
                console.log(`[renderUploadedImages] Pic #${index}: Inserted new dynamic slot before addImageBtnContainer.`);
            } else {
                targetSection.insertAdjacentHTML('beforeend', newSlotHtml);
                console.log(`[renderUploadedImages] Pic #${index}: Inserted new dynamic slot at the end of targetSection.`);
            }
        }
    });
    console.log('[renderUploadedImages] Finished processing all pictures.');
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
      console.log('loadOrderData: API response result:', result);
      console.log('loadOrderData: Extracted order_pic:', order_pic);
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

      // Set travel expense, prioritizing service_fee from order, then fallback to travel_expense from assignment
      setValue('travelExpense', order.service_fee || (order_assign.length > 0 ? order_assign[0].travel_expense : null) || '');

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
        console.log('DEBUG: s_detail from DB (before setValue):', order_details.s_detail);
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
        renderDownloadableImages(order_pic);
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

  async function deleteImage(orderId, picUrl) {
    const token = localStorage.getItem('authToken') || '';
    try {
        const response = await fetch(`https://be-claims-service.onrender.com/api/order-pic/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ orderId, picUrl })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'ไม่สามารถลบรูปภาพได้');
        }
        alert('✅ ' + result.message);
        return true;
    } catch (error) {
        console.error('Image delete error:', error);
        alert(`❌ เกิดข้อผิดพลาด: ${error.message}`);
        return false;
    }
  }

  // Function to handle image upload, compression, watermarking, and rendering
  async function uploadImageAndRender(file, orderId, imageSlot) {
    const token = localStorage.getItem('authToken') || '';
    const imgPreview = imageSlot.querySelector('img');
    const fileInput = imageSlot.querySelector('input[type="file"]');
    const uploadBtn = imageSlot.querySelector('.upload-btn');
    const deleteBtn = imageSlot.querySelector('.delete-btn');
    const titleInput = imageSlot.querySelector('.image-title-input');

    // Show loading state
    if (uploadBtn) {
        uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        uploadBtn.disabled = true;
    }
    if (deleteBtn) deleteBtn.disabled = true;
    if (titleInput) titleInput.disabled = true;

    try {
        // 1. Compress image
        const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });

        // 2. Add watermark
        const watermarkedBlob = await addWatermark(compressedFile);

        // 3. Prepare FormData
        const formData = new FormData();
        formData.append('order_id', orderId);
        formData.append('image', watermarkedBlob, file.name); // Use 'image' for single upload

        const picTitle = titleInput ? titleInput.value.trim() : 'ไม่ระบุข้อมูล';
        formData.append('pic_title', picTitle);

        const oldPicUrl = imageSlot.getAttribute('data-pic-url');
        let response;

        if (oldPicUrl) {
            // --- REPLACE Operation ---
            console.log('[uploadImageAndRender] Starting REPLACE operation.');
            formData.append('old_pic_url', oldPicUrl);
            
            response = await fetch(`https://be-claims-service.onrender.com/api/upload/image/replace`, {
                method: 'PUT',
                headers: { 'Authorization': token },
                body: formData
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Replace failed');

            // Directly update UI without full reload
            console.log('[uploadImageAndRender] Replace successful. New URL:', result.new_url);
            if (imgPreview) imgPreview.src = result.new_url;
            imageSlot.setAttribute('data-pic-url', result.new_url);
            alert('✅ แทนที่รูปภาพสำเร็จ!');

        } else {
            // --- ADD Operation ---
            console.log('[uploadImageAndRender] Starting ADD operation.');
            // The backend endpoint for transactions expects 'images' (plural)
            formData.delete('image');
            formData.append('images', watermarkedBlob, file.name);
            
            const picType = fileInput.dataset.category || 'unknown';
            formData.append('pic_type', picType);

            response = await fetch(`https://be-claims-service.onrender.com/api/upload/image/transactions`, {
                method: 'POST',
                headers: { 'Authorization': token },
                body: formData
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Upload failed');
            
            alert('✅ อัปโหลดรูปภาพใหม่สำเร็จ!');
            // Reload all data to refresh sections, as this is an ADD operation
            loadOrderData(orderId); 
        }

        populateDamageDetailFromImages(); // Update damage detail after any successful upload

    } catch (error) {
        console.error('Upload error:', error);
        alert(`❌ เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ${error.message}`);
        // Revert UI on error - only for ADD operations as replace doesn't change the src initially
        if (!oldPicUrl) {
            if (imgPreview) imgPreview.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            if (imageSlot.querySelector('.bi-camera')) imageSlot.querySelector('.bi-camera').style.display = 'block';
            imageSlot.removeAttribute('data-uploaded');
            fileInput.value = ''; // Clear file input
        }
    } finally {
        // Restore UI state
        if (uploadBtn) {
            uploadBtn.innerHTML = '<i class="bi bi-camera"></i>';
            uploadBtn.disabled = false;
        }
        if (deleteBtn) deleteBtn.disabled = false;
        if (titleInput) titleInput.disabled = false;
    }
  }

  // =========================================================
  // PHOTO RENDERING LOGIC
  // =========================================================
  function renderDownloadableImages(orderPics) {
    const container = document.getElementById('download-images-container');
    if (!container) return;
  
    container.innerHTML = ''; // Clear previous images
  
    if (!orderPics || orderPics.length === 0) {
      container.innerHTML = '<p class="text-muted">ไม่มีรูปภาพในรายการนี้</p>';
      return;
    }
  
    // Create a reverse map from sub-category (e.g., "exterior_front") to main category (e.g., "around")
    const subCategoryToMainCategoryMap = {};
    for (const mainCategory in staticImageConfig) {
      staticImageConfig[mainCategory].forEach(item => {
        subCategoryToMainCategoryMap[item.name] = mainCategory;
      });
    }
  
    // Define Thai names for main categories
    const mainCategoryNames = {
      around: 'ภาพถ่ายรอบคัน',
      accessories: 'ภาพถ่ายภายในรถ และอุปกรณ์ตกแต่ง',
      inspection: 'ภาพถ่ายความเสียหาย',
      fiber: 'เอกสารใบตรวจสภาพรถ',
      documents: 'เอกสารอื่นๆ',
      signature: 'ลายเซ็น'
    };
  
    // Group images by the main category
    const groupedImages = orderPics.reduce((acc, pic) => {
      let mainCategory = staticImageConfig.hasOwnProperty(pic.pic_type) 
        ? pic.pic_type 
        : subCategoryToMainCategoryMap[pic.pic_type];
  
      if (!mainCategory) {
        mainCategory = 'uncategorized'; // Fallback for unknown types
      }
  
      if (!acc[mainCategory]) {
        acc[mainCategory] = [];
      }
      acc[mainCategory].push(pic);
      return acc;
    }, {});
  
    // Define the desired order of categories
    const categoryOrder = ['around', 'accessories', 'inspection', 'fiber', 'documents', 'signature'];
  
    // Render images for each category in the specified order
    categoryOrder.forEach(mainCategory => {
      if (groupedImages[mainCategory]) {
        const categoryTitle = mainCategoryNames[mainCategory] || mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1);
        const categoryHtml = `
          <div class="col-12 mt-4">
            <h5 class="text-primary border-bottom pb-2 mb-3">${categoryTitle}</h5>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', categoryHtml);
  
        groupedImages[mainCategory].forEach(pic => {
          const cardHtml = `
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="card h-100">
                <a href="${pic.pic}" target="_blank">
                  <img src="${pic.pic}" class="card-img-top" alt="${pic.pic_title || 'Image'}" style="height: 200px; object-fit: cover;">
                </a>
                <div class="card-body text-center">
                  <p class="card-text">${pic.pic_title || 'No Title'}</p>
                  <button type="button" class="btn btn-sm btn-primary individual-download-btn" 
                          data-url="${pic.pic}" 
                          data-title="${pic.pic_title || 'image'}">
                    <i class="bx bx-download"></i> Download
                  </button>
                </div>
              </div>
            </div>
          `;
          container.insertAdjacentHTML('beforeend', cardHtml);
        });
      }
    });
  }
  
  export function populateDamageDetailFromImages() {
      console.log('populateDamageDetailFromImages function called.');
      const allImageTitles = [];
      const filledImageSlots = document.querySelectorAll('.dynamic-image-slot[data-uploaded="true"]');
      console.log(`Found ${filledImageSlots.length} filled image slots.`);
  
      filledImageSlots.forEach(slot => {
          const titleInput = slot.querySelector('.image-title-input');
          if (titleInput) {
              const titleText = titleInput.value.trim();
              if (titleText) {
                  allImageTitles.push(titleText);
                  console.log(`Collected title: "${titleText}"`);
              }
          }
      });
  
      const sDetailInput = document.getElementById('s_detail');
      if (sDetailInput) {
          const finalText = allImageTitles.join(', ');
          console.log(`Setting s_detail value to: "${finalText}"`);
          sDetailInput.value = finalText;
      } else {
          console.error('s_detail input field not found.');
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
            if (!el.classList.contains('nav-link') && el.id !== 'downloadAllBtn' && !el.classList.contains('individual-download-btn') && el.id !== 'view-full-image-btn') {
                el.disabled = true;
            }
        });
        // Hide image manipulation buttons
        document.querySelectorAll('.delete-btn, .edit-title-btn, .upload-btn').forEach(btn => btn.style.display = 'none');

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
        // Ensure the image tab is visible for admin-level roles
        const imageTabLink = document.querySelector('button[data-bs-target="#tab-contact"]');
        if (imageTabLink) {
            imageTabLink.parentElement.style.display = 'block';
        }

        // Show the toggle button and hide empty slots by default
        const toggleBtn = document.getElementById('toggleEmptySlotsBtn');
        if (toggleBtn) {
            toggleBtn.style.display = 'inline-block';
            // Hide empty slots by default on page load
            const emptySlots = document.querySelectorAll('.dynamic-image-slot:not([data-uploaded="true"])');
            emptySlots.forEach(slot => {
                slot.style.display = 'none';
            });
            toggleBtn.textContent = 'แสดงช่องว่าง';
            toggleBtn.dataset.state = 'hidden';
        }
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
        document.querySelectorAll('.delete-btn, .edit-title-btn, .upload-btn').forEach(btn => {
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
        // Fields that should always be read-only/disabled for Insurance role
        const alwaysReadOnly = [
            'taskId', 'transactionDate', 'ownerName', 'jobType', 'channel', 'processType',
            'insuranceCompany', // As per requirement, this should be disabled
            'appointmentDate', 'appointmentTime', 'address', 'responsiblePerson', 'travelExpense', 'contactedCustomer' // Appointment fields, tab is hidden anyway
        ];

        alwaysReadOnly.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio') {
                    el.disabled = true;
                } else {
                    el.readOnly = true;
                }
            }
        });

        // Hide image manipulation buttons
        const replaceImageBtn = document.getElementById('replace-image-btn');
        if (replaceImageBtn) replaceImageBtn.style.display = 'none';
        document.querySelectorAll('.delete-btn, .edit-title-btn').forEach(btn => btn.style.display = 'none');
        const saveImagesBtn = document.getElementById('save-images-btn');
        if (saveImagesBtn) saveImagesBtn.style.display = 'none';

        // Configure status dropdown
        if (orderStatus === 'Pre-Approved') {
            const allowedStatuses = ['ผ่าน', 'ไม่ผ่าน', 'Pre-Approved'];
            this.applyStatusPermissions(allowedStatuses);
            // Make sure the current value is selected
            if (this.statusDropdown) {
                this.statusDropdown.value = orderStatus;
            }
        } else {
            if (this.statusDropdown) {
                this.statusDropdown.disabled = true;
            }
        }

        // Hide unnecessary tabs for Insurance role
        hideTabs(['tab-appointments-li', 'tab-note-li', 'tab-history-li', 'tab-upload-li', 'tab-contact-li']);

        // Hide empty image slots for Insurance role and 'Add Image' buttons
        document.querySelectorAll('.dynamic-image-slot').forEach(slot => {
            // Check if it's an empty placeholder (not yet uploaded)
            if (!slot.hasAttribute('data-uploaded') || slot.getAttribute('data-uploaded') === 'false') {
                slot.style.display = 'none';
            }
        });

        // Hide all 'Add Image' buttons for the Insurance role
        document.querySelectorAll('.add-image-btn').forEach(button => {
            button.style.display = 'none';
        });

        // Disable and hide the AutoFillDamageBtn for Insurance role
        const autoFillDamageBtn = document.getElementById('autoFillDamageBtn');
        if (autoFillDamageBtn) {
            autoFillDamageBtn.disabled = true;
            autoFillDamageBtn.style.display = 'none';
        }
        
        // Ensure the main save button is visible and enabled
        if (this.saveBtn) {
            this.saveBtn.style.display = 'inline-block';
            this.saveBtn.disabled = false;
        }
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
    console.log('DEBUG: s_detail after applyRoleBasedRestrictions:', document.getElementById('s_detail')?.value);
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




export function populateImageSections() {
    const sectionsMap = {
        'around': document.getElementById('around-images-section')?.querySelector('.row'),
        'accessories': document.getElementById('accessories-images-section')?.querySelector('.row'),
        'inspection': document.getElementById('inspection-images-section')?.querySelector('.row'),
        'fiber': document.getElementById('fiber-documents-section')?.querySelector('.row'),
        'documents': document.getElementById('other-documents-section')?.querySelector('.row'),
        'signature': document.getElementById('signature-documents-section')?.querySelector('.row')
    };

    for (const category in sectionsMap) {
        const targetSection = sectionsMap[category];
        if (targetSection) {
            // Clear existing content to prevent duplicates
            targetSection.innerHTML = '';

            const items = staticImageConfig[category] || [];
            items.forEach(item => {
                const uniqueId = `static-upload-${item.name}-${Date.now()}`;
                const slotHtml = `
                    <div class="col-4 mb-3 dynamic-image-slot" data-category="${category}">
                        <div class="image-container" style="position:relative; border-radius:8px; overflow: hidden; height: 200px; margin-bottom: 8px; cursor: pointer;">
                            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="width:100%; height:100%; object-fit: cover; display:block;" alt="${item.defaultTitle}">
                            <button type="button" class="delete-btn" title="ลบภาพ" style="position: absolute; top: 6px; right: 6px; background: transparent; border: none; color: rgb(252, 7, 7); font-size: 24px; line-height: 1; cursor: pointer; z-index: 10; display: none;"><i class="bi bi-x-circle-fill"></i></button>
                            <button type="button" class="upload-btn" title="อัปโหลดรูป" style="position: absolute; bottom: 6px; left: 6px; background-color: rgba(0, 0, 0, 0.5); border: none; color: white; font-size: 18px; line-height: 1; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 32px; height: 32px;"><i class="bi bi-camera"></i></button>
                        </div>
                        <div class="d-flex align-items-center">
                            <input type="text" class="form-control image-title-input" value="${item.defaultTitle}" placeholder="กรุณาใส่ชื่อ" style="flex-grow: 1; margin-right: 8px;">
                            <button type="button" class="btn btn-sm btn-outline-primary edit-title-btn" title="บันทึกชื่อ" style="display: none;"><i class="bi bi-pencil"></i></button>
                        </div>
                        <input type="file" id="${uniqueId}" name="${item.name}" data-category="${category}" hidden accept="image/*" capture="camera">
                    </div>
                `;
                targetSection.insertAdjacentHTML('beforeend', slotHtml);
            });

            // Add the "Add Image" button after static slots
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

  window.addEventListener('load', function () {
    const imagePreviewModalEl = document.getElementById('imagePreviewModal');
    console.log('imagePreviewModalEl found (at top of DOMContentLoaded):', imagePreviewModalEl);

    const viewFullImageBtn = document.getElementById('view-full-image-btn');
    console.log('viewFullImageBtn found (at top of DOMContentLoaded):', viewFullImageBtn);

    initCarModelDropdown(document.getElementById('carBrand'), document.getElementById('carModel'));

    // --- CSV Import/Export Logic ---
    const headerMap = {
        'ชื่อผู้เอาประกัน': 'c_insure',
        'เบอร์โทรศัพท์ผู้เอาประกัน': 'c_tell',
        'ทะเบียนรถ': 'carRegistration',
        'จังหวัดทะเบียนรถ': 'carProvince',
        'ยี่ห้อรถ': 'carBrand',
        'รุ่นรถ': 'carModel',
        'ปีจดทะเบียน': 'carYear',
        'เลขตัวถัง': 'carChassis',
        'เลขเครื่อง': 'carEngine',
        'เลขไมล์': 'c_mile',
        'ประเภทรถ': 'carType',
        'สีรถ': 'carColor',
        'บริษัทประกันภัย': 'insuranceCompany',
        'สาขาประกันภัย': 'insuranceBranch',
        'ข้อมูลอ้างอิง1': 'reference1',
        'ข้อมูลอ้างอิง2': 'reference2',
        'เลขที่กรมธรรม์': 'policyNumber',
        'วันที่เริ่มต้นคุ้มครอง': 'coverageStartDate',
        'วันที่สิ้นสุดคุ้มครอง': 'coverageEndDate',
        'ประเภทประกัน': 'insuranceType',
        'หมายเหตุทั่วไป': 's_remark',
        'หมายเหตุบริษัทประกัน': 's_ins_remark',
        'รถFleet': 'fleetCar'
    };

    const downloadCsvTemplateBtn = document.getElementById('downloadCsvTemplateBtn');
    if (downloadCsvTemplateBtn) {
        downloadCsvTemplateBtn.addEventListener('click', () => {
            const headers = Object.keys(headerMap);
            const csvContent = "data:text/csv;charset=utf-8," + headers.join(',');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "template_task_detail.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    const uploadCsvInput = document.getElementById('uploadCsvInput');
    if (uploadCsvInput) {
        uploadCsvInput.addEventListener('click', function() {
            this.value = null;
        });
        uploadCsvInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                const lines = text.split(/\r\n|\n/);

                if (lines.length < 2) {
                    alert('ไฟล์ CSV ไม่ถูกต้องหรือไม่มีข้อมูล');
                    return;
                }

                const fileHeaders = lines[0].split(',').map(h => h.trim());
                const data = lines[1].split(',').map(d => d.trim());

                const dataMap = fileHeaders.reduce((obj, fileHeader, index) => {
                    const fieldId = headerMap[fileHeader];
                    if (fieldId) {
                        obj[fieldId] = data[index];
                    }
                    return obj;
                }, {});

                for (const id in dataMap) {
                    if (Object.hasOwnProperty.call(dataMap, id)) {
                        const value = dataMap[id];
                        const element = document.getElementById(id);
                        if (element) {
                            if (element.type === 'checkbox') {
                                element.checked = ['true', '1', 'yes', 'TRUE', 'YES'].includes(value);
                            } else {
                                element.value = value;
                                if (element.tagName === 'SELECT') {
                                    element.dispatchEvent(new Event('change'));
                                }
                            }
                        }
                    }
                }
                alert('นำเข้าข้อมูลจาก CSV สำเร็จ!');
            };
            reader.readAsText(file, 'UTF-8');
        });
    }

    const autoFillDamageBtn = document.getElementById('autoFillDamageBtn');
    if (autoFillDamageBtn) {
      autoFillDamageBtn.addEventListener('click', populateDamageDetailFromImages);
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
        console.log('Download All button clicked.');
        const zip = new JSZip();
        const orderId = document.getElementById('taskId').value.trim();
        const imageElements = Array.from(document.querySelectorAll('.image-gallery img, #download-images-container .card-img-top')).filter(img => {
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
            <div class="col-4 mb-3 dynamic-image-slot" data-category="${category}">
                <div class="image-container" style="position:relative; border-radius:8px; overflow: hidden; height: 200px; margin-bottom: 8px; cursor: pointer;">
                    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="width:100%; height:100%; object-fit: cover; display:block;" alt="New Image">
                    <button type="button" class="delete-btn" title="ลบภาพ" style="position: absolute; top: 6px; right: 6px; background: transparent; border: none; color: rgb(252, 7, 7); font-size: 24px; line-height: 1; cursor: pointer; z-index: 10; display: block;"><i class="bi bi-x-circle-fill"></i></button>
                    <button type="button" class="upload-btn" title="อัปโหลดรูป" style="position: absolute; bottom: 6px; left: 6px; background-color: rgba(0, 0, 0, 0.5); border: none; color: white; font-size: 18px; line-height: 1; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 32px; height: 32px;"><i class="bi bi-camera"></i></button>
                </div>
                <div class="d-flex align-items-center">
                    <input type="text" class="form-control image-title-input" value="กรุณาใส่ชื่อ" placeholder="กรุณาใส่ชื่อ" style="flex-grow: 1; margin-right: 8px;">
                    <button type="button" class="btn btn-sm btn-outline-primary edit-title-btn" title="บันทึกชื่อ"><i class="bi bi-pencil"></i></button>
                </div>
                <input type="file" id="${uniqueId}" name="dynamic_image" data-category="${category}" hidden accept="image/*" capture="camera">
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



    // Delegated event listener to trigger file input when the new upload button is clicked
    document.addEventListener('click', function(e) {
        console.log('Click event detected on document.');
        const uploadBtn = e.target.closest('.upload-btn');
        if (uploadBtn) {
            console.log('Upload button clicked.');
            const imageSlot = uploadBtn.closest('.dynamic-image-slot');
            console.log('Found parent image slot:', imageSlot);
            const fileInput = imageSlot.querySelector('input[type="file"]');
            console.log('Found file input:', fileInput);
            if (fileInput) {
                console.log('Triggering click on file input.');
                fileInput.click();
            }
        }
    });

    // Delegated event listener for delete buttons on dynamic image slots
    document.addEventListener('click', async function(e) {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            e.preventDefault();
            
            if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้?')) {
                const imageSlot = deleteBtn.closest('.dynamic-image-slot');
                const orderId = getSafeValue('taskId');
                const picUrl = imageSlot.getAttribute('data-pic-url');

                // If there's no picUrl, it's a newly added slot that hasn't been uploaded. Just remove it.
                if (!picUrl) {
                    imageSlot.remove();
                    populateDamageDetailFromImages();
                    return;
                }

                // If there is a picUrl, it needs to be deleted from the backend.
                const success = await deleteImage(orderId, picUrl);
                if (success) {
                    // Reload all data to ensure UI is consistent with the database
                    loadOrderData(orderId);
                }
            }
        }
    });

    // Delegated event listener for file inputs to trigger upload
    const form = document.getElementById('taskForm');
    if (form) {
        form.addEventListener('change', function(e) {
            console.log('Form change event detected.');
            const fileInput = e.target;
            if (fileInput.type === 'file' && fileInput.closest('.dynamic-image-slot')) {
                console.log('File input changed within a dynamic-image-slot.');
                const imageSlot = fileInput.closest('.dynamic-image-slot');
                const orderId = document.getElementById('taskId').value;
                console.log('Order ID:', orderId);

                if (!orderId) {
                    alert('กรุณาบันทึกข้อมูลงานก่อนทำการอัปโหลดรูปภาพ');
                    console.log('Upload stopped: No Order ID.');
                    fileInput.value = ''; // Reset file input
                    return;
                }

                const file = fileInput.files[0];
                if (file) {
                    console.log('File selected:', file.name, 'Preparing to start upload process...');
                    try {
                        if (typeof imageCompression === 'undefined') {
                            throw new Error('imageCompression library is not loaded.');
                        }
                        console.log('imageCompression library is loaded. Starting upload process...');
                        uploadImageAndRender(file, orderId, imageSlot);
                    } catch (error) {
                        console.error('Error initiating uploadImageAndRender:', error);
                        alert(`เกิดข้อผิดพลาดในการเริ่มต้นอัปโหลด: ${error.message}`);
                    }
                }
            }
        });
    }

    loadUserProfile();
    populateImageSections();

    const userRole = getUserRole();
    if (userRole) {
      const adminMenuEl = document.getElementById('admin-menu');
      const userManagementMenuEl = document.getElementById('user-management-menu');

      if (['Operation Manager', 'Director', 'Developer'].includes(userRole)) {
        if(adminMenuEl) adminMenuEl.style.display = 'block';
      }
      
      if (userRole === 'Admin Officer') {
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

    // Event listener for the "Show/Hide Empty Slots" button
    const toggleEmptySlotsBtn = document.getElementById('toggleEmptySlotsBtn');
    if (toggleEmptySlotsBtn) {
        toggleEmptySlotsBtn.addEventListener('click', () => {
            const emptySlots = document.querySelectorAll('.dynamic-image-slot:not([data-uploaded="true"])');
            const currentState = toggleEmptySlotsBtn.dataset.state || 'hidden';

            if (currentState === 'hidden') {
                emptySlots.forEach(slot => {
                    slot.style.display = 'block';
                });
                toggleEmptySlotsBtn.textContent = 'ซ่อนช่องว่าง';
                toggleEmptySlotsBtn.dataset.state = 'visible';
            } else {
                emptySlots.forEach(slot => {
                    slot.style.display = 'none';
                });
                toggleEmptySlotsBtn.textContent = 'แสดงช่องว่าง';
                toggleEmptySlotsBtn.dataset.state = 'hidden';
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
        document.querySelectorAll('.dynamic-image-slot[data-uploaded="true"]').forEach(slot => {
            const imgUrl = slot.getAttribute('data-pic-url');
            const picType = slot.getAttribute('data-pic-type');
            const titleInput = slot.querySelector('.image-title-input');
            const title = titleInput ? titleInput.value.trim() : 'ไม่ระบุข้อมูล';

            if (imgUrl && picType) {
                orderPic.push({ pic: imgUrl.split('?')[0], pic_type: picType, pic_title: title, created_by: created_by });
            }
        });

        const date = getSafeValue('appointmentDate');
        const time = getSafeValue('appointmentTime');
        let appointment_date = null;
        if (date) appointment_date = time ? new Date(`${date}T${time}`).toISOString() : new Date(date).toISOString();
        const s_start = getSafeValue('coverageStartDate')?.trim();
        const s_end = getSafeValue('coverageEndDate')?.trim();

        // Construct order_assign data
        const order_assign = [];
        const responsiblePerson = getSafeValue('responsiblePerson');
        // Only add to array if there is an owner for the assignment
        if (responsiblePerson) {
            order_assign.push({
                date: appointment_date,
                destination: getSafeValue('address'),
                owner: responsiblePerson,
                is_contact: document.getElementById('contactedCustomer')?.checked || false,
                travel_expense: getSafeValue('travelExpense') ? parseFloat(getSafeValue('travelExpense')) : null,
                created_by: created_by
            });
        }

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
            order_hist: [{ icon: "📝", task: "อัปเดตรายการ", detail: `อัปเดตโดยผู้ใช้: ${created_by}`, created_by }],
            order_assign: order_assign
        };

        if (!currentOrderId) { // Creating a new order
            endpoint = `https://be-claims-service.onrender.com/api/orders/create`;
            method = 'POST';
            data = { ...commonData, created_by: created_by }; // Ensure created_by is passed for new orders
        } else if (currentUserRole === 'Insurance') { // Updating existing order for Insurance role
            endpoint = `https://be-claims-service.onrender.com/api/orders/update/${currentOrderId}`;
            method = 'PUT';
            data = commonData;
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
    
        // --- Consolidate data into a single payload ---
        let newStatus = getSafeValue('orderStatus');
        if (newStatus === 'ส่งงาน/ตรวจสอบเบื้องต้น') {
            newStatus = 'รออนุมัติ';
        }

        const carDetailsPayload = {
          order_status: newStatus, // Add status to this payload
          c_brand: getSafeValue('carBrand'),
          c_version: getSafeValue('carModel'),
          c_mile: getSafeValue('c_mile'),
          c_type: getSafeValue('carType'),
          updated_by: updated_by,
          order_hist: [{ icon: "🚲", task: "ส่งงานและอัปเดตข้อมูล", detail: `อัปเดตสถานะและข้อมูลโดยผู้ใช้: ${updated_by}`, created_by: updated_by }]
        };
    
        // Collect picture data
        const orderPic = [];
        document.querySelectorAll('.dynamic-image-slot[data-uploaded="true"]').forEach(slot => {
            const imgUrl = slot.getAttribute('data-pic-url');
            const picType = slot.getAttribute('data-pic-type');
            const titleInput = slot.querySelector('.image-title-input');
            const title = titleInput ? titleInput.value.trim() : 'ไม่ระบุข้อมูล';

            if (imgUrl && picType) {
                orderPic.push({ pic: imgUrl.split('?')[0], pic_type: picType, pic_title: title, created_by: updated_by });
            }
        });
        carDetailsPayload.order_pic = orderPic;
    
        const endpoint = `https://be-claims-service.onrender.com/api/order-pic/update/${currentOrderId}`;
    
        // Log the payload for debugging
        console.log('Submitting payload for Bike:', JSON.stringify(carDetailsPayload, null, 2));

        try {
          const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
            body: JSON.stringify(carDetailsPayload)
          });
          const result = await response.json();
          if (response.ok) {
            alert('✅ อัปเดตข้อมูลและสถานะเรียบร้อยแล้ว');
            navigateTo('dashboard.html');
          } else {
            throw new Error(result.message || 'การอัปเดตล้มเหลว');
          }
        } catch (error) {
          alert(`❌ เกิดข้อผิดพลาด: ${error.message}`);
          console.error('Fetch error for bike submission:', error);
        }
      });
    }

    

    document.addEventListener('click', async function(e) {
        const editBtn = e.target.closest('.edit-title-btn');
        if (editBtn) {
            e.preventDefault();
            console.log('Save title button clicked.');

            const imageSlot = editBtn.closest('.dynamic-image-slot');
            const titleInput = imageSlot.querySelector('.image-title-input');
            
            if (!imageSlot.hasAttribute('data-uploaded') || imageSlot.getAttribute('data-uploaded') === 'false') {
                alert('ไม่สามารถแก้ไขชื่อรูปภาพที่ยังไม่ได้อัปโหลด');
                console.log('Save title aborted: Image not uploaded yet.');
                return;
            }

            const newTitle = titleInput.value.trim();
            const orderId = getSafeValue('taskId');
            const picUrl = imageSlot.getAttribute('data-pic-url');

            if (!picUrl) {
                alert('ไม่พบ URL ของรูปภาพ ไม่สามารถบันทึกได้');
                console.error('Save title error: picUrl is missing from data attribute.');
                return;
            }

            console.log(`Attempting to save title. OrderID: ${orderId}, PicURL: ${picUrl}, NewTitle: ${newTitle}`);
            
            editBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
            editBtn.disabled = true;

            const success = await updateImageTitle(orderId, picUrl, newTitle);
            if (success) {
                // The title is already set in the input, so we just need to confirm
                console.log('Title updated successfully.');
                populateDamageDetailFromImages(); // Update the main damage detail field
            } else {
                console.error('Failed to update title via API.');
                // Optionally, revert the title if the API call fails
            }

            editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
            editBtn.disabled = false;
        }
    });



    // Delegated event listener for individual image download buttons
    document.addEventListener('click', async function(e) {
      if (e.target && e.target.classList.contains('individual-download-btn')) {
        e.preventDefault();
        const button = e.target;
        const imageUrl = button.dataset.url;
        const imageTitle = button.dataset.title;

        if (!imageUrl) return;

        try {
          button.disabled = true;
          button.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Downloading...';

          const token = localStorage.getItem('authToken') || '';
          const response = await fetch(`https://be-claims-service.onrender.com/api/upload/proxy-download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ imageUrl: imageUrl })
          });

          if (!response.ok) {
            throw new Error(`Failed to download image from proxy: ${response.statusText}`);
          }

          const blob = await response.blob();
          saveAs(blob, `${imageTitle}.jpg`);

        } catch (err) {
          console.error(`Error downloading individual image: ${imageUrl}`, err);
          alert(`🚫 ไม่สามารถดาวน์โหลดรูปภาพได้: ${err.message}`);
        } finally {
          button.disabled = false;
          button.innerHTML = '<i class="bx bx-download"></i> Download';
        }
      }
    });

    // --- Custom Plain JavaScript Modal Logic ---
    const modal = document.getElementById("customImageModal");
    if (modal) {
        const modalImg = document.getElementById("customModalImage");
        const captionText = document.getElementById("customModalCaption");
        const span = document.getElementsByClassName("custom-modal-close")[0];

        document.addEventListener('click', function(e) {
            let imageUrl = null;
            let imageTitle = '';
            let shouldOpenModal = false;

            // Check if the click is on an image that should open the modal
            const clickedImage = e.target.closest('img');
            if (clickedImage) {
                // Case 1: Image in "Image Info" tab (dynamic slot)
                const imageSlot = clickedImage.closest('.dynamic-image-slot');
                if (imageSlot && imageSlot.hasAttribute('data-uploaded') && imageSlot.getAttribute('data-uploaded') === 'true') {
                    imageUrl = clickedImage.src;
                    const titleInput = imageSlot.querySelector('.image-title-input');
                    imageTitle = titleInput ? titleInput.value : '';
                    shouldOpenModal = true;
                }

                // Case 2: Image in "Download Image" tab
                const downloadCard = clickedImage.closest('.card');
                if (downloadCard && downloadCard.closest('#download-images-container')) {
                    imageUrl = clickedImage.src;
                    const cardBody = downloadCard.querySelector('.card-body');
                    imageTitle = cardBody ? cardBody.querySelector('p.card-text').textContent : '';
                    shouldOpenModal = true;
                }
            }

            if (shouldOpenModal) {
                e.preventDefault();
                modal.style.display = "block";
                modalImg.src = imageUrl;
                captionText.innerHTML = imageTitle;
            }
        });

        if (span) {
            span.onclick = function() {
                modal.style.display = "none";
            }
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
    // --- End of Custom Modal Logic ---

      }
  // เพิ่มบรรทัดนี้เพื่อปิด DOMContentLoaded listener ที่ขาดไป
  });