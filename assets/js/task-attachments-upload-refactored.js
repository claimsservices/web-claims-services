import { getQueryParam, navigateTo } from './navigation.js';

export const staticImageConfig = {
    exterior: [
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
    interior: [
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
    damage: [
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
    document: [ // Renamed from 'fiber' to 'document' to match task-attachments-upload.html
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
    other: [ // Renamed from 'documents' to 'other' to match task-attachments-upload.html
        { name: "other_1", defaultTitle: "ภาพถ่ายอื่นๆ" },
        { name: "other_2", defaultTitle: "ภาพถ่ายอื่นๆ" },
        { name: "other_3", defaultTitle: "ภาพถ่ายอื่นๆ" },
        { name: "other_4", defaultTitle: "ภาพถ่ายอื่นๆ" },
        { name: "other_5", defaultTitle: "ภาพถ่ายอื่นๆ" },
        { name: "other_6", defaultTitle: "ภาพถ่ายอื่นๆ" },
        { name: "other_7", defaultTitle: "ภาพถ่ายอื่นๆ" },
        { name: "other_8", defaultTitle: "ภาพถ่ายอื่นๆ" }
    ],
    signature: [
        { name: "doc_other_9", defaultTitle: "ลายเซ็น" }
    ]
};

document.addEventListener('DOMContentLoaded', () => {

    const LOGIN_PAGE = '../index.html';
    const token = localStorage.getItem('authToken');

    // --- Auth & Profile --- //
    if (!token) {
        window.location.href = LOGIN_PAGE;
        return;
    }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    function loadUserProfile() {
        const decoded = parseJwt(token);
        if (decoded) {
            document.getElementById('user-info').innerText = `${decoded.first_name} ${decoded.last_name}`;
            document.getElementById('user-role').innerText = decoded.role;
            if(decoded.myPicture) {
                document.getElementById('userAvatar').src = decoded.myPicture;
            }
        }
    }

    // --- Main Data Loading --- //
    async function loadOrderData(orderId) {
        try {
            const response = await fetch(`https://be-claims-service.onrender.com/api/order-detail/inquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ order_id: orderId })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'ไม่พบข้อมูลงาน');
            }

            const result = await response.json();
            renderOrderDetails(result.order, result.order_details);
            
            if (result.order_pic && result.order_pic.length > 0) {
                renderExistingImages(result.order_pic);
            }

            handleOrderStatus(result.order.order_status || "เปิดงาน");

        } catch (err) {
            alert(`❌ ไม่สามารถโหลดข้อมูลได้: ${err.message}`);
            console.error('Inquiry Error:', err);
        }
    }

    function renderOrderDetails(order, details) {
        if (!order) return;
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.location)}`;
        document.getElementById('job-code').value = order.id;
        document.getElementById('insurance-company').value = order.insur_comp;
        document.getElementById('car-plate').value = order.car_registration;
        document.getElementById('customer-address').value = order.location;
        document.getElementById('open-map').href = mapUrl;

        if (details) {
            document.getElementById('phone').value = details.full_phone;
            document.getElementById('province-category').value = details.c_car_province;
            document.getElementById('car-brand').value = details.c_brand;
            document.getElementById('car-model').value = details.c_version;
            document.getElementById('vin').value = details.c_number;
            document.getElementById('customer-name').value = details.c_name;
        }
    }

    // --- Dynamic Image Upload Logic ---
    function renderNewImageUploadSlot(category, initialFile = null, initialTitle = 'รูปภาพ') {
        const uniqueId = `dynamic-upload-${category}-${Date.now()}`;
        const newSlotHtml = `
            <div class="col-md-4 col-lg-3 mb-3 text-center dynamic-image-slot" data-pic-type="${category}">
                <label class="image-gallery w-100" data-filled="${initialFile ? 'true' : 'false'}" style="cursor:pointer; position:relative; display: block; border-radius:8px; overflow: hidden; height: 200px;">
                    <img src="${initialFile || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}" style="width:100%; height:100%; object-fit: cover; display:${initialFile ? 'block' : 'none'};" alt="${initialTitle}">
                    <div class="title" contenteditable="true" style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 6px 10px; background: rgba(0,0,0,0.8); color: white; font-weight: 600; font-size: 14px; text-align: center; box-sizing: border-box;">
                        ${initialTitle}
                    </div>
                    <input type="file" id="${uniqueId}" name="dynamic_image" data-category="${category}" hidden accept="image/*" capture="camera">
                    <button type="button" class="delete-btn" title="ลบภาพ" style="position: absolute; top: 6px; right: 6px; background: transparent; border: none; color: rgb(252, 7, 7); font-size: 24px; line-height: 1; cursor: pointer; z-index: 10; display: ${initialFile ? 'block' : 'none'};"><i class="bi bi-x-circle-fill"></i></button>
                    <button type="button" class="edit-title-btn" title="แก้ไขชื่อภาพ" style="position: absolute; top: 38px; right: 8px; width: 26px; height: 26px; background-color: #198754; color: #fff; border-radius: 50%; border: 2px solid white; font-weight: bold; font-size: 14px; line-height: 1; display: ${initialFile ? 'flex' : 'none'}; align-items: center; justify-content: center; cursor: pointer; z-index: 10; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);">A</button>
                </label>
            </div>
        `;
        return newSlotHtml;
    }

    function populateImageSections() {
        const sectionsMap = {
            'exterior': document.getElementById('dynamic-exterior-upload-container'),
            'interior': document.getElementById('dynamic-interior-upload-container'),
            'damage': document.getElementById('dynamic-damage-upload-container'),
            'document': document.getElementById('dynamic-document-upload-container'),
            'other': document.getElementById('dynamic-other-upload-container')
        };

        for (const category in sectionsMap) {
            const targetContainer = sectionsMap[category];
            if (targetContainer) {
                targetContainer.innerHTML = ''; // Clear existing content

                const config = staticImageConfig[category];
                if (config) {
                    config.forEach(item => {
                        const newSlotHtml = renderNewImageUploadSlot(category, null, item.defaultTitle);
                        targetContainer.insertAdjacentHTML('beforeend', newSlotHtml);
                    });
                }

                // Add the "Add Image" button after static slots
                const addImageButtonHtml = `
                    <div class="col-md-4 col-lg-3 mb-3 text-center">
                        <button type="button" class="btn btn-outline-primary add-image-btn" data-category="${category}">
                            <i class="bi bi-plus-circle"></i> เพิ่มรูปภาพ
                        </button>
                    </div>
                `;
                targetContainer.insertAdjacentHTML('beforeend', addImageButtonHtml);
            }
        }
    }

    function renderExistingImages(images) {
        images.forEach(image => {
            if (!image.pic_title || !image.pic) return;

            let category;
            switch (image.pic_type) {
                case 'exterior': category = 'exterior'; break;
                case 'interior': category = 'interior'; break;
                case 'damage': category = 'damage'; break;
                case 'document': category = 'document'; break;
                case 'other':
                default: category = 'other'; break;
            }

            const targetContainer = document.getElementById(`dynamic-${category}-upload-container`);
            if (targetContainer) {
                const newSlotHtml = renderNewImageUploadSlot(category, image.pic, image.pic_title);
                // Insert before the "Add Image" button
                const addImageBtn = targetContainer.querySelector(`.add-image-btn[data-category="${category}"]`);
                if (addImageBtn) {
                    addImageBtn.parentElement.insertAdjacentHTML('beforebegin', newSlotHtml);
                } else {
                    targetContainer.insertAdjacentHTML('beforeend', newSlotHtml);
                }
            }
        });
    }

    function createDownloadUrl(cloudinaryUrl) {
        if (!cloudinaryUrl.includes('/upload/')) {
            return cloudinaryUrl; // Not a standard Cloudinary URL, return as is
        }
        return cloudinaryUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    // --- Status & UI Control --- //
    function handleOrderStatus(status) {
        updateProgressVisual(status);
        toggleActionButtons(status);
        toggleUploadSection(status);
    }

    function updateProgressVisual(status) {
        let activeSteps = 0;
        switch (status) {
            case "รับงาน": activeSteps = 1; break;
            case "เริ่มงาน/กำลังเดินทาง": activeSteps = 2; break;
            case "ถึงที่เกิดเหตุ/ปฏิบัติงาน": activeSteps = 3; break;
            case "ส่งงาน/ตรวจสอบเบื้องต้น": case "รออนุมัติ": case "ผ่าน": activeSteps = 4; break;
        }
        const percent = activeSteps > 1 ? ((activeSteps - 1) / 3) * 100 : 0;
        document.getElementById('progressFill').style.width = `${percent}%`;
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}`).classList.toggle('active', i <= activeSteps);
        }
    }

    function toggleActionButtons(status) {
        const buttons = ['btn-accept', 'btn-reject', 'btn-start', 'btn-arrived'];
        buttons.forEach(id => { 
            const btn = document.getElementById(id);
            if(btn) btn.style.display = 'none';
        });

        let buttonsToShow = [];
        switch (status) {
            case "เปิดงาน": case "รับเรื่องแล้ว": buttonsToShow = ['btn-accept', 'btn-reject']; break;
            case "รับงาน": buttonsToShow = ['btn-start']; break;
            case "เริ่มงาน/กำลังเดินทาง": buttonsToShow = ['btn-arrived']; break;
        }
        buttonsToShow.forEach(id => { 
            const btn = document.getElementById(id);
            if(btn) btn.style.display = 'inline-block';
        });
    }

    function toggleUploadSection(status) {
        const isVisible = status === "ถึงที่เกิดเหตุ/ปฏิบัติงาน";
        document.querySelectorAll('.upload-section').forEach(section => {
            section.style.display = isVisible ? 'block' : 'none';
        });
        const uploadActions = document.querySelector('.upload-actions');
        if (uploadActions) {
            uploadActions.style.display = isVisible ? 'block' : 'none';
        }
    }

    // --- Event Listeners --- //
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        window.location.href = LOGIN_PAGE;
    });

    document.getElementById('uploadBtn').addEventListener('click', async () => {
        const orderId = urlParams.get('id');
        if (!orderId) {
            alert('ไม่พบรหัสงาน');
            return;
        }

        const formData = new FormData();
        formData.append('order_id', orderId);

        // Collect files from all dynamic slots across all categories
        document.querySelectorAll('.image-upload-slot input[type="file"]').forEach(input => {
            if (input.files[0]) {
                // The name attribute of the input already contains the category prefix and counter
                formData.append(input.name, input.files[0]);
            }
        });

        try {
            const response = await fetch('https://be-claims-service.onrender.com/api/upload/image/transactions', {
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'การอัปโหลดล้มเหลว');
            }

            const result = await response.json();
            alert('✅ อัปโหลดรูปภาพสำเร็จ!');
            console.log('Upload successful:', result);
            // Optionally, refresh the page or update UI to show new images
            location.reload();
        } catch (error) {
            alert(`❌ ข้อผิดพลาดในการอัปโหลด: ${error.message}`);
            console.error('Upload Error:', error);
        }
    });

    // Delegated event listener for "Add Image" buttons
    document.addEventListener('click', function(e) {
        if (e.target && e.target.closest('.add-image-btn')) {
            const addBtn = e.target.closest('.add-image-btn');
            const category = addBtn.dataset.category;
            const targetContainer = document.getElementById(`dynamic-${category}-upload-container`);
            if (targetContainer) {
                const newSlotHtml = renderNewImageUploadSlot(category, null, 'รูปภาพใหม่');
                addBtn.parentElement.insertAdjacentHTML('beforebegin', newSlotHtml);
            }
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
            const folderName = document.getElementById('job-code')?.value.trim() || 'default'; // Use job-code from task-attachments-upload
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
                        // No updateDamageDetailField in task-attachments-upload
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
                // No updateDamageDetailField in task-attachments-upload
            }
        }
    });

    // Delegated event listener for edit title buttons on dynamic image slots
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
                const orderId = document.getElementById('job-code')?.value;
                const picUrl = img.src.split('?')[0]; // Remove cache-busting query params

                // Assuming updateImageTitle function exists and is accessible
                // For task-attachments-upload, we might not need to update backend immediately
                // or we need a similar function here. For now, just update UI.
                titleDiv.textContent = newTitle.trim();
            }
        }
    });

    // --- Page Init --- //
    loadUserProfile();
    populateImageSections(); // Populate initial static slots and add buttons

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    if (orderId) {
        loadOrderData(orderId);
    } else {
        alert('ไม่พบรหัสงานใน URL');
    }
    
    document.body.classList.remove('loading');
});
