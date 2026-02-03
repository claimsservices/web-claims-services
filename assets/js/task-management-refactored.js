
fetch('/version.json')
  .then(res => res.json())
  .then(data => {
    document.getElementById("appVersion").textContent = `App Version ${data.version}`;
  })
  .catch(() => {
    document.getElementById("appVersion").textContent = "App Version -";
  });

const LOGIN_PAGE = '../index.html';
const API_BASE_URL = 'https://be-claims-service.onrender.com';
const API_URL = `${API_BASE_URL}/api/auth/profile`;

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

const filesToUpload = new Map();

function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

function isTokenExpired(decodedToken) {
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken && decodedToken.exp && decodedToken.exp < currentTime;
}

function getSafeValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : null;
}

async function loadUserProfile() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = LOGIN_PAGE;
    return;
  }

  const decoded = decodeJWT(token);
  if (!decoded || isTokenExpired(decoded)) {
    localStorage.removeItem('authToken');
    window.location.href = LOGIN_PAGE;
    return;
  }

  const { username, first_name, last_name, role, insur_comp, myPicture } = decoded;

  document.getElementById('user-info').innerText = first_name + ' ' + last_name;
  document.getElementById('ownerName').value = first_name + ' ' + last_name;
  document.getElementById('user-role').innerText = role;

  if (role === 'Insurance') {
    const insuranceCompanySelect = document.getElementById('insuranceCompany');
    if (insuranceCompanySelect && insur_comp) {
      insuranceCompanySelect.value = insur_comp;
      insuranceCompanySelect.disabled = true;
    }
    ['tab-li-profile', 'tab-li-contact', 'tab-li-note', 'tab-li-history', 'tab-li-upload'].forEach(tabId => {
      const tab = document.getElementById(tabId);
      if (tab) tab.style.display = 'none';
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('order_id')) {
      const orderStatusSelect = document.getElementById('orderStatus');
      if (orderStatusSelect) {
        orderStatusSelect.value = 'เปิดงาน';
        orderStatusSelect.disabled = true;
      }
    }
  }

  const imgElement = document.getElementById('userAvatar');
  if (myPicture && imgElement) imgElement.src = myPicture;

  if (['Operation Manager', 'Director', 'Developer'].includes(role)) {
    const adminMenu = document.getElementById('admin-menu');
    if (adminMenu) adminMenu.style.display = 'block';
  } else if (role === 'Sales Manager') {
    window.location.href = 'dashboard.html';
    return;
  } else if (role === 'Officer') {
    localStorage.removeItem('authToken');
    window.location.href = LOGIN_PAGE;
    return;
  }

  try {
    const response = await fetch(API_URL, {
      headers: { 'Authorization': `${token}` }
    });
    if (!response.ok) {
      localStorage.removeItem('authToken');
      window.location.href = LOGIN_PAGE;
    }
  } catch (e) {
    console.error(e);
    localStorage.removeItem('authToken');
    window.location.href = LOGIN_PAGE;
  }
}

async function loadAssignees(order, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user-management/assigners`, {
      method: 'GET',
      headers: { 'authorization': token }
    });
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    const select = document.getElementById('responsiblePerson');
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

function handleFileSelect(event) {
  const input = event.target;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const uniqueId = input.id;
    const img = document.getElementById(`img-${uniqueId}`);
    const placeholder = document.getElementById(`placeholder-${uniqueId}`);
    const slot = input.closest('.dynamic-image-slot');

    const reader = new FileReader();
    reader.onload = function (e) {
      if (img) {
        img.src = e.target.result;
        img.style.display = 'block';
      }
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      if (slot) {
        slot.setAttribute('data-uploaded', 'staged');
        const picType = input.name;
        const category = input.dataset.category;
        filesToUpload.set(uniqueId, { file: file, picType: picType, category: category });

        const container = slot.querySelector('.image-container');
        if (container) {
          container.style.border = 'none';
          container.style.backgroundColor = 'transparent';
        }
      }
    };
    reader.readAsDataURL(file);
  }
}

function createAddImageButtons() {
  const sectionsMap = {
    'around': document.getElementById('around-images-section'),
    'accessories': document.getElementById('accessories-images-section'),
    'inspection': document.getElementById('inspection-images-section'),
    'fiber': document.getElementById('fiber-documents-section'),
    'documents': document.getElementById('other-documents-section'),
    'signature': document.getElementById('signature-documents-section')
  };

  for (const category in sectionsMap) {
    const targetSection = sectionsMap[category];
    if (targetSection) {
      if (targetSection.querySelector('.add-image-btn-container')) continue;
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'text-center mt-3 add-image-btn-container';
      buttonContainer.innerHTML = `
                <button type="button" class="btn btn-outline-primary add-image-btn" data-category="${category}">
                    <i class="bi bi-plus-circle"></i> เพิ่มรูปภาพ
                </button>
            `;
      targetSection.appendChild(buttonContainer);
    }
  }
}

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
                </div>
                <input type="file" id="${uniqueId}" name="${uniqueId}" data-category="${category}" hidden accept="image/*" capture="environment">
            </div>
        `;
  return newSlotHtml;
}


function createEmptyImageSlot(category, configItem) {
  const sectionsMap = {
    'around': document.getElementById('around-images-section')?.querySelector('.row'),
    'accessories': document.getElementById('accessories-images-section')?.querySelector('.row'),
    'inspection': document.getElementById('inspection-images-section')?.querySelector('.row'),
    'fiber': document.getElementById('fiber-documents-section')?.querySelector('.row'),
    'documents': document.getElementById('other-documents-section')?.querySelector('.row'),
    'signature': document.getElementById('signature-documents-section')?.querySelector('.row')
  };

  const targetSection = sectionsMap[category];
  if (!targetSection) return;

  const uniqueId = `new-image-${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const displayTitle = configItem.defaultTitle || 'กรุณาใส่ชื่อ';
  const picType = configItem.name || 'unknown';

  const newSlotHtml = `
        <div class="col-4 mb-3 dynamic-image-slot" data-pic-type="${picType}" data-pic-url="" data-uploaded="false">
            <div class="image-container" style="position:relative; border-radius:8px; overflow: hidden; height: 200px; margin-bottom: 8px; cursor: pointer; background-color: #f8f9fa; border: 2px dashed #dee2e6; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <img src="" style="width:100%; height:100%; object-fit: cover; display:none;" id="img-${uniqueId}" alt="${displayTitle}">
                <div class="placeholder-content text-center" id="placeholder-${uniqueId}">
                    <i class="bi bi-camera" style="font-size: 3rem; color: #adb5bd;"></i>
                    <p class="text-muted mt-2 mb-0 small">คลิกเพื่ออัปโหลด</p>
                </div>
                <button type="button" class="delete-btn" title="ลบ" style="position: absolute; top: 6px; right: 6px; background: transparent; border: none; color: #dc3545; font-size: 24px; line-height: 1; cursor: pointer; z-index: 10;"><i class="bi bi-x-circle-fill"></i></button>
                <label for="${uniqueId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 5;"></label>
            </div>
            <div class="d-flex align-items-center">
                <input type="text" class="form-control image-title-input" value="${displayTitle}" placeholder="กรุณาใส่ชื่อ" style="flex-grow: 1;">
            </div>
            <input type="file" id="${uniqueId}" name="${picType}" data-category="${category}" hidden accept="image/*" capture="environment">
        </div>
    `;

  targetSection.insertAdjacentHTML('beforeend', newSlotHtml);

  const newFileInput = document.getElementById(uniqueId);
  if (newFileInput) {
    newFileInput.addEventListener('change', handleFileSelect);
  }

  const addedSlot = targetSection.lastElementChild;
  const deleteBtn = addedSlot.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (newFileInput && filesToUpload.has(newFileInput.id)) {
        filesToUpload.delete(newFileInput.id);
      }
      addedSlot.remove();
    });
  }
}

function initializeTemplateButtons() {
  const buttons = document.querySelectorAll('.create-template-btn');
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const category = button.getAttribute('data-category');
      if (staticImageConfig[category]) {
        staticImageConfig[category].forEach(configItem => {
          createEmptyImageSlot(category, configItem);
        });
      }
    });
  });
}

function renderUploadedImages(orderPics) {
  if (!orderPics || orderPics.length === 0) return;
  document.querySelectorAll('.dynamic-image-slot[data-server-rendered="true"]').forEach(slot => slot.remove());

  const sectionsMap = {
    'around': document.getElementById('around-images-section')?.querySelector('.row'),
    'accessories': document.getElementById('accessories-images-section')?.querySelector('.row'),
    'inspection': document.getElementById('inspection-images-section')?.querySelector('.row'),
    'fiber': document.getElementById('fiber-documents-section')?.querySelector('.row'),
    'documents': document.getElementById('other-documents-section')?.querySelector('.row'),
    'signature': document.getElementById('signature-documents-section')?.querySelector('.row')
  };

  orderPics.forEach((pic, index) => {
    if (!pic.pic_type || !pic.pic) return;

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

    if (!mainCategory) return;
    const targetSection = sectionsMap[mainCategory];
    if (!targetSection) return;

    const uniqueId = `uploaded-image-${mainCategory}-${Date.now()}-${index}`;
    const defaultTitleConfig = staticImageConfig[mainCategory]?.find(item => item.name === pic.pic_type)?.defaultTitle;
    const displayTitle = pic.pic_title || defaultTitleConfig || 'กรุณาใส่ชื่อ';

    const newSlotHtml = `
            <div class="col-4 mb-3 dynamic-image-slot" data-pic-type="${pic.pic_type}" data-pic-url="${pic.pic}" data-uploaded="true" data-server-rendered="true">
                <div class="image-container" style="position:relative; border-radius:8px; overflow: hidden; height: 200px; margin-bottom: 8px; cursor: pointer;">
                    <img src="${pic.pic}" style="width:100%; height:100%; object-fit: cover; display:block;" alt="${displayTitle}">
                </div>
                <div class="d-flex align-items-center">
                    <input type="text" class="form-control image-title-input" value="${displayTitle}" placeholder="กรุณาใส่ชื่อ" style="flex-grow: 1; margin-right: 8px;">
                </div>
                <input type="file" id="${uniqueId}" name="${pic.pic_type}" data-category="${mainCategory}" hidden accept="image/*" capture="environment">
            </div>
        `;
    targetSection.insertAdjacentHTML('beforeend', newSlotHtml);
  });
}

function renderDownloadableImages(orderPics) {
  const container = document.getElementById('download-images-container');
  if (!container) return;
  container.innerHTML = '';

  if (!orderPics || orderPics.length === 0) {
    container.innerHTML = '<p class="text-muted">ไม่มีรูปภาพในรายการนี้</p>';
    return;
  }

  const subCategoryToMainCategoryMap = {};
  for (const mainCategory in staticImageConfig) {
    staticImageConfig[mainCategory].forEach(item => {
      subCategoryToMainCategoryMap[item.name] = mainCategory;
    });
  }

  const groupedImages = orderPics.reduce((acc, pic) => {
    let mainCategory = staticImageConfig.hasOwnProperty(pic.pic_type)
      ? pic.pic_type
      : subCategoryToMainCategoryMap[pic.pic_type];
    if (!mainCategory) mainCategory = 'uncategorized';
    if (!acc[mainCategory]) acc[mainCategory] = [];
    acc[mainCategory].push(pic);
    return acc;
  }, {});

  const categoryOrder = ['around', 'accessories', 'inspection', 'fiber', 'documents', 'signature'];

  categoryOrder.forEach(mainCategory => {
    if (groupedImages[mainCategory]) {
      container.insertAdjacentHTML('beforeend', `<div class="col-12 mt-4"><h5 class="text-primary border-bottom pb-2 mb-3">${mainCategory}</h5></div>`);
      groupedImages[mainCategory].forEach(pic => {
        const cardHtml = `
            <div class="col-md-3 col-sm-6 mb-4">
              <div class="card h-100">
                <a href="${pic.pic}" target="_blank">
                  <img src="${pic.pic}" class="card-img-top" alt="${pic.pic_title || 'Image'}" style="height: 200px; object-fit: cover;">
                </a>
                <div class="card-body text-center">
                  <p class="card-text">${pic.pic_title || 'No Title'}</p>
                   <a href="${pic.pic}" class="btn btn-sm btn-primary" download><i class="bx bx-download"></i> Download</a>
                </div>
              </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', cardHtml);
      });
    }
  });
}

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
        ctx.drawImage(img, 0, 0);

        const now = new Date();
        const watermarkText = `STSERVICE-${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;
        const fontSize = Math.max(18, Math.min(img.width / 30, img.height / 20));
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText(watermarkText, canvas.width - 10, canvas.height - 10);

        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas conversion failed')), 'image/jpeg', 0.9);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(imageFile);
  });
}

async function uploadStagedImages(orderId, token) {
  if (filesToUpload.size === 0) return { success: true };

  const formData = new FormData();
  formData.append('order_id', orderId);
  formData.append('folder', `transactions/${orderId}`);

  const processingPromises = [];

  filesToUpload.forEach(({ file, picType, category }, inputName) => {
    const fileInput = document.getElementById(inputName);
    const imageSlot = fileInput ? fileInput.closest('.dynamic-image-slot') : null;
    const titleInput = imageSlot ? imageSlot.querySelector('.image-title-input') : null;
    const picTitle = titleInput ? titleInput.value.trim() : 'unknown';

    const promise = imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true })
      .then(compressedFile => addWatermark(compressedFile))
      .then(watermarkedBlob => {
        formData.append('images', watermarkedBlob, file.name);
        formData.append('pic_type', picType);
        formData.append('pic_title', picTitle);
      })
      .catch(err => {
        console.error('Error processing', err);
        throw err;
      });
    processingPromises.push(promise);
  });

  try {
    await Promise.all(processingPromises);
    const response = await fetch(`${API_BASE_URL}/api/upload/image/transactions`, {
      method: 'POST',
      headers: { 'Authorization': token },
      body: formData
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Upload failed');
    filesToUpload.clear();
    return { success: true, result };
  } catch (e) {
    console.error(e);
    return { success: false, message: e.message };
  }
}

async function loadOrderData(orderId) {
  const token = localStorage.getItem('authToken') || '';
  try {
    const response = await fetch(`${API_BASE_URL}/api/order-detail/inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      },
      body: JSON.stringify({ order_id: orderId })
    });
    const result = await response.json();
    if (!response.ok) {
      alert('❌ ไม่พบข้อมูล: ' + result.message);
      return;
    }

    const { order, order_details, order_assign, order_hist, order_pic } = result;

    await loadAssignees(order, token);

    document.getElementById('taskId').value = order.id;
    document.getElementById('jobType').value = order.order_type;
    document.getElementById('orderStatus').value = order.order_status;
    document.getElementById('channel').value = order.channel;
    document.getElementById('processType').value = order.process_type;
    document.getElementById('insuranceCompany').value = order.insur_comp;

    const transactionDateEl = document.getElementById('transactionDate');
    if (transactionDateEl && order.order_date) {
      transactionDateEl.value = order.order_date.slice(0, 19).replace('T', ' ');
    }

    document.getElementById('carRegistration').value = order.car_registration;
    document.getElementById('address').value = order.location;

    if (order.appointment_date) {
      const dt = new Date(order.appointment_date);
      document.getElementById('appointmentDate').value = dt.toISOString().slice(0, 10);
      document.getElementById('appointmentTime').value = dt.toTimeString().slice(0, 5);
    }

    if (order_details) {
      document.getElementById('phone').value = order_details.tell_1;
      document.getElementById('phone2').value = order_details.tell_2;
      document.getElementById('phone3').value = order_details.tell_3;
      document.getElementById('c_insure').value = order_details.c_insure;
      document.getElementById('c_tell').value = order_details.c_tell;

      document.getElementById('carProvince').value = order_details.c_car_province;
      const brandSelect = document.getElementById('carBrand');
      if (brandSelect) {
        brandSelect.value = order_details.c_brand;
        brandSelect.dispatchEvent(new Event('change'));
      }
      document.getElementById('carModel').value = order_details.c_version;

      document.getElementById('carYear').value = order_details.c_year;
      document.getElementById('carChassis').value = order_details.c_number;
      document.getElementById('carEngine').value = order_details.c_engine;
      document.getElementById('c_mile').value = order_details.c_mile;
      document.getElementById('carType').value = order_details.c_type;
      document.getElementById('carColor').value = order_details.c_coller;
      document.getElementById('received-doc').checked = order_details.c_recieve;
      document.getElementById('insuranceBranch').value = order_details.s_branch;
      document.getElementById('reference1').value = order_details.s_ref;
      document.getElementById('reference2').value = order_details.s_ref_2;
      document.getElementById('policyNumber').value = order_details.s_number;

      const startInput = document.getElementById('coverageStartDate');
      const endInput = document.getElementById('coverageEndDate');
      if (startInput && order_details?.s_start) startInput.value = order_details.s_start.slice(0, 10);
      if (endInput && order_details?.s_end) endInput.value = order_details.s_end.slice(0, 10);
      document.getElementById('insuranceType').value = order_details.s_type;
      document.getElementById('s_remark').value = order_details.s_remark;
      document.getElementById('s_ins_remark').value = order_details.s_ins_remark;
      document.getElementById('s_detail').value = order_details.s_detail;
      document.getElementById('fleetCar').checked = order_details.s_fleet;
      document.getElementById('creatorName').value = order_details.c_name;
    }

    if (order_assign.length > 0) {
      document.getElementById('contactedCustomer').checked = order_assign[0].is_contact;
    }

    const timelineEl = document.getElementById('historyTimeline');
    if (timelineEl) {
      timelineEl.innerHTML = '';
      if (order_hist && order_hist.length > 0) {
        order_hist.forEach(hist => {
          const date = new Date(hist.created_date);
          const formattedDate = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) + ' - ' + date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
          timelineEl.insertAdjacentHTML('beforeend', `
                <li class="timeline-item">
                <span class="timeline-icon bg-secondary">${hist.icon || '🕓'}</span>
                <div class="timeline-content">
                <h6 class="timeline-title">${hist.task}</h6>
                <p class="timeline-description">${hist.detail}</p>
                 <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">${formattedDate}</small>
                    <small class="text-muted fw-bold"><i class="bx bx-user"></i> ${hist.created_by || 'ไม่ระบุ'}</small>
                  </div>
                </div></li>
            `);
        });

        const latestDetailMock = order_hist.filter(h => h.task === 'รายละเอียดเพิ่มเติม').pop();
        if (latestDetailMock) {
          const addDetails = document.getElementById('additionalDetails');
          if (addDetails) addDetails.value = latestDetailMock.detail;
        }

        const notes = order_hist.filter(h => h.task === 'บันทึกข้อความ' || h.icon === '💬');
        if (notes.length > 0) {
          const latestNote = notes[notes.length - 1];
          const noteInput = document.getElementById('note-text');
          if (noteInput) noteInput.value = latestNote.detail;
        }
      } else {
        timelineEl.innerHTML = `<li class="timeline-item"><div class="timeline-content"><p class="timeline-description text-muted">ไม่มีประวัติการอัปเดต</p></div></li>`;
      }
    }

    if (order_pic && order_pic.length > 0) {
      renderUploadedImages(order_pic);
      renderDownloadableImages(order_pic);
    }

  } catch (err) {
    alert('❌ ไม่สามารถโหลดข้อมูลได้');
    console.error('Inquiry Error:', err);
  }
}

// MAIN EVENT LISTENER
document.addEventListener('DOMContentLoaded', async function () {
  loadUserProfile();

  const now = new Date();
  const formatted = now.toISOString().slice(0, 19).replace('T', ' ');
  const transactionDateEl = document.getElementById('transactionDate');
  if (transactionDateEl) transactionDateEl.value = formatted;

  const openMapBtn = document.getElementById('openMap');
  if (openMapBtn) {
    openMapBtn.addEventListener('click', function () {
      const address = document.getElementById('address').value.trim();
      if (!address) { alert('กรุณากรอกที่อยู่ก่อนเปิดแผนที่'); return; }
      const query = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    });
  }
  const downloadCsvTemplateBtn = document.getElementById('downloadCsvTemplateBtn');
  if (downloadCsvTemplateBtn) {
    downloadCsvTemplateBtn.addEventListener('click', () => {
      alert('CSV Template download not implemented in this refactor (check source)');
    });
  }

  // Download All logic
  const handleZipDownload = async () => {
    const zip = new JSZip();
    // Use taskId (from hidden input) or fallback to 'images'
    const orderIdVal = document.getElementById('taskId')?.value?.trim() || 'images';

    const selector = '.dynamic-image-slot img, .image-gallery img, #download-images-container .card-img-top';
    const imageElements = Array.from(document.querySelectorAll(selector)).filter(img => {
      const style = getComputedStyle(img);
      return (img.src && (img.src.startsWith('http') || img.src.startsWith('data:')) && style.display !== 'none' && img.complete);
    });

    if (imageElements.length === 0) { alert('ไม่มีภาพให้ดาวน์โหลด'); return; }

    const uniqueImages = new Map();
    imageElements.forEach((img, i) => { if (!uniqueImages.has(img.src)) uniqueImages.set(img.src, { img, index: i }); });

    const promises = [];
    let index = 1;
    for (const [src, item] of uniqueImages) {
      const img = item.img;
      // Title logic ...
      let title = img.closest('.dynamic-image-slot')?.querySelector('.image-title-input')?.value?.trim() || `image-${index}`;
      const safeName = title.replace(/[\[\\\]^$.|?*+()\/]/g, '').replace(/\s+/g, '_');
      const promise = (async () => {
        try {
          const response = await fetch(`https://be-claims-service.onrender.com/api/upload/proxy-download`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('authToken') || '' },
            body: JSON.stringify({ imageUrl: src })
          });
          if (!response.ok) {
            const directResp = await fetch(src);
            if (directResp.ok) {
              const blob = await directResp.blob();
              zip.file(`${safeName}.jpg`, blob);
              return;
            }
            throw new Error('Proxy failed');
          }
          const blob = await response.blob();
          zip.file(`${safeName}.jpg`, blob);
        } catch (e) { console.warn('Download failed', e); }
      })();
      promises.push(promise);
      index++;
    }
    await Promise.all(promises);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, orderIdVal + '.zip');
  };

  const downloadAllBtn = document.getElementById('downloadAllBtn');
  if (downloadAllBtn) downloadAllBtn.addEventListener('click', handleZipDownload);

  const form = document.getElementById('taskForm');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const getValueById = (id) => document.getElementById(id)?.value || '';

      const token = localStorage.getItem('authToken') || '';
      const created_by = getValueById('ownerName');
      const date = getValueById('appointmentDate');
      const time = getValueById('appointmentTime');
      let appointment_date = date ? (time ? new Date(`${date}T${time}`).toISOString() : new Date(date).toISOString()) : null;

      const order_hist = [{ icon: "📝", task: "สร้างรายการ", detail: "สร้างโดยผู้ใช้: " + created_by, created_by }];
      const additionalDetails = getValueById('additionalDetails');
      if (additionalDetails) order_hist.push({ icon: "📝", task: "รายละเอียดเพิ่มเติม", detail: additionalDetails, created_by });
      const noteText = getValueById('note-text');
      if (noteText) order_hist.push({ icon: "💬", task: "บันทึกข้อความ", detail: noteText, created_by });

      // Simplified data construction
      const data = {
        creator: created_by, order_type: getValueById('jobType'), order_status: getValueById('orderStatus'),
        channel: getValueById('channel'), process_type: getValueById('processType'), insur_comp: getValueById('insuranceCompany'),
        order_date: getValueById('transactionDate'), appointment_date, car_registration: getValueById('carRegistration'),
        location: getValueById('address'), created_by,
        tell_1: getValueById('phone'), tell_2: getValueById('phone2'), tell_3: getValueById('phone3'),
        c_insure: getValueById('c_insure'), c_tell: getValueById('c_tell'), c_licent: getValueById('carRegistration'),
        c_car_province: getValueById('carProvince'),
        c_brand: getValueById('carBrand') === 'other' ? getValueById('carBrandCustom') : getValueById('carBrand'),
        c_version: (getValueById('carBrand') === 'other' || getValueById('carModel') === 'other') ? getValueById('carModelCustom') : getValueById('carModel'),
        c_year: getValueById('carYear'), c_number: getValueById('carChassis'), c_engine: getValueById('carEngine'),
        c_mile: getValueById('c_mile'), c_type: getValueById('carType'), c_coller: getValueById('carColor'),
        c_recieve: document.getElementById('received-doc')?.checked || false, s_insure: getValueById('insuranceCompany'),
        s_branch: getValueById('insuranceBranch'), s_ref: getValueById('reference1'), s_ref_2: getValueById('reference2'),
        s_number: getValueById('policyNumber'),
        s_type: getValueById('insuranceType'), s_remark: getValueById('s_remark'), s_ins_remark: getValueById('s_ins_remark'),
        s_detail: getValueById('s_detail'), s_fleet: document.getElementById('fleetCar')?.checked || false, updated_by: created_by,
        c_name: getValueById('creatorName'), owner: getValueById('responsiblePerson'),
        order_hist
      };
      const s_start = getValueById('coverageStartDate');
      if (s_start) data.s_start = s_start;
      const s_end = getValueById('coverageEndDate');
      if (s_end) data.s_end = s_end;

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': token },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
          const newOrderId = result.order?.id;
          if (newOrderId && filesToUpload.size > 0) {
            const submitBtn = document.getElementById('submittaskBtn');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'กำลังอัปโหลด...'; }
            await uploadStagedImages(newOrderId, token);
          }
          alert('✅ สร้างรายการเรียบร้อยแล้ว');
          form.reset();
          window.location.href = 'dashboard.html';
        } else {
          alert('❌ เกิดข้อผิดพลาด: ' + result.message);
        }
      } catch (e) {
        alert('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
      }
    });
  }

  const saveBtn = document.getElementById('submittaskBtn');
  if (saveBtn) saveBtn.innerText = 'บันทึกข้อมูล';

  const brandSelect = document.getElementById('carBrand');
  const modelSelect = document.getElementById('carModel');
  if (brandSelect && modelSelect) {
    const populateModels = () => {
      if (typeof carModels === 'undefined') return;
      const selectedBrand = brandSelect.value;
      const customBrandInput = document.getElementById('carBrandCustom');
      const customModelInput = document.getElementById('carModelCustom');
      if (selectedBrand === 'other') {
        modelSelect.style.display = 'none';
        if (customBrandInput) customBrandInput.classList.remove('d-none');
        if (customModelInput) customModelInput.classList.remove('d-none');
        return;
      }
      modelSelect.style.display = 'block';
      if (customBrandInput) customBrandInput.classList.add('d-none');
      if (customModelInput) customModelInput.classList.add('d-none');

      const models = carModels[selectedBrand] || [];
      modelSelect.innerHTML = '<option value="" selected disabled>เลือกรุ่น</option>';
      models.forEach(m => modelSelect.add(new Option(m, m)));
      modelSelect.add(new Option('อื่นๆ', 'other'));
      modelSelect.disabled = false;
    };
    brandSelect.addEventListener('change', populateModels);
    modelSelect.addEventListener('change', () => {
      const customModelInput = document.getElementById('carModelCustom');
      if (modelSelect.value === 'other') customModelInput?.classList.remove('d-none');
      else customModelInput?.classList.add('d-none');
    });
  }

  // Delegation for dynamic buttons
  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('add-image-btn')) {
      const category = e.target.dataset.category;
      const newSlotHtml = renderNewImageUploadSlot(category);
      e.target.parentElement.insertAdjacentHTML('beforebegin', newSlotHtml);
      // Add event listeners for new slot
      const slotDiv = e.target.parentElement.previousElementSibling; // The new slot
      if (slotDiv) {
        const fileInput = slotDiv.querySelector('input[type="file"]');
        if (fileInput) fileInput.addEventListener('change', handleFileSelect);
        const deleteBtn = slotDiv.querySelector('.delete-btn');
        if (deleteBtn) deleteBtn.addEventListener('click', () => {
          if (fileInput && filesToUpload.has(fileInput.id)) filesToUpload.delete(fileInput.id);
          slotDiv.remove();
        });
      }
    }
  });

  createAddImageButtons();
  initializeTemplateButtons();

  // Entry Point
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id') || urlParams.get('id');
  if (orderId) {
    await loadOrderData(orderId);
  } else {
    const jobTypeEl = document.getElementById('jobType');
    if (jobTypeEl) jobTypeEl.disabled = false;
  }

  ['logout', 'logout-menu'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', (e) => {
      e.preventDefault(); localStorage.removeItem('authToken'); window.location.href = LOGIN_PAGE;
    });
  });
});