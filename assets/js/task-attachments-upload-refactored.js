document.addEventListener('DOMContentLoaded', () => {

    // Define populateModels and initCarModelDropdown here or ensure they are globally accessible
    // Assuming carModels is loaded from car-models.js
    function populateModels(brandSelect, modelSelect) {
        if (!brandSelect || !modelSelect) return;
        const selectedBrand = brandSelect.value;
        const customBrandInput = document.getElementById('car-brand-custom');
        const customModelInput = document.getElementById('car-model-custom');

        // Reset display
        if (customBrandInput) customBrandInput.classList.add('d-none');
        if (customModelInput) customModelInput.classList.add('d-none');
        modelSelect.style.display = 'block';

        // Helper to add 'Other' option
        const addOtherOption = () => {
            const option = document.createElement('option');
            option.value = 'other';
            option.textContent = 'อื่นๆ';
            modelSelect.appendChild(option);
        };

        if (selectedBrand === 'other') {
            if (customBrandInput) customBrandInput.classList.remove('d-none');
            // If brand is custom, model is likely custom too. 
            // We can either show an empty dropdown with "Other" selected, or just hide dropdown and show custom model input.
            // Let's mimic task-detail: hide dropdown, show custom model input directly
            modelSelect.style.display = 'none';
            if (customModelInput) customModelInput.classList.remove('d-none');
            return;
        }

        const models = carModels[selectedBrand] || [];
        modelSelect.innerHTML = '<option selected disabled>เลือกรุ่น</option>';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });

        addOtherOption(); // Add 'Other' to models list
        modelSelect.disabled = models.length === 0;
    }

    function initCarModelDropdown(brandSelect, modelSelect) {
        if (brandSelect && modelSelect) {
            brandSelect.addEventListener('change', () => populateModels(brandSelect, modelSelect));

            // Handle model 'other' selection
            modelSelect.addEventListener('change', () => {
                const customModelInput = document.getElementById('car-model-custom');
                if (modelSelect.value === 'other') {
                    if (customModelInput) customModelInput.classList.remove('d-none');
                } else {
                    if (customModelInput) customModelInput.classList.add('d-none');
                }
            });
        }
    }

    initCarModelDropdown(document.getElementById('car-brand'), document.getElementById('car-model'));

    // =========================================================
    function getCaptureAttr() {
        const token = localStorage.getItem('authToken');
        if (!token) return '';
        const decoded = parseJwt(token); // parseJwt is defined below, but needs to be accessible here
        if (!decoded) return '';
        return (decoded.role === 'Bike' || decoded.role === 'Insurance') ? 'capture="environment"' : '';
    }
    // =========================================================

    const LOGIN_PAGE = '../index.html';
    const token = localStorage.getItem('authToken'); // This token is for the DOMContentLoaded scope

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
            if (decoded.myPicture) {
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

            // Get user role from token
            const decodedToken = parseJwt(token);
            if (decodedToken && decodedToken.role === 'Bike' && result.order && result.order.creator) {
                delete result.order.creator; // Remove creator for 'Bike' role
            }

            renderOrderDetails(result.order, result.order_details);

            if (result.order_pic && result.order_pic.length > 0) {
                renderExistingImages(result.order_pic);
            }

            if (result.order_hist && result.order_hist.length > 0) {
                const latestDetail = result.order_hist.filter(h => h.task === 'รายละเอียดเพิ่มเติม').pop();
                if (latestDetail) {
                    const detailEl = document.getElementById('additional-details');
                    if (detailEl) detailEl.value = latestDetail.detail;
                }
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
            document.getElementById('phone').value = details.tell_1;
            document.getElementById('province-category').value = details.c_car_province;

            const carBrandSelect = document.getElementById('car-brand');
            const carBrandCustom = document.getElementById('car-brand-custom');
            const carModelSelect = document.getElementById('car-model');
            const carModelCustom = document.getElementById('car-model-custom');

            if (carBrandSelect && details.c_brand) {
                // Check if brand exists in options
                let brandValues = Array.from(carBrandSelect.options).map(o => o.value);
                if (brandValues.includes(details.c_brand)) {
                    carBrandSelect.value = details.c_brand;
                } else {
                    carBrandSelect.value = 'other';
                    if (carBrandCustom) carBrandCustom.value = details.c_brand;
                    if (carBrandCustom) carBrandCustom.classList.remove('d-none');
                }

                // Trigger change to populate models (synchronously if possible, or manually call)
                // populateModels is defined in this scope, so we can call it directly
                populateModels(carBrandSelect, carModelSelect);
            }

            if (carModelSelect && details.c_version) {
                if (carBrandSelect.value === 'other') {
                    // Brand is custom, so model is custom (UI hidden by populateModels)
                    if (carModelCustom) carModelCustom.value = details.c_version;
                    if (carModelCustom) carModelCustom.classList.remove('d-none');
                } else {
                    let modelValues = Array.from(carModelSelect.options).map(o => o.value);
                    if (modelValues.includes(details.c_version)) {
                        carModelSelect.value = details.c_version;
                    } else {
                        carModelSelect.value = 'other';
                        if (carModelCustom) carModelCustom.value = details.c_version;
                        if (carModelCustom) carModelCustom.classList.remove('d-none');
                    }
                }
            }
            document.getElementById('vin').value = details.c_number;
            document.getElementById('customer-name').value = details.c_name;
        }
    }

    function getCategoryFromPicType(picType) {
        const mapping = {
            'exterior_front': 'around',
            'exterior_left_front': 'around',
            'exterior_left_center': 'around',
            'exterior_left_rear': 'around',
            'exterior_rear': 'around',
            'exterior_right_rear': 'around',
            'exterior_right_center': 'around',
            'exterior_right_front': 'around',
            'exterior_roof': 'around',
            'interior_wheels_1': 'accessories',
            'interior_wheels_2': 'accessories',
            'interior_wheels_3': 'accessories',
            'interior_wheels_4': 'accessories',
            'interior_dashboard': 'accessories',
            'interior_6': 'accessories',
            'interior_7': 'accessories',
            'interior_8': 'accessories',
            'interior_9': 'accessories',
            'interior_10': 'accessories',
            'interior_11': 'accessories',
            'interior_12': 'accessories',
            'interior_13': 'accessories',
            'interior_14': 'accessories',
            'interior_15': 'accessories',
            'interior_16': 'accessories',
            'interior_17': 'accessories',
            'interior_18': 'accessories',
            'interior_19': 'accessories',
            'interior_20': 'accessories',
            'damage_images_1': 'inspection',
            'damage_images_2': 'inspection',
            'damage_images_3': 'inspection',
            'damage_images_4': 'inspection',
            'damage_images_5': 'inspection',
            'damage_images_6': 'inspection',
            'damage_images_7': 'inspection',
            'damage_images_8': 'inspection',
            'damage_images_9': 'inspection',
            'damage_images_10': 'inspection',
            'doc_identity': 'fiber',
            'doc_other_1': 'fiber',
            'doc_other_2': 'fiber',
            'doc_other_3': 'fiber',
            'doc_other_4': 'fiber',
            'doc_other_5': 'fiber',
            'doc_other_6': 'fiber',
            'doc_other_7': 'fiber',
            'doc_other_8': 'fiber',
            'license': 'documents',
            'id_card': 'documents',
            'car_doc': 'documents',
            'car_number': 'documents',
            'other_1': 'documents',
            'other_2': 'documents',
            'doc_other_9': 'documents', // Ambiguous, could be signature or documents
            'other_3': 'documents',
        };
        return mapping[picType] || picType;
    }

    function renderExistingImages(images) {
        images.forEach(image => {
            if (!image.pic_title || !image.pic || !image.pic_type) return;

            let category = getCategoryFromPicType(image.pic_type);
            let containerId = `${category}-container`;

            // Special handling for signature, which is ambiguous in the old data structure
            if (image.pic_type === 'doc_other_9' && image.pic_title === 'ลายเซ็น') {
                category = 'signature';
                containerId = 'signature-container';
            }

            createImageSlot(containerId, category, image.pic_title, image.pic, image.pic_title);
        });
    }

    function createDownloadUrl(cloudinaryUrl) {
        if (!cloudinaryUrl.includes('/upload/')) {
            return cloudinaryUrl; // Not a standard Cloudinary URL, return as is
        }
        return cloudinaryUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    let otherUploadSlotCounter = 0; // To give unique IDs to new dynamic slots

    // Function to create a new dynamic image slot for any category
    function createImageSlot(containerId, category, defaultTitle, initialFile = null, initialPicTitle = null) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID ${containerId} not found.`);
            return;
        }

        const slotCounter = container.children.length + 1;
        const fileInputName = `${category}_${slotCounter}`;

        const newSlot = document.createElement('div');
        newSlot.className = 'col-md-4 col-lg-3 mb-3 text-center image-upload-slot';

        let titleHtml = '';
        if (initialFile) {
            newSlot.dataset.picUrl = initialFile;
            titleHtml = `
                <div class="input-group mt-2">
                    <input type="text" class="form-control image-title-input" placeholder="ระบุคำอธิบาย (ถ้ามี)" value="${initialPicTitle || defaultTitle}" style="font-weight: 600; text-align: center;">
                    <button class="btn btn-outline-primary edit-title-btn" type="button">
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
            `;
        } else {
            titleHtml = `<input type="text" class="form-control mt-2 image-title-input" placeholder="ระบุคำอธิบาย (ถ้ามี)" value="${initialPicTitle || defaultTitle}" style="font-weight: 600; text-align: center;">`;
        }

        newSlot.innerHTML = `
            <div class="image-container" style="position:relative; border-radius:8px; overflow: hidden; height: 180px; margin-bottom: 8px; border: 1px solid #ddd; background-color: #f8f9fa;">
                <label class="image-gallery w-100 h-100" style="cursor:pointer; display: block; margin-bottom: 0;">
                    <img alt="Preview" class="preview-img" style="display:none; width:100%; height:100%; object-fit:cover;" />
                    <div class="camera-icon-wrapper" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; color: #6c757d;">
                        <i class="bi bi-camera fs-1"></i>
                    </div>
                    <input type="file" name="${fileInputName}" data-category="${category}" accept="image/*" ${getCaptureAttr()} hidden>
                </label>
                <button class="remove-other-image-slot-btn" type="button" title="ลบภาพ" style="position: absolute; top: 6px; right: 6px; background: transparent; border: none; color: rgb(252, 7, 7); font-size: 24px; line-height: 1; cursor: pointer; z-index: 10; ${initialFile ? '' : 'display:none;'}">
                    <i class="bi bi-x-circle-fill"></i>
                </button>
            </div>
            ${titleHtml}
        `;
        container.appendChild(newSlot);

        const removeBtn = newSlot.querySelector('.remove-other-image-slot-btn');
        removeBtn.addEventListener('click', () => {
            const fileInput = newSlot.querySelector('input[type="file"]');
            if (fileInput) {
                filesToUpload.delete(fileInput.name); // Remove from staged files
            }
            newSlot.remove();
        });

        if (initialFile) {
            const label = newSlot.querySelector('label.image-gallery');
            const imgPreview = label.querySelector('img');
            const icon = label.querySelector('i');
            imgPreview.src = initialFile;
            imgPreview.style.display = 'block';
            if (icon) icon.style.display = 'none';
            label.setAttribute('data-filled', 'true');
        }
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
            case "ส่งงาน/ตรวจสอบเบื้องต้น": case "รออนุมัติ": case "ผ่าน": case "แก้ไข": activeSteps = 4; break;
        }
        const percent = activeSteps > 1 ? ((activeSteps - 1) / 3) * 100 : 0;
        document.getElementById('progressFill').style.width = `${percent}%`;
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}`).classList.toggle('active', i <= activeSteps);
        }
    }

    function toggleActionButtons(status) {
        const buttons = ['btn-accept', 'btn-reject', 'btn-start', 'btn-arrived', 'btn-submit-task'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.display = 'none';
        });

        let buttonsToShow = [];
        switch (status) {
            case "เปิดงาน": case "รับเรื่องแล้ว": buttonsToShow = ['btn-accept', 'btn-reject']; break;
            case "รับงาน": buttonsToShow = ['btn-start']; break;
            case "เริ่มงาน/กำลังเดินทาง": buttonsToShow = ['btn-arrived']; break;
            case "ถึงที่เกิดเหตุ/ปฏิบัติงาน": case "แก้ไข": buttonsToShow = ['btn-submit-task']; break;
        }
        buttonsToShow.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.display = 'inline-block';
        });
    }

    let isUploading = false;

    async function setStatusFromClick(status) {
        if (isUploading) {
            alert('กรุณารอให้อัปโหลดรูปภาพเสร็จสิ้นก่อนทำการทำรายการต่อ');
            return;
        }

        const orderId = urlParams.get('id');
        if (!orderId) {
            alert('ไม่พบรหัสงาน');
            return;
        }

        // --- Item 6: Save Car Details before submitting work ---
        if (status === 'รออนุมัติ') {
            // Assuming validation is handled in saveCarDetails or we just attempt save
            const saveResult = await saveCarDetails(orderId, token);
            if (!saveResult.success) {
                alert(saveResult.message);
                return; // Stop if car detail save fails
            }
        }

        // --- Item 4: Prepare History Log ---
        const decoded = parseJwt(token);
        const userName = decoded ? `${decoded.first_name} ${decoded.last_name}` : 'Unknown User';
        const userRole = decoded ? decoded.role : 'User';

        let displayStatus = status;
        let detailText = `ผู้ใช้งาน ${userName} (${userRole}) อัปเดตสถานะเป็น ${status}`;

        // Special case: When submitting from "Edit" status
        const currentStatus = document.getElementById('status-text')?.innerText || '';
        if (currentStatus.includes('แก้ไข') && status === 'รออนุมัติ') {
            detailText = `ผู้ใช้งาน ${userName} (${userRole}) แก้ไขงานและส่งงานกลับมาเพื่อตรวจสอบ`;
        }

        const historyLog = {
            icon: getStatusIcon(status),
            task: status,
            detail: detailText,
            created_by: userName
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            console.log(`Updating status from "${currentStatus}" to "${status}"...`);

            const response = await fetch(`https://be-claims-service.onrender.com/api/order-status/update/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    order_status: status,
                    order_hist: [historyLog]
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถอัปเดตสถานะได้');
            }

            alert(`✅ ส่งงานสำเร็จ: เปลี่ยนสถานะเป็น "${status}" เรียบร้อยแล้ว`);
            window.location.reload();
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`เกิดข้อผิดพลาดในการอัปเดตสถานะ: ${error.message}`);
        }
    }

    function getStatusIcon(status) {
        switch (status) {
            case 'รับงาน': return '📝';
            case 'ปฏิเสธงาน': return '❌';
            case 'เริ่มงาน/กำลังเดินทาง': return '🚀';
            case 'ถึงที่เกิดเหตุ/ปฏิบัติงาน': return '📍';
            case 'รออนุมัติ': return '✅';
            default: return 'ℹ️';
        }
    }

    function toggleUploadSection(status) {
        const isVisible = status === "ถึงที่เกิดเหตุ/ปฏิบัติงาน" || status === "แก้ไข";
        document.querySelectorAll('.upload-section').forEach(section => {
            section.style.display = isVisible ? 'block' : 'none';
        });
        const uploadActions = document.querySelector('.upload-actions');
        if (uploadActions) {
            uploadActions.style.display = isVisible ? 'block' : 'none';
        }
    }

    // --- Page Init --- //
    loadUserProfile();

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    if (orderId) {
        loadOrderData(orderId);
    } else {
        alert('ไม่พบรหัสงานใน URL');
    }

    // Function to initialize all image upload sections
    function initializeSections() {
        document.querySelectorAll('.add-image-btn').forEach(button => {
            const category = button.dataset.category;
            const defaultTitle = button.dataset.defaultTitle;
            const containerId = `${category}-container`; // Assuming container ID is category-container

            button.addEventListener('click', () => {
                createImageSlot(containerId, category, defaultTitle);
            });
        });
    }

    // Initialize all sections on page load
    initializeSections();
    initializeTemplateButtons();

    const standardTemplates = {
        'around': [
            "ภาพถ่ายรอบคัน - ด้านหน้ารถ",
            "ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหน้า",
            "ภาพถ่ายรอบคัน - ด้านซ้ายตรง",
            "ภาพถ่ายรอบคัน - ด้านซ้ายส่วนหลัง",
            "ภาพถ่ายรอบคัน - ด้านท้ายรถ",
            "ภาพถ่ายรอบคัน - ด้านขวาส่วนหลัง",
            "ภาพถ่ายรอบคัน - ด้านขวาตรง",
            "ภาพถ่ายรอบคัน - ด้านขวาส่วนหน้า",
            "ภาพถ่ายรอบคัน - หลังคา"
        ],
        'accessories': [
            "ล้อหน้าด้านซ้าย",
            "ล้อหน้าด้านขวา",
            "ล้อหลังด้านซ้าย",
            "ล้อหลังด้านขวา",
            "ปียางขนาดยาง",
            "ห้องเครื่อง",
            "คอลโซล",
            "วิทยุ",
            "จอไมล์",
            "กระจกบังลม",
            "ฟิล์ม",
            "กล้องหน้ารถ",
            "แผงหน้าปัด"
        ],
        'inspection': [
            "ภาพถ่ายความเสียหาย - 1",
            "ภาพถ่ายความเสียหาย - 2",
            "ภาพถ่ายความเสียหาย - 3",
            "ภาพถ่ายความเสียหาย - 4",
            "ภาพถ่ายความเสียหาย - 5",
            "ภาพถ่ายความเสียหาย - 6",
            "ภาพถ่ายความเสียหาย - 7",
            "ภาพถ่ายความเสียหาย - 8",
            "ภาพถ่ายความเสียหาย - 9",
            "ภาพถ่ายความเสียหาย - 10"
        ],
        'fiber': [
            "เอกสารยืนยันตัวบุคคล",
            "ใบตรวจสภาพรถ",
            "ใบตรวจความเสียหาย",
            "ใบตรวจอุปกรณ์ตกแต่ง"
        ]
    };

    function initializeTemplateButtons() {
        document.querySelectorAll('.create-template-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = button.getAttribute('data-category');
                const containerId = `${category}-container`;
                const container = document.getElementById(containerId);

                if (container && standardTemplates[category]) {
                    standardTemplates[category].forEach(title => {
                        createImageSlot(containerId, category, title);
                    });

                    // Optional: Disable button to indicate it's done
                    button.disabled = true;
                    button.textContent = 'สร้างรูปแบบแล้ว';
                    button.classList.remove('btn-outline-primary');
                    button.classList.add('btn-secondary');
                }
            });
        });
    }

    // Map to hold files staged for upload
    const filesToUpload = new Map();

    async function saveCarDetails(orderId, token) {
        let carBrand = document.getElementById('car-brand').value;
        if (carBrand === 'other') {
            carBrand = document.getElementById('car-brand-custom').value;
        }

        let carModel = document.getElementById('car-model').value;
        // Logic: if brand is custom (dropdown hidden), model comes from custom input
        // if model select is 'other', model comes from custom input
        const brandSelectVal = document.getElementById('car-brand').value;
        if (brandSelectVal === 'other') {
            carModel = document.getElementById('car-model-custom').value;
        } else if (carModel === 'other') {
            carModel = document.getElementById('car-model-custom').value;
        }

        const payload = {
            c_brand: carBrand,
            c_version: carModel,
        };

        try {
            const response = await fetch(`https://be-claims-service.onrender.com/api/order-pic/update/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถอัปเดตข้อมูลรถได้');
            }
            return { success: true, message: '✅ อัปเดตข้อมูลรถเรียบร้อยแล้ว' };
        } catch (error) {
            console.error('Error saving car details:', error);
            return { success: false, message: `❌ เกิดข้อผิดพลาดในการอัปเดตข้อมูลรถ: ${error.message}` };
        }
    }

    // NEW: Unified image selection handler (real-time upload)
    async function handleImageSelection(fileInput) {
        const file = fileInput.files[0];
        const inputName = fileInput.name;
        if (!file) return;

        const orderId = new URLSearchParams(window.location.search).get('id');
        const token = localStorage.getItem('authToken') || '';

        // Find slot wrapper
        const newSlot = fileInput.closest('.image-upload-slot');
        const exactSlot = fileInput.closest('.dynamic-image-slot');
        const slot = newSlot || exactSlot;

        let picType = fileInput.dataset.category || fileInput.name || 'unknown';
        const titleInput = slot ? slot.querySelector('.image-title-input') : null;
        const picTitle = titleInput ? titleInput.value.trim() : 'unknown';

        const label = newSlot ? fileInput.closest('label.image-gallery') : null;
        const imgContainer = exactSlot ? slot.querySelector('.image-container') : null;
        const imgPreview = slot ? slot.querySelector('img') : null;
        const icon = label ? label.querySelector('.camera-icon-wrapper') || label.querySelector('i') : null;

        // Visual preview
        const reader = new FileReader();
        reader.onload = (event) => {
            if (imgPreview) {
                imgPreview.src = event.target.result;
                imgPreview.style.display = 'block';
                imgPreview.style.opacity = '0.5';
            }
            if (icon) icon.style.display = 'none';
            if (label) label.setAttribute('data-filled', 'true');

            // Show the delete button now that there's an image
            const deleteBtn = slot ? slot.querySelector('.remove-other-image-slot-btn') : null;
            if (deleteBtn) deleteBtn.style.display = 'block';

            // Loading Overlay
            let loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'upload-spinner-overlay';
            loadingOverlay.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
            loadingOverlay.setAttribute('style', 'position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background-color:rgba(255,255,255,0.7); z-index:5;');
            if (label) label.appendChild(loadingOverlay);
            if (imgContainer) imgContainer.appendChild(loadingOverlay);
        };
        reader.readAsDataURL(file);

        try {
            const formData = new FormData();
            formData.append('order_id', orderId);
            formData.append('folder', `transactions/${orderId}`);

            const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
            const watermarkedBlob = await addWatermark(compressedFile);

            const isReplace = exactSlot && exactSlot.dataset.picUrl;
            formData.append('images', watermarkedBlob, file.name || 'image.jpg');
            formData.append('pic_type', picType);
            formData.append('pic_title', picTitle);

            let targetUrl = `https://be-claims-service.onrender.com/api/upload/image/transactions`;
            let method = 'POST';

            if (isReplace) {
                targetUrl = `https://be-claims-service.onrender.com/api/upload/image/replace`;
                method = 'PUT';
                formData.append('oldPicUrl', exactSlot.dataset.picUrl);
            }

            // --- Apply Timeout using AbortController ---
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

            const response = await fetch(targetUrl, {
                method: method,
                headers: { 'Authorization': token },
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Upload failed');

            let uploadedUrl = '';
            if (isReplace) {
                uploadedUrl = result.url;
            } else if (result.uploaded && result.uploaded.length > 0) {
                uploadedUrl = result.uploaded[0].url;
            }

            if (uploadedUrl && slot) {
                slot.dataset.picUrl = uploadedUrl;
                slot.dataset.uploaded = 'true';
                if (exactSlot) exactSlot.dataset.serverRendered = 'true';
                if (imgPreview) {
                    imgPreview.src = uploadedUrl;
                    imgPreview.style.opacity = '1';
                }
                fileInput.value = ''; // Reset input to allow replace
            }
        } catch (err) {
            console.error('Realtime upload failed:', err);
            if (err.name === 'AbortError') {
                alert('อัปโหลดรูปล้มเหลว: การเชื่อมต่อใช้เวลานานเกินไป (Timeout) กรุณาลองใหม่อีกครั้ง');
            } else {
                alert('อัปโหลดรูปล้มเหลว: ' + err.message);
            }
            if (imgPreview) imgPreview.style.display = 'none';
            if (icon) icon.style.display = 'block';
        } finally {
            const overlay = slot ? slot.querySelector('.upload-spinner-overlay') : null;
            if (overlay) overlay.remove();
        }

        // --- Auto-Save to Device ---
        try {
            const downloadUrl = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `captured_${new Date().getTime()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
        } catch (err) { }
    }

    // NEW: Delegated event listener for all file inputs and interactive buttons
    document.addEventListener('change', (e) => {
        if (e.target.matches('input[type="file"]')) {
            handleImageSelection(e.target);
        }
    });

    document.addEventListener('click', async (e) => {
        const orderId = new URLSearchParams(window.location.search).get('id');
        const token = localStorage.getItem('authToken') || '';

        // 1. Delete btn (New upload slot)
        if (e.target.closest('.remove-other-image-slot-btn')) {
            const btn = e.target.closest('.remove-other-image-slot-btn');
            const slot = btn.closest('.image-upload-slot');
            const picUrl = slot.dataset.picUrl;
            if (picUrl) {
                if (!confirm('คุณต้องการลบรูปภาพนี้ใช่หรือไม่?')) return;
                try {
                    const response = await fetch(`https://be-claims-service.onrender.com/api/order-pic/delete`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json', 'Authorization': token },
                        body: JSON.stringify({ orderId, picUrl })
                    });
                    if (response.ok) slot.remove();
                    else alert('ลบไม่สำเร็จ');
                } catch (err) { console.error(err); alert('เกิดข้อผิดพลาด'); }
            } else {
                slot.remove();
            }
            return;
        }

        // 2. Delete btn (Existing image from task-detail-refactored)
        if (e.target.closest('.delete-btn')) {
            const btn = e.target.closest('.delete-btn');
            const slot = btn.closest('.dynamic-image-slot');
            if (slot) {
                const picUrl = slot.dataset.picUrl;
                if (!picUrl) return;
                if (!confirm('คุณต้องการลบรูปภาพนี้ใช่หรือไม่?')) return;
                try {
                    const response = await fetch(`https://be-claims-service.onrender.com/api/order-pic/delete`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json', 'Authorization': token },
                        body: JSON.stringify({ orderId, picUrl })
                    });
                    if (response.ok) slot.remove();
                    else alert('ลบไม่สำเร็จ');
                } catch (err) { console.error(err); alert('เกิดข้อผิดพลาด'); }
            }
            return;
        }

        // 3. Edit title btn (Existing image from task-detail-refactored)
        if (e.target.closest('.edit-title-btn')) {
            const btn = e.target.closest('.edit-title-btn');
            const slot = btn.closest('.dynamic-image-slot') || btn.closest('.image-upload-slot');
            const input = slot.querySelector('.image-title-input');
            const picUrl = slot.dataset.picUrl;
            if (picUrl && input) {
                btn.disabled = true;
                btn.innerHTML = '...';
                const success = await updateImageTitle(orderId, picUrl, input.value.trim(), token);
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-pencil"></i>';
                if (success) {
                    btn.classList.add('btn-success');
                    btn.classList.remove('btn-outline-primary');
                    setTimeout(() => {
                        btn.classList.remove('btn-success');
                        btn.classList.add('btn-outline-primary');
                    }, 2000);
                }
            }
            return;
        }

        // 4. Upload btn (Change picture of existing image)
        if (e.target.closest('.upload-btn')) {
            const btn = e.target.closest('.upload-btn');
            const slot = btn.closest('.dynamic-image-slot');
            const fileInput = slot.querySelector('input[type="file"]');
            if (fileInput) fileInput.click();
            return;
        }
    });

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

    async function updateImageTitle(orderId, picUrl, newTitle, token) {
        try {
            const response = await fetch(`https://be-claims-service.onrender.com/api/order-pic/update-title`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ orderId, picUrl, newTitle })
            });
            const result = await response.json();
            if (!response.ok) {
                console.error(`Failed to update title for ${picUrl}:`, result.message);
                return false;
            }
            return true;
        } catch (error) {
            console.error(`Error updating title for ${picUrl}:`, error);
            return false;
        }
    }

    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            const orderId = urlParams.get('id');
            if (!orderId) {
                alert('ไม่พบรหัสงานใน URL');
                return;
            }

            // Fallback for "Update all titles manually" - if user still expects "Save Data"
            const allVisibleImages = [
                ...document.querySelectorAll('.image-upload-slot'),
                ...document.querySelectorAll('.dynamic-image-slot')
            ];

            const existingImagesToUpdate = allVisibleImages.filter(slot => {
                return slot.dataset.picUrl && slot.dataset.picUrl.startsWith('http');
            });

            if (existingImagesToUpdate.length === 0) {
                alert('ยังไม่มีรูปภาพ หรือมีการอัปโหลดเรียบร้อยแล้ว');
                return;
            }

            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> กำลังบันทึกข้อมูล...';
            isUploading = true;

            const titleUpdatePromises = existingImagesToUpdate.map(slot => {
                const titleInput = slot.querySelector('.image-title-input');
                if (titleInput && slot.dataset.picUrl) {
                    return updateImageTitle(orderId, slot.dataset.picUrl, titleInput.value.trim(), token);
                }
                return Promise.resolve(true); // Skip invalid slots
            });

            await Promise.all(titleUpdatePromises);

            alert('✅ บันทึกข้อมูลเรียบร้อยแล้ว');

            uploadBtn.disabled = false;
            uploadBtn.textContent = 'บันทึกข้อมูล';
            isUploading = false;
            // Optionally reload to ensure UI syncing
            window.location.reload();
        });
    }

    document.getElementById('btn-accept')?.addEventListener('click', () => setStatusFromClick('รับงาน'));
    document.getElementById('btn-reject')?.addEventListener('click', () => setStatusFromClick('ปฏิเสธงาน'));
    document.getElementById('btn-start')?.addEventListener('click', () => setStatusFromClick('เริ่มงาน/กำลังเดินทาง'));
    document.getElementById('btn-arrived')?.addEventListener('click', () => setStatusFromClick('ถึงที่เกิดเหตุ/ปฏิบัติงาน'));
    document.getElementById('btn-submit-task')?.addEventListener('click', () => setStatusFromClick('รออนุมัติ'));

    document.getElementById('callBtn')?.addEventListener('click', () => {
        const phone = document.getElementById('phone').value;
        if (phone) {
            window.location.href = `tel:${phone}`;
        } else {
            alert('ไม่พบเบอร์โทรศัพท์');
        }
    });

    document.getElementById('logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        window.location.href = LOGIN_PAGE;
    });

    document.body.classList.remove('loading');

    // Expose for testing
    if (typeof window !== 'undefined') {
        window.handleImageSelection = handleImageSelection;
        window.filesToUpload = filesToUpload;
    }
});