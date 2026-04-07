import { getQueryParam, navigateTo } from './navigation.js';


export const staticImageConfig = {
    around: [
        { name: "exterior_front", defaultTitle: "01. ภาพถ่ายรอบคัน - ด้านหน้ารถ" },
        { name: "exterior_left_front", defaultTitle: "02. ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหน้า" },
        { name: "exterior_left_center", defaultTitle: "03. ภาพถ่ายรอบคัน - ด้านซ้ายตรง" },
        { name: "exterior_left_rear", defaultTitle: "04. ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหลัง" },
        { name: "exterior_rear", defaultTitle: "05. ภาพถ่ายรอบคัน - ด้านท้ายรถ" },
        { name: "exterior_right_rear", defaultTitle: "06. ภาพถ่ายรอบคัน - ด้านขวาส่วนหลัง" },
        { name: "exterior_right_center", defaultTitle: "07. ภาพถ่ายรอบคัน - ด้านขวาตรง" },
        { name: "exterior_right_front", defaultTitle: "08. ภาพถ่ายรอบคัน - ด้านขวาส่วนหน้า" },
        { name: "exterior_roof", defaultTitle: "09. ภาพถ่ายรอบคัน - หลังคา" }
    ],
    accessories: [
        { name: "interior_6", defaultTitle: "10. ห้องเครื่อง" },
        { name: "interior_8", defaultTitle: "11. คอลโซล" },
        { name: "interior_7", defaultTitle: "12. จอไมล์" },
        { name: "interior_9", defaultTitle: "13. วิทยุ" },
        { name: "interior_5", defaultTitle: "14. กล้องหน้ารถ" },
        { name: "interior_11", defaultTitle: "15. ฟิล์ม" },
        { name: "interior_spare_tire", defaultTitle: "16. ยางอะไหล่" },
        { name: "interior_wheels_2", defaultTitle: "17. ล้อหน้าด้านขวา" },
        { name: "interior_wheels_1", defaultTitle: "18. ล้อหน้าด้านซ้าย" },
        { name: "interior_wheels_4", defaultTitle: "19. ล้อหลังด้านขวา" },
        { name: "interior_wheels_3", defaultTitle: "20. ล้อหลังด้านซ้าย" }
    ],
    inspection: [
        { name: "damage_images_1", defaultTitle: "30. รายละเอียดความเสียหาย 1." },
        { name: "damage_images_2", defaultTitle: "31. รายละเอียดความเสียหาย 2." },
        { name: "damage_images_3", defaultTitle: "32. รายละเอียดความเสียหาย 3." },
        { name: "damage_images_4", defaultTitle: "33. รายละเอียดความเสียหาย 4." },
        { name: "damage_images_5", defaultTitle: "34. รายละเอียดความเสียหาย 5." },
        { name: "damage_images_6", defaultTitle: "35. รายละเอียดความเสียหาย 6." },
        { name: "damage_images_7", defaultTitle: "36. รายละเอียดความเสียหาย 7." },
        { name: "damage_images_8", defaultTitle: "37. รายละเอียดความเสียหาย 8." },
        { name: "damage_images_9", defaultTitle: "38. รายละเอียดความเสียหาย 9." },
        { name: "damage_images_10", defaultTitle: "39. รายละเอียดความเสียหาย 10." }
    ],
    fiber: [
        { name: "doc_identity", defaultTitle: "40. เอกสารยืนยันตัวบุคคล" },
        { name: "doc_other_1", defaultTitle: "41. เอกสารยืนยันตัวรถ" },
        { name: "doc_other_2", defaultTitle: "42. เลขตัวถังและทะเบียนรถ" },
        { name: "doc_other_3", defaultTitle: "43. เอกสารอื่น ๆ" },
        { name: "doc_other_4", defaultTitle: "44. เอกสารอื่น ๆ" },
        { name: "doc_other_5", defaultTitle: "45. เอกสารอื่น ๆ" },
        { name: "doc_other_6", defaultTitle: "46. เอกสารอื่น ๆ" },
        { name: "doc_other_7", defaultTitle: "47. เอกสารอื่น ๆ" },
        { name: "doc_other_8", defaultTitle: "48. เอกสารอื่น ๆ" }
    ],
    documents: [
        { name: "license", defaultTitle: "49. เอกสารอื่น ๆ" },
        { name: "id_card", defaultTitle: "50. เอกสารอื่น ๆ" },
        { name: "car_doc", defaultTitle: "51. เอกสารอื่น ๆ" },
        { name: "car_number", defaultTitle: "52. เอกสารอื่น ๆ" },
        { name: "other_1", defaultTitle: "53. เอกสารอื่น ๆ" },
        { name: "other_2", defaultTitle: "54. เอกสารอื่น ๆ" },
        { name: "doc_other_9", defaultTitle: "55. เอกสารอื่น ๆ" },
        { name: "other_3", defaultTitle: "56. เอกสารอื่น ๆ" }
    ],
    signature: [
        { name: "doc_other_9", defaultTitle: "57. ลายเซ็น" }
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

function getCaptureAttr() {
    const token = localStorage.getItem('authToken');
    if (!token) return '';
    const decoded = parseJwt(token);
    if (!decoded) return '';
    return (decoded.role === 'Bike' || decoded.role === 'Insurance') ? 'capture="environment"' : '';
}

function getUserRole() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const decoded = parseJwt(token);
    return decoded ? decoded.role : null;
}

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    let rawDate = dateStr;
    if (typeof dateStr === 'string') {
        if (rawDate.includes(' ')) rawDate = rawDate.replace(' ', 'T');
        const hasTimeZone = rawDate.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(rawDate);
        if (!hasTimeZone) rawDate += 'Z';
    }

    // Explicitly parse string to Date to handle various formats if needed, but new Date() usually works with ISO
    const date = new Date(rawDate);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Bangkok'
    });
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

function showTabs(tabIds) {
    tabIds.forEach(id => {
        const tabElement = document.getElementById(id);
        if (tabElement) {
            tabElement.style.display = 'block';
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
    .then(data => { if (document.getElementById("appVersion")) document.getElementById("appVersion").textContent = `App Version ${data.version}`; })
    .catch(() => { if (document.getElementById("appVersion")) document.getElementById("appVersion").textContent = "App Version -"; });

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

                // Prepare the watermark text in Thailand time (Asia/Bangkok)
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('en-GB', {
                    timeZone: 'Asia/Bangkok',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                const parts = formatter.formatToParts(now);
                const getPart = (type) => parts.find(p => p.type === type).value;
                const watermarkText = `STSERVICE-${getPart('day')}-${getPart('month')}-${getPart('year')} ${getPart('hour')}:${getPart('minute')}`;

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

    // Clear existing dynamic images to prevent duplication on reload
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

        const uniqueId = `uploaded-image-${mainCategory}-${Date.now()}`;
        const defaultTitleConfig = staticImageConfig[mainCategory]?.find(item => item.name === pic.pic_type)?.defaultTitle;
        const displayTitle = pic.pic_title || defaultTitleConfig || 'กรุณาใส่ชื่อ';
        const newSlotHtml = `
            <div class="col-4 mb-3 dynamic-image-slot" data-pic-type="${pic.pic_type}" data-pic-url="${pic.pic}" data-uploaded="true" data-server-rendered="true" data-category="${mainCategory}">
                <div class="image-container" style="position:relative; border-radius:8px; overflow: hidden; height: 200px; margin-bottom: 8px; cursor: pointer;">
                    <img src="${pic.pic}" style="width:100%; height:100%; object-fit: cover; display:block;" alt="${displayTitle}" data-created-date="${pic.created_date || new Date().toISOString()}">
                    <button type="button" class="delete-btn" title="ลบภาพ" style="position: absolute; top: 6px; right: 6px; background: transparent; border: none; color: rgb(252, 7, 7); font-size: 24px; line-height: 1; cursor: pointer; z-index: 10; display: block;"><i class="bi bi-x-circle-fill"></i></button>
                    <button type="button" class="upload-btn" title="เปลี่ยนรูป" style="position: absolute; bottom: 6px; left: 6px; background-color: rgba(0, 0, 0, 0.5); border: none; color: white; font-size: 18px; line-height: 1; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 32px; height: 32px;"><i class="bi bi-camera"></i></button>
                </div>
                <div class="d-flex align-items-center">
                    <input type="text" class="form-control image-title-input" value="${displayTitle}" placeholder="กรุณาใส่ชื่อ" style="flex-grow: 1; margin-right: 8px;">
                    <button type="button" class="btn btn-sm btn-outline-primary edit-title-btn" title="บันทึกชื่อ"><i class="bi bi-pencil"></i></button>
                </div>
                <input type="file" id="${uniqueId}" name="${pic.pic_type}" data-category="${mainCategory}" hidden accept="image/*" ${getCaptureAttr()}>
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
    });
    console.log('[renderUploadedImages] Finished processing all pictures.');
}

async function loadOrderData(orderId) {
    const token = localStorage.getItem('authToken') || '';
    try {
        const response = await fetch(`https://be-claims-service.onrender.com/api/order-detail/inquiry`, {
            method: 'POST',
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
        console.log('DEBUG: order_date:', order.order_date, 'created_date:', order.created_date);
        setValue('transactionDate', formatDateTime(order.created_date));
        setValue('carRegistration', order.car_registration);
        setValue('address', order.location);

        // Set travel expense - Prioritize order_assign (saved value) over calculated service_fee
        // Fix Task 10: Ensure saved data is displayed
        let travelExpenseValue = '';
        if (order_assign && order_assign.length > 0 && order_assign[0].travel_expense !== null && order_assign[0].travel_expense !== undefined) {
            travelExpenseValue = order_assign[0].travel_expense;
        } else {
            travelExpenseValue = order.service_fee || '';
        }
        setValue('travelExpense', travelExpenseValue);

        if (order.appointment_date) {
            const dt = new Date(order.appointment_date);
            const year = dt.getFullYear();
            const month = String(dt.getMonth() + 1).padStart(2, '0');
            const day = String(dt.getDate()).padStart(2, '0');
            const hours = String(dt.getHours()).padStart(2, '0');
            const minutes = String(dt.getMinutes()).padStart(2, '0');
            setValue('appointmentDate', `${year}-${month}-${day}`);
            setValue('appointmentTime', `${hours}:${minutes}`);
        }

        if (order_details) {
            // Define locally to avoid TDZ issues if global declaration is later
            const brandSelect = document.getElementById('carBrand');
            const modelSelect = document.getElementById('carModel');

            setValue('phone', order_details.tell_1);
            setValue('phone2', order_details.tell_2);
            setValue('phone3', order_details.tell_3);
            setValue('c_insure', order_details.c_insure);
            setValue('c_tell', order_details.c_tell);
            setValue('carProvince', order_details.c_car_province);
            if (brandSelect && order_details.c_brand) {
                // Check if brand exists in carModels keys
                if (typeof carModels !== 'undefined') {
                    if (carModels.hasOwnProperty(order_details.c_brand)) {
                        brandSelect.value = order_details.c_brand;
                    } else {
                        brandSelect.value = 'other';
                        const customBrandInput = document.getElementById('carBrandCustom');
                        if (customBrandInput) {
                            customBrandInput.classList.remove('d-none');
                            customBrandInput.value = order_details.c_brand;
                        }
                    }
                } else {
                    // Fallback
                    brandSelect.value = order_details.c_brand;
                }
            }

            // Populate models based on selected brand
            if (brandSelect && modelSelect) {
                populateModels(brandSelect, modelSelect);

                if (order_details.c_version) {
                    const customModelInput = document.getElementById('carModelCustom');

                    if (brandSelect.value === 'other') {
                        if (customModelInput) {
                            customModelInput.classList.remove('d-none');
                            customModelInput.value = order_details.c_version;
                        }
                    } else {
                        // Brand is standard, check if model is in the list
                        let modelExists = Array.from(modelSelect.options).some(o => o.value === order_details.c_version);
                        if (modelExists) {
                            modelSelect.value = order_details.c_version;
                        } else {
                            modelSelect.value = 'other';
                            if (customModelInput) {
                                customModelInput.classList.remove('d-none');
                                customModelInput.value = order_details.c_version;
                            }
                        }
                    }
                }
            }

            // setValue('carModel', order_details.c_version); // Removed direct set, handled above
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
  class="timeline-title">${hist.task}</h6><p class="timeline-description">${hist.detail}</p>
  <div class="d-flex justify-content-between align-items-center">
    <small class="text-muted">${formattedDate}</small>
    <small class="text-muted fw-bold"><i class="bx bx-user"></i> ${hist.created_by || 'ไม่ระบุ'}</small>
  </div>
  </div>`;
                    timelineEl.appendChild(li);
                    timelineEl.appendChild(li);
                });

                // Fix Task 2: Populate 'additionalDetails' from history
                const latestDetailMock = order_hist.filter(h => h.task === 'รายละเอียดเพิ่มเติม').pop();
                if (latestDetailMock) {
                    setValue('additionalDetails', latestDetailMock.detail);
                }

                // Get latest note to populate note-text
                try {
                    const notes = order_hist.filter(h => h.task === 'บันทึกข้อความ' || h.icon === '💬');
                    if (notes.length > 0) {
                        // Sort by date descending if needed, but order_hist usually comes sorted or we rely on the list order
                        // Assuming order_hist is Chronological or Reverse-Chronological?
                        // Let's assume the last one in the list is the latest (or check created_date if available)
                        // But usually history log appends. Let's retrieve the latest added note.

                        // If we want the absolute latest by date:
                        const latestNote = notes.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

                        const noteInput = document.getElementById('note-text');
                        if (noteInput && latestNote) {
                            noteInput.value = latestNote.detail;
                        }
                    }
                } catch (e) { console.log('Error populating latest note', e); }
            } else {
                timelineEl.innerHTML = `<li class="timeline-item"><div class="timeline-content"><p class="timeline-description
  text-muted">ไม่มีประวัติการอัปเดต</p></div></li>`;
            }
        }

        // Render existing images if they exist
        if (order_pic && order_pic.length > 0) {
            order_pic.sort((a, b) => {
                const titleA = a.pic_title || '';
                const titleB = b.pic_title || '';
                return titleA.localeCompare(titleB, 'th', { numeric: true });
            });
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

    // Instead of querying by data attributes, we query by the DOM container
    const inspectionSection = document.getElementById('inspection-images-section');
    if (!inspectionSection) {
        console.error('Could not find #inspection-images-section container.');
        return;
    }

    const inspectionSlots = inspectionSection.querySelectorAll('.dynamic-image-slot');
    console.log(`Found ${inspectionSlots.length} inspection image slots in the container.`);

    inspectionSlots.forEach(slot => {
        // We only care if there's an image title and if the image has content (e.g. img source is not empty or staged)
        // We'll trust all slots inside this container which have a title that's not default.
        const img = slot.querySelector('img');
        const hasImage = img && img.src && img.style.display !== 'none' && !img.src.includes('R0lGODlhAQAB');

        if (hasImage) {
            const titleInput = slot.querySelector('.image-title-input');
            if (titleInput) {
                const titleText = titleInput.value.trim();
                // Filter out default empty titles
                if (titleText && titleText !== 'กรุณาใส่ชื่อ' && !titleText.startsWith('รายละเอียดความเสียหาย')) {
                    allImageTitles.push(titleText);
                    console.log(`Collected inspection title: "${titleText}"`);
                }
            }
        }
    });

    const sDetailInput = document.getElementById('s_detail');
    if (sDetailInput) {
        if (allImageTitles.length > 0) {
            const finalText = `รายการความเสียหายรวม ${allImageTitles.length} รายการ\n` + allImageTitles.map((title, index) => `${index + 1}. ${title}`).join('\n');
            console.log(`Setting s_detail value to formatted text.`);
            sDetailInput.value = finalText;
        } else {
            console.log(`No valid inspection titles found to populate.`);
            sDetailInput.value = 'ไม่มีรายการความเสียหาย';
        }
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
        // Ensure the image tab and history tab are visible for admin-level roles
        showTabs(['tab-contact-li', 'tab-history-li']);

        // Explicitly show all edit-title-btn for internal staff
        document.querySelectorAll('.edit-title-btn').forEach(btn => {
            btn.style.display = 'inline-block';
            btn.disabled = false;
        });

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
                "ส่งงาน/ตรวจสอบเบื้องต้น",
                "แก้ไข"
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
        if (tabHome) tabHome.classList.add('active', 'show');
        const tabHomeLink = document.querySelector('button[data-bs-target="#tab-home"]');
        if (tabHomeLink) tabHomeLink.parentElement.style.display = 'block';

        // 5. Keep Image Viewing Tab Active
        const imageTabLink = document.querySelector('button[data-bs-target="#tab-contact"]');
        if (imageTabLink) imageTabLink.parentElement.style.display = 'block';
        const imageTab = document.getElementById('tab-contact');
        if (imageTab) {
            imageTab.querySelectorAll('input, button, textarea, select').forEach(el => {
                if (el.id !== 'save-images-btn') el.disabled = false;
            });
        }
        const downloadAllBtn = document.getElementById('downloadAllBtn');
        if (downloadAllBtn) downloadAllBtn.disabled = false;
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
        if (orderStatus === 'Pre-Approved' || orderStatus === 'รออนุมัติ') {
            const allowedStatuses = ['ผ่าน', 'ไม่ผ่าน', 'Pre-Approved', 'รออนุมัติ', 'แก้ไข'];
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

        // Control visibility of image-related tabs based on status
        const allowedImageStatuses = ['รออนุมัติ', 'Pre-Approved', 'ผ่าน', 'ไม่ผ่าน', 'แก้ไข'];
        const isImageVisible = allowedImageStatuses.includes(orderStatus);
        
        const tabsToHide = ['tab-appointments-li', 'tab-note-li', 'tab-history-li', 'tab-upload-li'];
        if (!isImageVisible) {
            tabsToHide.push('tab-contact-li');
            tabsToHide.push('tab-download-images-li');
            console.log(`[Permission] Insurance role: Images hidden for status '${orderStatus}'`);
        } else {
            console.log(`[Permission] Insurance role: Images visible for status '${orderStatus}'`);
        }
        
        hideTabs(tabsToHide);
        if (isImageVisible) {
            showTabs(['tab-contact-li', 'tab-download-images-li']);
        }

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

    // Show categorized download button for managerial roles
    if (['Director', 'Operation Manager', 'Sales Manager'].includes(userRole)) {
        const catBtn = document.getElementById('downloadCategorizedBtn');
        if (catBtn) {
            catBtn.classList.remove('d-none');
            catBtn.classList.add('d-flex');
        }
    }
}

async function populateBrands(brandSelect) {
    if (!brandSelect) return;
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('https://be-claims-service.onrender.com/api/car-brands', {
            headers: { 'Authorization': token }
        });
        const brands = await response.json();
        brandSelect.innerHTML = '<option selected disabled>เลือกยี่ห้อ</option>';
        if (Array.isArray(brands)) {
            brands.sort((a, b) => a.brand_name.localeCompare(b.brand_name)).forEach(brand => {
                const option = document.createElement('option');
                option.value = brand.brand_name;
                option.dataset.id = brand.id;
                option.textContent = brand.brand_name;
                brandSelect.appendChild(option);
            });
        }
        // Add "Other" option
        const otherOption = document.createElement('option');
        otherOption.value = 'other';
        otherOption.textContent = 'อื่นๆ (โปรดระบุ)';
        brandSelect.appendChild(otherOption);

    } catch (e) {
        console.error('Error loading brands', e);
    }
}

async function populateModels(brandSelect, modelSelect) {
    if (!brandSelect || !modelSelect) return;

    // Ensure carModels is available
    if (typeof carModels === 'undefined') {
        console.error('carModels object is not defined. Make sure car-models.js is loaded correctly.');
        return;
    }

    const selectedBrand = brandSelect.value;
    const customBrandInput = document.getElementById('carBrandCustom');
    const customModelInput = document.getElementById('carModelCustom');

    // Reset display
    if (customBrandInput) {
        if (selectedBrand === 'other') {
            customBrandInput.classList.remove('d-none');
        } else {
            customBrandInput.classList.add('d-none');
        }
    }

    if (selectedBrand === 'other') {
        // If brand is custom, model is likely custom too.
        // Hide dropdown and show custom model input directly
        modelSelect.style.display = 'none';
        if (customModelInput) customModelInput.classList.remove('d-none');
        return;
    } else {
        modelSelect.style.display = 'block';
        if (customModelInput) customModelInput.classList.add('d-none'); // Hide custom model input initially
    }

    const models = carModels[selectedBrand] || [];

    // Clear previous options
    modelSelect.innerHTML = '<option value="" selected disabled>เลือกรุ่น</option>';

    // Add new options
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
    });

    // Add 'Other' option to models list
    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.textContent = 'อื่นๆ';
    modelSelect.appendChild(otherOption);

    // Enable the model dropdown
    modelSelect.disabled = false;
}

// =========================================================
// OFFLINE LOG MANAGER
// =========================================================
const OfflineLogManager = {
    STORAGE_KEY: 'offline_claims_logs',

    getLogs() {
        try {
            const logs = localStorage.getItem(this.STORAGE_KEY);
            return logs ? JSON.parse(logs) : [];
        } catch (e) {
            console.error('Error reading offline logs', e);
            return [];
        }
    },

    saveLog(orderId, orderStatus, createdBy, logEntry) {
        try {
            const logs = this.getLogs();
            logs.push({
                orderId,
                orderStatus,
                createdBy,
                logEntry,
                timestamp: Date.now(),
                retryCount: 0
            });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
            console.log('✅ Offline log saved to queue:', logEntry);
        } catch (e) {
            console.error('Error saving offline log', e);
        }
    },

    async processLogs() {
        if (!navigator.onLine) {
            console.log('Device is offline. Skipping log processing.');
            return;
        }

        const logs = this.getLogs();
        if (logs.length === 0) return;

        console.log(`Attempting to send ${logs.length} offline logs...`);
        const remainingLogs = [];
        const token = localStorage.getItem('authToken') || '';

        for (const log of logs) {
            try {
                const response = await fetch(`https://be-claims-service.onrender.com/api/order-status/update/${log.orderId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify({
                        order_status: log.orderStatus,
                        updated_by: log.createdBy,
                        order_hist: [log.logEntry]
                    })
                });

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }

                console.log(`✅ Successfully synced offline log for order ${log.orderId}`);

            } catch (err) {
                console.error(`Failed to retry offline log for order ${log.orderId}:`, err);
                log.retryCount = (log.retryCount || 0) + 1;
                if (log.retryCount < 5) { // helper to prevent infinite loops of bad logs
                    remainingLogs.push(log);
                }
            }
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remainingLogs));
    }
};

window.addEventListener('online', () => OfflineLogManager.processLogs());
window.addEventListener('load', () => OfflineLogManager.processLogs());

async function initCarModelDropdown(brandSelect, modelSelect) {
    if (brandSelect && modelSelect) {
        const customBrandInput = document.getElementById('carBrandCustom');
        const customModelInput = document.getElementById('carModelCustom');

        await populateBrands(brandSelect);

        brandSelect.addEventListener('change', () => populateModels(brandSelect, modelSelect));

        modelSelect.addEventListener('change', () => {
            if (modelSelect.value === 'other') {
                if (customModelInput) {
                    customModelInput.classList.remove('d-none');
                    customModelInput.focus();
                }
            } else {
                if (customModelInput) {
                    customModelInput.classList.add('d-none');
                    customModelInput.value = '';
                }
            }
        });
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
                        <input type="file" id="${uniqueId}" name="${item.name}" data-category="${category}" hidden accept="image/*" ${getCaptureAttr()}>
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

async function uploadStagedImages(orderId, token) {
    if (filesToUpload.size === 0) {
        return { success: true }; // Nothing to upload
    }

    const formData = new FormData();
    formData.append('order_id', orderId);
    formData.append('folder', `transactions/${orderId}`);

    const processingPromises = [];
    const replacePromises = []; // To hold promises for image replacements
    let hasNewImages = false;

    filesToUpload.forEach(({ file, picType, category }, inputName) => {
        const fileInput = document.querySelector(`input[name="${inputName}"]`);
        if (!fileInput) return;

        const imageSlot = fileInput.closest('.dynamic-image-slot');
        const titleInput = imageSlot.querySelector('.image-title-input');
        const picTitle = titleInput ? titleInput.value.trim() : 'ไม่ระบุข้อมูล';

        // Determine if this is replacing an existing image
        const existingUrl = imageSlot.getAttribute('data-pic-url');
        const isReplacement = existingUrl && !existingUrl.startsWith('blob:');

        const promise = imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true })
            .then(compressedFile => addWatermark(compressedFile))
            .then(watermarkedBlob => {
                if (isReplacement) {
                    const replaceData = new FormData();
                    replaceData.append('order_id', orderId);
                    replaceData.append('old_pic_url', existingUrl.split('?')[0]);
                    replaceData.append('pic_title', picTitle);
                    replaceData.append('image', watermarkedBlob, file.name);

                    const replacePromise = fetch(`https://be-claims-service.onrender.com/api/upload/image/replace`, {
                        method: 'PUT',
                        headers: { 'Authorization': token },
                        body: replaceData
                    }).then(async res => {
                        const result = await res.json();
                        if (!res.ok) throw new Error(result.message || 'Replace failed');
                        return result;
                    });
                    replacePromises.push(replacePromise);
                } else {
                    formData.append('images', watermarkedBlob, file.name);
                    // The backend needs pic_type and pic_title for each image
                    formData.append('pic_type', picType);
                    formData.append('pic_title', picTitle);
                    hasNewImages = true;
                }
            })
            .catch(err => {
                console.error('Error processing file:', err);
                throw err; // Propagate to stop Promise.all
            });
        processingPromises.push(promise);
    });

    const userInfoEl = document.getElementById('user-info');
    const created_by = userInfoEl && userInfoEl.innerText ? userInfoEl.innerText.trim() : 'System/Unknown';

    try {
        await Promise.all(processingPromises);
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการเตรียมไฟล์สำหรับอัปโหลด');
        // Log failure to history
        fetch(`https://be-claims-service.onrender.com/api/order-status/update/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({
                order_status: getSafeValue('orderStatus'),
                updated_by: created_by,
                order_hist: [{ icon: "🚨", task: "เตรียมอัปโหลดล้มเหลว", detail: `ล้มเหลวในการเตรียมไฟล์: ${error.message}`, created_by }]
            })
        }).catch(e => console.error('Emergency logging failed', e));
        return { success: false };
    }

    try {
        // 1. Process Replacements first
        if (replacePromises.length > 0) {
            await Promise.all(replacePromises);
        }

        // 2. Process New Uploads
        if (hasNewImages) {
            const response = await fetch(`https://be-claims-service.onrender.com/api/upload/image/transactions`, {
                method: 'POST',
                headers: { 'Authorization': token },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                alert('❌ อัปโหลดรูปภาพใหม่ล้มเหลว: ' + result.message);
                fetch(`https://be-claims-service.onrender.com/api/order-status/update/${orderId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify({
                        order_status: getSafeValue('orderStatus'),
                        updated_by: created_by,
                        order_hist: [{ icon: "🚨", task: "อัปโหลดล้มเหลว", detail: `ล้มเหลว: ${result.message}`, created_by }]
                    })
                }).catch(e => console.error('Emergency logging failed', e));
                return { success: false };
            }
        }

        filesToUpload.clear(); // Clear staged files on success
        return { success: true };
    } catch (error) {
        console.error('Upload error:', error);
        alert('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์อัปโหลด (บันทึก Log ลงเครื่องแล้ว)');
        // Log failure to history
        const logEntry = { icon: "🚨", task: "อัปโหลดล้มเหลว (Network)", detail: `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์: ${error.message}`, created_by };

        fetch(`https://be-claims-service.onrender.com/api/order-status/update/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({
                order_status: getSafeValue('orderStatus'),
                updated_by: created_by,
                order_hist: [logEntry]
            })
        }).catch(e => {
            console.warn('Network failed immediately during upload, queuing offline log...', e);
            OfflineLogManager.saveLog(orderId, getSafeValue('orderStatus'), created_by, logEntry);
        });

        return { success: false };
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
            // Prevent adding duplicate buttons on data reload
            if (targetSection.querySelector('.add-image-btn-container')) {
                continue;
            }
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'text-center mt-3 add-image-btn-container';

            const addImageButtonHtml = `
                <button type="button" class="btn btn-outline-primary add-image-btn" data-category="${category}">
                    <i class="bi bi-plus-circle"></i> เพิ่มรูปภาพ
                </button>
            `;
            buttonContainer.innerHTML = addImageButtonHtml;

            targetSection.appendChild(buttonContainer);
        }
    }
}

window.addEventListener('load', async function () {
    const imagePreviewModalEl = document.getElementById('imagePreviewModal');
    console.log('imagePreviewModalEl found (at top of DOMContentLoaded):', imagePreviewModalEl);

    const viewFullImageBtn = document.getElementById('view-full-image-btn');
    console.log('viewFullImageBtn found (at top of DOMContentLoaded):', viewFullImageBtn);

    // Await brand population before loading order data to prevent race conditions
    await initCarModelDropdown(document.getElementById('carBrand'), document.getElementById('carModel'));
    createAddImageButtons();

    const orderId = getQueryParam('id');
    if (orderId) {
        loadOrderData(orderId);
    }

    function handleImageSelection(fileInput) {
        const file = fileInput.files[0];
        const inputName = fileInput.name; // The name is unique enough to be a key

        if (!file) {
            filesToUpload.delete(inputName);
            return;
        }

        // For new uploads, the picType should be the general category.
        // For existing slots (replace), it's the specific name like 'exterior_front'.
        const picType = fileInput.dataset.category || fileInput.name;
        const category = fileInput.dataset.category;

        filesToUpload.set(inputName, { file: file, picType: picType, category: category });

        // Update UI to show preview
        const imageSlot = fileInput.closest('.dynamic-image-slot');
        const imgPreview = imageSlot.querySelector('img');

        const reader = new FileReader();
        reader.onload = (event) => {
            imgPreview.src = event.target.result;
            // Mark this slot as having a pending upload, but not yet "data-uploaded"
            imageSlot.setAttribute('data-pending-upload', 'true');
        };
        reader.readAsDataURL(file);

        // --- Auto-Save to Device (User Request) ---
        // Trigger a download of the captured/selected file so it saves to the device
        try {
            const downloadUrl = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `captured_${new Date().getTime()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
        } catch (err) {
            console.warn('Auto-save to device failed:', err);
        }

    }

    document.addEventListener('change', (e) => {
        const fileInput = e.target;
        if (fileInput.matches('input[type="file"]') && fileInput.closest('.dynamic-image-slot')) {
            handleImageSelection(fileInput);
        }
    });

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
        uploadCsvInput.addEventListener('click', function () {
            this.value = null;
        });
        uploadCsvInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
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

    // --- ZIP DOWNLOAD LOGIC (Refactored) ---
    async function handleZipDownload(event) {
        event.preventDefault();
        console.log('Download All button clicked.');
        const zip = new JSZip();
        // Use taskId (from hidden input) or fallback to 'images'
        const orderIdVal = document.getElementById('taskId')?.value?.trim() || 'images';

        // Selector update: include .dynamic-image-slot img to ensure we catch all new uploads
        // Also keep .image-gallery img for backward compat if needed, and #download-images-container .card-img-top for Tab 7
        const selector = '.dynamic-image-slot img, .image-gallery img, #download-images-container .card-img-top';
        const imageElements = Array.from(document.querySelectorAll(selector)).filter(img => {
            const style = getComputedStyle(img);
            // Check for valid src, visible, and loaded
            return (img.src && img.src.startsWith('http') && style.display !== 'none' && img.complete);
        });

        if (imageElements.length === 0) {
            alert('ไม่มีภาพให้ดาวน์โหลด');
            return;
        }

        console.log(`Found ${imageElements.length} images to download.`);

        // Deduplicate images by URL to avoid downloading the same image twice (e.g. if shown in multiple tabs)
        const uniqueImages = new Map();
        imageElements.forEach((img, i) => {
            // Prefer cloud URL, ignore base64 preview if possible unless that's all we have
            if (!uniqueImages.has(img.src)) {
                uniqueImages.set(img.src, { img, index: i });
            }
        });

        const promises = [];
        let index = 1;

        for (const [src, item] of uniqueImages) {
            const img = item.img;

            // Try to find a meaningful title
            // 1. Title input in dynamic slot
            // 2. Title div in legacy gallery
            // 3. Card text in download tab
            // 4. Fallback
            let title = '';

            const dynamicSlot = img.closest('.dynamic-image-slot');
            if (dynamicSlot) {
                title = dynamicSlot.querySelector('.image-title-input')?.value?.trim();
            } else {
                const label = img.closest('label');
                if (label) title = label.querySelector('.title')?.innerText?.trim();
                else {
                    const cardBody = img.closest('.card')?.querySelector('.card-body');
                    if (cardBody) title = cardBody.querySelector('.card-text')?.innerText?.trim();
                }
            }

            if (!title) title = `image-${index}`;
            const safeName = title.replace(/[\[\\\]^$.|?*+()\/]/g, '').replace(/\s+/g, '_');

            const promise = (async () => {
                try {
                    console.log(`Attempting to download: ${src}`);
                    const token = localStorage.getItem('authToken') || '';

                    // Use proxy if it's a relative path or needs auth, otherwise try direct if CORS allows
                    // Defaulting to proxy for consistent behavior with protected assets
                    const response = await fetch(`https://be-claims-service.onrender.com/api/upload/proxy-download`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': token },
                        body: JSON.stringify({ imageUrl: src })
                    });

                    if (!response.ok) {
                        // Fallback: try fetching directly if proxy fails (e.g. for some public URLs)
                        const directResp = await fetch(src);
                        if (directResp.ok) {
                            const blob = await directResp.blob();
                            zip.file(`${safeName}.jpg`, blob);
                            return;
                        }
                        throw new Error('Proxy and direct fetch failed');
                    }

                    const blob = await response.blob();
                    console.log(`Blob received for ${src}: size=${blob.size} bytes`);

                    if (blob.size === 0) {
                        throw new Error('Received empty blob');
                    }

                    // Ensure unique filenames in zip
                    let fileName = `${safeName}.jpg`;
                    let counter = 1;
                    while (zip.file(fileName)) {
                        fileName = `${safeName}_${counter}.jpg`;
                        counter++;
                    }

                    zip.file(fileName, blob);
                } catch (err) {
                    console.warn(`Failed to download image: ${src}`, err);
                }
            })();

            promises.push(promise);
            index++;
        }

        await Promise.all(promises);

        if (Object.keys(zip.files).length === 0) {
            alert('ไม่สามารถดาวน์โหลดรูปภาพได้ (อาจเกิดข้อผิดพลาดในการเชื่อมต่อ)');
            return;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        saveAs(zipBlob, orderIdVal + '.zip');
        console.log('ZIP file generated and ready for download.');
    }

    // --- CATEGORIZED ZIP DOWNLOAD LOGIC ---
    async function handleCategorizedZipDownload(event) {
        event.preventDefault();
        console.log('Categorized Download All button clicked.');
        const zip = new JSZip();
        // Use taskId (from hidden input) or fallback to 'images'
        const orderIdVal = document.getElementById('taskId')?.value?.trim() || 'images';

        const selector = '.dynamic-image-slot img, .image-gallery img, #download-images-container .card-img-top';
        const imageElements = Array.from(document.querySelectorAll(selector)).filter(img => {
            const style = getComputedStyle(img);
            return (img.src && img.src.startsWith('http') && style.display !== 'none' && img.complete);
        });

        if (imageElements.length === 0) {
            alert('ไม่มีภาพให้ดาวน์โหลด');
            return;
        }

        console.log(`Found ${imageElements.length} images to download categorized.`);

        const uniqueImages = new Map();
        imageElements.forEach((img, i) => {
            if (!uniqueImages.has(img.src)) {
                uniqueImages.set(img.src, { img, index: i });
            }
        });

        const promises = [];
        let index = 1;

        const mainCategoryNames = {
            around: 'ภาพถ่ายรอบคัน',
            accessories: 'ภาพถ่ายภายในรถ และอุปกรณ์ตกแต่ง',
            inspection: 'ภาพถ่ายความเสียหาย',
            fiber: 'เอกสารใบตรวจสภาพรถ',
            documents: 'เอกสารอื่นๆ',
            signature: 'ลายเซ็น',
            other: 'อื่นๆ'
        };

        for (const [src, item] of uniqueImages) {
            const img = item.img;
            let title = '';
            let rawCategory = 'other';

            const dynamicSlot = img.closest('.dynamic-image-slot');
            if (dynamicSlot) {
                title = dynamicSlot.querySelector('.image-title-input')?.value?.trim();
                rawCategory = dynamicSlot.dataset.category || 'other';
            } else {
                const label = img.closest('label');
                if (label) title = label.querySelector('.title')?.innerText?.trim();
                else {
                    const cardBody = img.closest('.card')?.querySelector('.card-body');
                    if (cardBody) title = cardBody.querySelector('.card-text')?.innerText?.trim();
                    const section = img.closest('.mb-4');
                    // In Tab 7, the category is rendered as h6
                    if (section) {
                        const h6 = section.querySelector('h6');
                        if (h6) {
                            const name = h6.innerText.trim();
                            const foundKey = Object.keys(mainCategoryNames).find(key => mainCategoryNames[key] === name);
                            if (foundKey) rawCategory = foundKey;
                        }
                    }
                }
            }

            if (!title) title = `image-${index}`;
            const safeName = title.replace(/[\[\\\]^$.|?*+()\/]/g, '').replace(/\s+/g, '_');
            const folderName = mainCategoryNames[rawCategory] || 'อื่นๆ';

            const promise = (async () => {
                try {
                    const token = localStorage.getItem('authToken') || '';
                    const response = await fetch(`https://be-claims-service.onrender.com/api/upload/proxy-download`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': token },
                        body: JSON.stringify({ imageUrl: src })
                    });

                    if (!response.ok) {
                        const directResp = await fetch(src);
                        if (directResp.ok) {
                            const blob = await directResp.blob();
                            zip.folder(folderName).file(`${safeName}.jpg`, blob);
                            return;
                        }
                        throw new Error('Proxy and direct fetch failed');
                    }

                    const blob = await response.blob();
                    console.log(`Blob received for categorized ${src}: size=${blob.size} bytes`);

                    if (blob.size === 0) {
                        throw new Error('Received empty blob');
                    }
                    
                    let fileName = `${safeName}.jpg`;
                    let counter = 1;
                    const folder = zip.folder(folderName);
                    while (folder.file(fileName)) {
                        fileName = `${safeName}_${counter}.jpg`;
                        counter++;
                    }
                    folder.file(fileName, blob);
                } catch (err) {
                    console.warn(`Failed to download image: ${src}`, err);
                }
            })();

            promises.push(promise);
            index++;
        }

        await Promise.all(promises);

        if (Object.keys(zip.files).length === 0) {
            alert('ไม่สามารถดาวน์โหลดรูปภาพได้ (อาจเกิดข้อผิดพลาดในการเชื่อมต่อ)');
            return;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        saveAs(zipBlob, orderIdVal + '.zip');
        console.log('Categorized ZIP file generated.');
    }

    const downloadAllBtn = document.getElementById('downloadAllBtn');
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', handleZipDownload);
    }

    const downloadCategorizedBtn = document.getElementById('downloadCategorizedBtn');
    if (downloadCategorizedBtn) {
        downloadCategorizedBtn.addEventListener('click', handleCategorizedZipDownload);
    }

    // Also bind event to the second button in Tab 7
    const downloadAllBtnTab7 = document.getElementById('downloadAllBtn_tab7');
    if (downloadAllBtnTab7) {
        downloadAllBtnTab7.addEventListener('click', handleZipDownload);
    }

    // Bind and setup PDF Download Buttons
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const downloadPdfBtnTab7 = document.getElementById('downloadPdfBtn_tab7');
    const currentUserRole = typeof getUserRole === 'function' ? getUserRole() : (window.decodedToken ? window.decodedToken.role : null);

    if (currentUserRole !== 'Bike') {
        if (downloadPdfBtn) {
            downloadPdfBtn.style.display = 'flex';
            downloadPdfBtn.addEventListener('click', handlePdfDownload);
        }
        if (downloadPdfBtnTab7) {
            downloadPdfBtnTab7.style.display = 'flex';
            downloadPdfBtnTab7.addEventListener('click', handlePdfDownload);
        }
    }

    async function handlePdfDownload() {
        const btn1 = downloadPdfBtn;
        const btn2 = downloadPdfBtnTab7;
        const originalText1 = btn1 ? btn1.innerHTML : '';
        const originalText2 = btn2 ? btn2.innerHTML : '';
        
        if (btn1) { btn1.disabled = true; btn1.innerHTML = '<span class="spinner-border spinner-border-sm"></span> กำลังสร้าง PDF...'; }
        if (btn2) { btn2.disabled = true; btn2.innerHTML = '<span class="spinner-border spinner-border-sm"></span> กำลังสร้าง PDF...'; }

        try {
            const orderIdVal = document.getElementById('taskId')?.value?.trim() || 'images';
            const selector = '.dynamic-image-slot img, .image-gallery img, #download-images-container .card-img-top';
            const imageElements = Array.from(document.querySelectorAll(selector)).filter(img => {
                const src = img.src || img.getAttribute('src');
                const style = window.getComputedStyle(img);
                // The images might not be fully complete, but we will fetch them again below
                return (src && style.display !== 'none');
            });

            const uniqueImages = new Map();
            imageElements.forEach((img, i) => {
                if (!uniqueImages.has(img.src)) {
                    uniqueImages.set(img.src, img);
                }
            });

            const validImages = Array.from(uniqueImages.values());

            const pdfContainer = document.createElement('div');
            pdfContainer.style.width = '210mm';
            pdfContainer.style.position = 'absolute';
            pdfContainer.style.left = '-9999px';
            pdfContainer.style.top = '0';
            pdfContainer.style.backgroundColor = '#ffffff';
            pdfContainer.style.fontFamily = "sans-serif, 'Sarabun', 'Kanit'";
            document.body.appendChild(pdfContainer);

            for (let i = 0; i < validImages.length; i++) {
                const img = validImages[i];
                const src = img.src || img.getAttribute('src');
                
                let title = '';
                const dynamicSlot = img.closest('.dynamic-image-slot');
                if (dynamicSlot) {
                    title = dynamicSlot.querySelector('.image-title-input')?.value?.trim();
                } else {
                    const label = img.closest('label');
                    if (label) {
                        title = label.querySelector('.title')?.innerText?.trim();
                    } else {
                        const cardBody = img.closest('.card')?.querySelector('.card-body');
                        if (cardBody) title = cardBody.querySelector('.card-text')?.innerText?.trim();
                        if (!title) {
                            const section = img.closest('.mb-4');
                            if (section) {
                                const h6 = section.querySelector('h6');
                                if (h6) title = h6.innerText.trim();
                            }
                        }
                    }
                }
                
                if (!title) title = `รูปภาพที่ ${i + 1}`;

                let base64Img = src;
                if (!src.startsWith('data:')) {
                    try {
                        const token = localStorage.getItem('authToken') || '';
                        let response = await fetch(`https://be-claims-service.onrender.com/api/upload/proxy-download`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': token },
                            body: JSON.stringify({ imageUrl: src })
                        });
                        if (!response.ok) {
                            response = await fetch(src);
                            if (!response.ok) throw new Error('Fetch failed');
                        }
                        const blob = await response.blob();
                        base64Img = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) {
                        console.warn('Failed fetching base64 for PDF', src, e);
                    }
                }

                const pageDiv = document.createElement('div');
                pageDiv.style.width = '210mm';
                pageDiv.style.minHeight = '296mm';
                pageDiv.style.padding = '20mm';
                pageDiv.style.boxSizing = 'border-box';
                pageDiv.style.display = 'flex';
                pageDiv.style.flexDirection = 'column';
                pageDiv.style.alignItems = 'center';
                pageDiv.style.justifyContent = 'center';
                
                if (i < validImages.length - 1) {
                    pageDiv.classList.add('html2pdf__page-break');
                }

                const imgEl = document.createElement('img');
                await new Promise((resolve) => {
                    imgEl.onload = resolve;
                    imgEl.onerror = resolve;
                    imgEl.src = base64Img;
                });
                imgEl.style.maxWidth = '100%';
                imgEl.style.maxHeight = '200mm';
                imgEl.style.objectFit = 'contain';
                imgEl.style.display = 'block';
                imgEl.style.marginBottom = '20px';

                const textEl = document.createElement('div');
                textEl.innerText = title;
                textEl.style.fontSize = '24px';
                textEl.style.fontWeight = 'bold';
                textEl.style.textAlign = 'center';
                textEl.style.color = '#000000';

                pageDiv.appendChild(imgEl);
                pageDiv.appendChild(textEl);
                pdfContainer.appendChild(pageDiv);
            }

            if (pdfContainer.childNodes.length === 0) {
                alert('ไม่พบรูปภาพสำหรับสร้าง PDF');
            } else {
                const opt = {
                    margin:       0,
                    filename:     orderIdVal + '.pdf',
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true, logging: false },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                await html2pdf().set(opt).from(pdfContainer).save();
            }

            pdfContainer.remove();

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('เกิดข้อผิดพลาดในการสร้าง PDF');
        } finally {
            if (btn1) { btn1.disabled = false; btn1.innerHTML = originalText1; }
            if (btn2) { btn2.disabled = false; btn2.innerHTML = originalText2; }
        }
    }

    // --- Dynamic Image Upload Logic ---
    function renderNewImageUploadSlot(category) {
        const uniqueId = `dynamic-upload-${category}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
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
                <input type="file" id="${uniqueId}" name="${uniqueId}" data-category="${category}" hidden accept="image/*" ${getCaptureAttr()}>
            </div>
        `;
        return newSlotHtml;
    }

    document.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('add-image-btn')) {
            const category = e.target.dataset.category;
            const newSlotHtml = renderNewImageUploadSlot(category);
            e.target.parentElement.insertAdjacentHTML('beforebegin', newSlotHtml);
        }
    });



    // Delegated event listener to trigger file input when the new upload button is clicked
    document.addEventListener('click', function (e) {
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
    document.addEventListener('click', async function (e) {
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

        const editTitleBtn = e.target.closest('.edit-title-btn');
        if (editTitleBtn) {
            e.preventDefault();
            const imageSlot = editTitleBtn.closest('.dynamic-image-slot');
            const orderId = getSafeValue('taskId');
            const picUrl = imageSlot.getAttribute('data-pic-url');
            const titleInput = imageSlot.querySelector('.image-title-input');
            const newTitle = titleInput ? titleInput.value.trim() : '';

            if (!picUrl) {
                alert('⚠️ รูปภาพนี้ยังไม่ได้อัปโหลด ไม่สามารถแก้ไขชื่อในระบบได้ (ชื่อจะถูกบันทึกเมื่อกดบันทึกข้อมูลหลัก)');
                return;
            }

            if (!newTitle) {
                alert('⚠️ กรุณาใส่ชื่อรูปภาพ');
                return;
            }

            editTitleBtn.disabled = true;
            const originalIcon = editTitleBtn.innerHTML;
            editTitleBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

            const success = await updateImageTitle(orderId, picUrl, newTitle);

            editTitleBtn.disabled = false;
            editTitleBtn.innerHTML = originalIcon;

            if (success) {
                // Optionally reload or just show success
                console.log('Image title updated successfully');
            }
        }
    });



    loadUserProfile();

    // CRM-FIX: Force correct button text to avoid encoding issues
    const saveBtn = document.getElementById('submittaskBtn');
    if (saveBtn) {
        saveBtn.innerText = 'บันทึกข้อมูล';
    }

    const userRole = getUserRole();
    if (userRole) {
        const adminMenuEl = document.getElementById('admin-menu');
        const userManagementMenuEl = document.getElementById('user-management-menu');

        if (['Operation Manager', 'Director', 'Developer'].includes(userRole)) {
            if (adminMenuEl) adminMenuEl.style.display = 'block';
        }

        if (userRole === 'Admin Officer') {
            const orderStatusSelect = document.getElementById('orderStatus');
            if (orderStatusSelect) orderStatusSelect.setAttribute('disabled', 'disabled');
        }

        if (userRole === 'Insurance') {
            ['insuranceCompany', 'c_insure'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.setAttribute('disabled', 'disabled');
            });
        }


        const orderId = getQueryParam('id');
        if (orderId) {
            loadOrderData(orderId);
        } else {
            const now = new Date();
            const options = {
                timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12:
                    false
            };
            const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(now);
            const getPart = (type) => parts.find(p => p.type === type)?.value;
            const formatted = `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
            const transactionDateEl = document.getElementById('transactionDate');
            if (transactionDateEl) transactionDateEl.value = formatted;
        }

        const form = document.getElementById('taskForm');
        if (!form) return;

        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); localStorage.removeItem('authToken'); navigateTo(LOGIN_PAGE);
        });
        const logoutMenu = document.getElementById('logout-menu');
        if (logoutMenu) logoutMenu.addEventListener('click', (e) => {
            e.preventDefault(); localStorage.removeItem('authToken'); navigateTo(LOGIN_PAGE);
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

                // Ensure button has text 'บันทึกข้อมูล' even during processing if we reset it
                const manualSubmitBtn = document.getElementById('submittaskBtn');
                if (manualSubmitBtn && !manualSubmitBtn.innerText.includes('กำลัง')) {
                    manualSubmitBtn.innerText = 'บันทึกข้อมูล';
                }

                // Preserve user's input titles for existing images before any DOM refresh
                const preservedTitles = new Map();
                if (filesToUpload.size > 0) {
                    document.querySelectorAll('.dynamic-image-slot[data-uploaded="true"]').forEach(slot => {
                        const imgUrl = slot.getAttribute('data-pic-url');
                        const titleInput = slot.querySelector('.image-title-input');
                        if (imgUrl && titleInput) {
                            preservedTitles.set(imgUrl.split('?')[0], titleInput.value.trim());
                        }
                    });
                }

                // --- START: NEW UPLOAD LOGIC ---
                if (filesToUpload.size > 0) {
                    const currentOrderId = getSafeValue('taskId');
                    const token = localStorage.getItem('authToken') || '';

                    if (!currentOrderId) {
                        alert('กรุณาสร้างงานก่อนทำการอัปโหลดรูปภาพ');
                        return;
                    }

                    if (manualSubmitBtn) {
                        manualSubmitBtn.disabled = true;
                        manualSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> กำลังอัปโหลดรูปภาพ...';
                    }

                    const uploadResult = await uploadStagedImages(currentOrderId, token);

                    if (!uploadResult.success) {
                        if (manualSubmitBtn) {
                            manualSubmitBtn.disabled = false;
                            manualSubmitBtn.innerHTML = '\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25';
                        }
                        // Error is already alerted in uploadStagedImages
                        return; // Stop submission
                    }

                    // After successful upload, reload all the data to get the new image URLs in the DOM
                    // This is crucial for the rest of the submit handler to work correctly.
                    await loadOrderData(currentOrderId);
                }
                // --- END: NEW UPLOAD LOGIC ---

                const currentUserRole = getUserRole();

                const token = localStorage.getItem('authToken') || '';
                const currentOrderId = getSafeValue('taskId');
                const userInfoEl = document.getElementById('user-info');
                const created_by = userInfoEl && userInfoEl.innerText ? userInfoEl.innerText.trim() : getSafeValue('ownerName');
                let endpoint, data, method;

                const orderPic = [];
                document.querySelectorAll('.dynamic-image-slot[data-uploaded="true"]').forEach(slot => {
                    const imgUrl = slot.getAttribute('data-pic-url');
                    const picType = slot.getAttribute('data-pic-type');
                    const titleInput = slot.querySelector('.image-title-input');

                    // Recover preserved title or use current DOM value
                    const baseImgUrl = imgUrl ? imgUrl.split('?')[0] : '';
                    let title = titleInput ? titleInput.value.trim() : 'ไม่ระบุข้อมูล';
                    if (baseImgUrl && preservedTitles.has(baseImgUrl)) {
                        title = preservedTitles.get(baseImgUrl) || title;
                    }

                    if (imgUrl && picType) {
                        orderPic.push({ pic: baseImgUrl, pic_type: picType, pic_title: title, created_by: created_by });
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

                // Capture Additional Details and Notes
                const additionalDetails = getSafeValue('additionalDetails');
                const noteText = getSafeValue('note-text');

                // --- Detailed Logging Logic ---
                const imgCount = orderPic.length;
                const imgTitles = orderPic.map(p => p.pic_title || 'ไม่ระบุชื่อ').join(', ');
                const payloadSize = JSON.stringify({ ...orderPic }).length; // Approx size of images part
                const logDetail = `อัปเดตโดย: ${created_by} | รูป: ${imgCount} ใบ (${(payloadSize / 1024).toFixed(2)} KB) | รายชื่อ: ${imgTitles.substring(0, 100)}${imgTitles.length > 100 ? '...' : ''}`;

                const dynamicOrderHist = [{ icon: "📝", task: "อัปเดตรายการ", detail: logDetail, created_by }];

                if (additionalDetails) {
                    dynamicOrderHist.push({ icon: "ℹ️", task: "รายละเอียดเพิ่มเติม", detail: additionalDetails, created_by });
                }
                if (noteText) {
                    dynamicOrderHist.push({ icon: "💬", task: "บันทึกข้อความ", detail: noteText, created_by });
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
                    c_brand: document.getElementById('carBrand')?.value === 'other' ? getSafeValue('carBrandCustom') : getSafeValue('carBrand'),
                    c_version: (document.getElementById('carBrand')?.value === 'other' || document.getElementById('carModel')?.value === 'other') ? getSafeValue('carModelCustom') : getSafeValue('carModel'),
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
                    order_hist: dynamicOrderHist,
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
                    const startTime = Date.now();
                    const response = await fetch(endpoint, {
                        method: method, headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` }, body:
                            JSON.stringify(data)
                    });
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    console.log(`Update Request Duration: ${duration}ms`);

                    const result = await response.json();
                    if (response.ok) {
                        alert('✅ ดำเนินการเรียบร้อยแล้ว (ใช้เวลา ' + (duration / 1000).toFixed(2) + ' วินาที)'); // Changed message to be more generic
                        // Clear Note and Additional Details inputs
                        const addDetailsEl = document.getElementById('additionalDetails');
                        if (addDetailsEl) addDetailsEl.value = '';
                        const noteEl = document.getElementById('note-text');
                        if (noteEl) noteEl.value = '';
                        loadOrderData(currentOrderId);
                    } else {
                        alert('❌ เกิดข้อผิดพลาด: ' + result.message);
                        // Log failure to history
                        if (currentOrderId && result.message) {
                            fetch(`https://be-claims-service.onrender.com/api/order-status/update/${currentOrderId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                                body: JSON.stringify({
                                    order_status: getSafeValue('orderStatus'),
                                    updated_by: created_by,
                                    order_hist: [{ icon: "🚨", task: "อัปเดตล้มเหลว", detail: `ล้มเหลว: ${result.message}`, created_by }]
                                })
                            }).catch(e => console.error('Emergency logging failed', e));
                        }
                    }
                } catch (error) {
                    alert('❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ (บันทึก Log ลงเครื่องแล้ว)');
                    console.error('Fetch error:', error);
                    // Log failure to history (if we have orderId)
                    if (currentOrderId) {
                        const logEntry = { icon: "🚨", task: "อัปเดตล้มเหลว (Network)", detail: `ล้มเหลว: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (${error.message})`, created_by };

                        // Try standard fetch first (might fail if offline), then queue
                        fetch(`https://be-claims-service.onrender.com/api/order-status/update/${currentOrderId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': token },
                            body: JSON.stringify({
                                order_status: getSafeValue('orderStatus'),
                                updated_by: created_by,
                                order_hist: [logEntry]
                            })
                        }).catch(e => {
                            console.warn('Network failed immediately, queuing offline log...', e);
                            OfflineLogManager.saveLog(currentOrderId, getSafeValue('orderStatus'), created_by, logEntry);
                        });
                    }
                } finally {
                    if (manualSubmitBtn) {
                        manualSubmitBtn.disabled = false;
                        manualSubmitBtn.innerHTML = '\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25';
                    }
                }
            });
        }

        if (getUserRole() === 'Bike') {
            form.addEventListener('submit', async function (e) {
                e.preventDefault();

                const manualSubmitBtn = document.getElementById('submittaskBtn');

                // Preserve user's input titles for existing images before any DOM refresh
                const preservedTitles = new Map();
                if (filesToUpload.size > 0) {
                    document.querySelectorAll('.dynamic-image-slot[data-uploaded="true"]').forEach(slot => {
                        const imgUrl = slot.getAttribute('data-pic-url');
                        const titleInput = slot.querySelector('.image-title-input');
                        if (imgUrl && titleInput) {
                            preservedTitles.set(imgUrl.split('?')[0], titleInput.value.trim());
                        }
                    });
                }

                // --- START: NEW UPLOAD LOGIC ---
                if (filesToUpload.size > 0) {
                    const currentOrderId = getSafeValue('taskId');
                    const token = localStorage.getItem('authToken') || '';

                    if (!currentOrderId) {
                        alert('❌ ไม่พบรหัสงาน ไม่สามารถบันทึกได้');
                        return;
                    }

                    if (manualSubmitBtn) {
                        manualSubmitBtn.disabled = true;
                        manualSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> กำลังอัปโหลดรูปภาพ...';
                    }

                    const uploadResult = await uploadStagedImages(currentOrderId, token);

                    if (!uploadResult.success) {
                        if (manualSubmitBtn) {
                            manualSubmitBtn.disabled = false;
                            manualSubmitBtn.innerHTML = '\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25';
                        }
                        // Error is already alerted in uploadStagedImages
                        return; // Stop submission
                    }

                    // After successful upload, reload all the data to get the new image URLs in the DOM
                    await loadOrderData(currentOrderId);
                }
                // --- END: NEW UPLOAD LOGIC ---

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
                    c_brand: document.getElementById('carBrand')?.value === 'other' ? getSafeValue('carBrandCustom') : getSafeValue('carBrand'),
                    c_version: (document.getElementById('carBrand')?.value === 'other' || document.getElementById('carModel')?.value === 'other') ? getSafeValue('carModelCustom') : getSafeValue('carModel'),
                    c_mile: getSafeValue('c_mile'),
                    c_type: getSafeValue('carType'),
                    updated_by: updated_by,
                    order_hist: [] // Will be populated below
                };

                // Collect picture data
                const orderPic = [];
                document.querySelectorAll('.dynamic-image-slot[data-uploaded="true"]').forEach(slot => {
                    const imgUrl = slot.getAttribute('data-pic-url');
                    const picType = slot.getAttribute('data-pic-type');
                    const titleInput = slot.querySelector('.image-title-input');

                    // Recover preserved title or use current DOM value
                    const baseImgUrl = imgUrl ? imgUrl.split('?')[0] : '';
                    let title = titleInput ? titleInput.value.trim() : 'ไม่ระบุข้อมูล';
                    if (baseImgUrl && preservedTitles.has(baseImgUrl)) {
                        title = preservedTitles.get(baseImgUrl) || title;
                    }

                    if (imgUrl && picType) {
                        orderPic.push({ pic: baseImgUrl, pic_type: picType, pic_title: title, created_by: updated_by });
                    }
                });

                // --- Detailed Logging Logic (Bike) ---
                const imgCount = orderPic.length;
                const imgTitles = orderPic.map(p => p.pic_title || 'ไม่ระบุชื่อ').join(', ');
                const payloadSize = JSON.stringify(orderPic).length;
                const logDetail = `อัปเดตสถานะและข้อมูลปโดย: ${updated_by} | รูป: ${imgCount} ใบ (${(payloadSize / 1024).toFixed(2)} KB) | รายชื่อ: ${imgTitles.substring(0, 100)}${imgTitles.length > 100 ? '...' : ''}`;

                carDetailsPayload.order_hist = [{ icon: "🚲", task: "ส่งงานและอัปเดตข้อมูล", detail: logDetail, created_by: updated_by }];

                carDetailsPayload.order_pic = orderPic;

                const endpoint = `https://be-claims-service.onrender.com/api/order-pic/update/${currentOrderId}`;

                // Log the payload for debugging
                console.log('Submitting payload for Bike:', JSON.stringify(carDetailsPayload, null, 2));

                try {
                    const startTime = Date.now();
                    const response = await fetch(endpoint, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
                        body: JSON.stringify(carDetailsPayload)
                    });
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    console.log(`Bike Update Request Duration: ${duration}ms`);

                    const result = await response.json();

                    if (response.ok) {
                        alert('✅ อัปเดตข้อมูลและสถานะเรียบร้อยแล้ว (ใช้เวลา ' + (duration / 1000).toFixed(2) + ' วินาที)');
                        loadOrderData(currentOrderId);
                    } else {
                        throw new Error(result.message || 'การอัปเดตล้มเหลว');
                    }
                } catch (error) {
                    alert(`❌ เกิดข้อผิดพลาด: ${error.message} (บันทึก Log ลงเครื่องแล้ว)`);
                    console.error('Fetch error for bike submission:', error);
                    // Emergency logging for Bike failure
                    if (currentOrderId && token) {
                        const logEntry = { icon: "🚨", task: "อัปเดตล้มเหลว (Bike)", detail: `ล้มเหลว: ${error.message}`, created_by: updated_by };

                        fetch(`https://be-claims-service.onrender.com/api/order-status/update/${currentOrderId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': token },
                            body: JSON.stringify({
                                order_status: newStatus,
                                updated_by: updated_by,
                                order_hist: [logEntry]
                            })
                        }).catch(e => {
                            console.warn('Network failed immediately (Bike), queuing offline log...', e);
                            OfflineLogManager.saveLog(currentOrderId, newStatus, updated_by, logEntry);
                        });
                    }
                } finally {
                    if (manualSubmitBtn) {
                        manualSubmitBtn.disabled = false;
                        manualSubmitBtn.innerHTML = '\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25';
                    }
                }
            });
        }







        // Delegated event listener for individual image download buttons
        document.addEventListener('click', async function (e) {
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

            document.addEventListener('click', function (e) {
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
                span.onclick = function () {
                    modal.style.display = "none";
                }
            }

            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        }
        // --- End of Custom Modal Logic ---
    }
});

// =========================================================
// TEMPLATE GENERATION LOGIC (Top Level)
// =========================================================

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
    if (!targetSection) {
        console.warn(`Target section not found for category: ${category}`);
        return;
    }

    const uniqueId = `new-image-${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const displayTitle = configItem.defaultTitle || 'กรุณาใส่ชื่อ';
    const picType = configItem.name || 'unknown';




    const newSlotHtml = `
        <div class="col-4 mb-3 dynamic-image-slot" data-pic-type="${picType}" data-uploaded="false" data-category="${category}">
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
            <input type="file" id="${uniqueId}" name="${picType}" data-category="${category}" hidden accept="image/*" ${getCaptureAttr()}>
        </div>
    `;

    targetSection.insertAdjacentHTML('beforeend', newSlotHtml);

    // Add event listener for the new file input
    const newFileInput = document.getElementById(uniqueId);
    if (newFileInput) {
        newFileInput.addEventListener('change', handleFileSelect);
    }

    // Add event listener for delete button
    const addedSlot = targetSection.lastElementChild;
    const deleteBtn = addedSlot.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            addedSlot.remove();
        });
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


function initializeTemplateButtons() {
    console.log('Initializing template buttons...');
    const buttons = document.querySelectorAll('.create-template-btn');
    console.log(`Found ${buttons.length} template buttons.`);

    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const category = button.getAttribute('data-category');
            console.log(`Creating template for category: ${category}`);

            if (staticImageConfig[category]) {
                staticImageConfig[category].forEach(configItem => {
                    createEmptyImageSlot(category, configItem);
                });

                // Do not disable the button. User can click again to add more sets.
            }
        });
    });
}

// Call init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTemplateButtons);
} else {
    initializeTemplateButtons();
}