document.addEventListener('DOMContentLoaded', function () {

    const LOGIN_PAGE = '../index.html';
    const DASHBOARD_PAGE = 'bike-dashboard.html';
    const token = localStorage.getItem('authToken');

    // --- Auth Check ---
    if (!token) {
        window.location.href = LOGIN_PAGE;
        return;
    }

    // --- Element Selectors ---
    const acceptView = document.getElementById('accept-view');
    const workingView = document.getElementById('working-view');
    const imageUploadInput = document.getElementById('image-upload-input');
    const imagePreviewModalEl = document.getElementById('imagePreviewModal');
    const previewImage = document.getElementById('preview-image');
    const replaceImageBtn = document.getElementById('replace-image-btn');

    const acceptClaimId = document.getElementById('accept-claim-id');
    const acceptLocation = document.getElementById('accept-location');
    const acceptCustomerName = document.getElementById('accept-customer-name');
    const acceptCustomerPhone = document.getElementById('accept-customer-phone');
    const acceptBtn = document.getElementById('accept-btn');
    const rejectBtn = document.getElementById('reject-btn');
    const callBtn1 = document.getElementById('call-btn-1');

    // --- Modal Instance ---
    const previewModal = new bootstrap.Modal(imagePreviewModalEl);

    // --- Get Order ID from URL ---
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) {
        alert('ไม่พบรหัสงาน (Order ID)');
        window.location.href = DASHBOARD_PAGE;
        return;
    }

    // --- State Management ---
    let currentOrderData = null;
    let uploadedImages = {}; // To store { 'title': { url, lat, lng } }
    let currentPhotoTitle = null; 
    let uploadingPathsCount = 0; 
    let lastKnownCoords = { lat: null, lng: null };

    // --- Background Location Tracking ---
    function startBackgroundLocationTracking() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    lastKnownCoords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('[GPS-BG] Updated:', lastKnownCoords);
                },
                (error) => {
                    console.warn('[GPS-BG] Error:', error.message);
                },
                { enableHighAccuracy: false, timeout: 20000, maximumAge: 30000 }
            );
        }
    }
    startBackgroundLocationTracking();

    // --- Main Function to Load Task Details ---
    async function loadTaskDetails() {
        try {
            const response = await fetch(`https://be-claims-service.onrender.com/api/order-detail/inquiry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ order_id: orderId })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'ไม่สามารถโหลดข้อมูลงานได้');
            }

            const result = await response.json();
            currentOrderData = result;

            uploadedImages = {};
            if (result.order_pic && result.order_pic.length > 0) {
                result.order_pic.forEach(pic => {
                    uploadedImages[pic.pic_title] = {
                        url: pic.pic,
                        lat: pic.lat,
                        lng: pic.lng
                    };
                });
            }

            if (result.order) {
                if (acceptClaimId) acceptClaimId.textContent = result.order.id;
                if (acceptLocation) acceptLocation.textContent = result.order.location;
            }
            if (result.order_details) {
                const name = result.order_details.c_insure || result.order_details.c_name || '-';
                const phone = result.order_details.c_tell || result.order_details.tell_1 || '-';
                if (acceptCustomerName) acceptCustomerName.textContent = name;
                if (acceptCustomerPhone) acceptCustomerPhone.textContent = phone;
                
                const workCustName = document.getElementById('work-customer-name');
                const workCustPhone = document.getElementById('work-customer-phone');
                if (workCustName) workCustName.textContent = name;
                if (workCustPhone) workCustPhone.textContent = phone;

                const formCustName = document.getElementById('work-form-customer-name');
                const formCustPhone = document.getElementById('work-form-customer-phone');
                const formCarBrand = document.getElementById('work-form-car-brand');
                const formCarModel = document.getElementById('work-form-car-model');
                const formCarMileage = document.getElementById('work-form-car-mileage');
                const formCarType = document.getElementById('work-form-car-type');

                if (formCustName) formCustName.value = result.order_details.c_name || '';
                if (formCustPhone) formCustPhone.value = result.order_details.tell_1 || '';
                if (formCarBrand) formCarBrand.value = result.order_details.c_brand || '';
                if (formCarModel) formCarModel.value = result.order_details.c_version || '';
                if (formCarMileage) formCarMileage.value = result.order_details.c_mile || '';
                if (formCarType) formCarType.value = result.order_details.c_type || '';
            }

            const status = result.order.order_status;
            const workingStates = ['รับงาน', 'เริ่มงาน/กำลังเดินทาง', 'ถึงที่เกิดเหตุ/ปฏิบัติงาน', 'แก้ไข'];
            const acceptStates = ['รับเรื่องแล้ว'];

            if (acceptStates.includes(status)) {
                showAcceptView();
            } else if (workingStates.includes(status)) {
                showWorkingView();
            } else {
                showAcceptView();
                if (acceptBtn) acceptBtn.style.display = 'none';
                if (rejectBtn) rejectBtn.style.display = 'none';
            }

        } catch (error) {
            console.error('Error loading task details:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
            window.location.href = DASHBOARD_PAGE;
        }
    }

    function showAcceptView() {
        if (acceptView) acceptView.style.display = 'block';
        if (workingView) workingView.style.display = 'none';
    }

    function showWorkingView() {
        if (acceptView) acceptView.style.display = 'none';
        if (workingView) workingView.style.display = 'block';
        renderPhotoCategories();
    }

    const photoCategories = {
        around: { title: 'ภาพถ่ายรอบคัน', containerId: 'around-car-pics', items: ['ด้านหน้ารถ', 'ด้านซ้ายส่วนหน้า', 'ด้านซ้ายตรง', 'ด้านซ้ายส่วนหลัง', 'ด้านท้ายรถ', 'ด้านขวาส่วนหลัง', 'ด้านขวาตรง', 'ด้านขวาส่วนหน้า', 'หลังคา'] },
        interior: { title: 'ภาพถ่ายภายในรถและอุปกรณ์ตกแต่ง', containerId: 'interior-pics', items: ['ห้องเครื่อง', 'คอลโซล', 'จอไมล์', 'วิทยุ', 'กล้องหน้ารถ', 'ฟิล์ม', 'ยางอะไหล่', 'ล้อหน้าด้านขวา', 'ล้อหน้าด้านซ้าย', 'ล้อหลังด้านขวา', 'ล้อหลังด้านซ้าย'] },
        damage: { title: 'ภาพถ่ายความเสียหาย', containerId: 'damage-pics', items: ['ความเสียหาย 1', 'ความเสียหาย 2', 'ความเสียหาย 3', 'ความเสียหาย 4', 'ความเสียหาย 5', 'ความเสียหาย 6', 'ความเสียหาย 7', 'ความเสียหาย 8', 'ความเสียหาย 9', 'ความเสียหาย 10'] },
        documents: { title: 'เอกสาร', containerId: 'document-pics', items: ['ใบขับขี่', 'บัตรประชาชน', 'รายการจดทะเบียนรถ', 'เลขตัวถังหรือเลขคัสซี', 'ใบตรวจสภาพ', 'ลายเซ็น'] }
    };

    function renderPhotoCategories() {
        for (const categoryKey in photoCategories) {
            const category = photoCategories[categoryKey];
            const container = document.getElementById(category.containerId);
            if (container) {
                container.innerHTML = '';
                category.items.forEach(itemText => {
                    const col = document.createElement('div');
                    col.className = 'col-6 col-md-4 mb-2';

                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'photo-item p-2';
                    itemDiv.setAttribute('data-title', itemText);

                    const imageData = uploadedImages[itemText];
                    const imageUrl = imageData ? (typeof imageData === 'string' ? imageData : imageData.url) : null;
                    
                    if (imageUrl) {
                        itemDiv.innerHTML = `<i class="bx bx-check-circle bx-sm d-block mb-1 text-success"></i><span>${itemText}</span>`;
                        itemDiv.style.borderColor = '#71dd37';
                    } else {
                        itemDiv.innerHTML = `<i class="bx bx-camera bx-sm d-block mb-1"></i><span>${itemText}</span>`;
                    }

                    itemDiv.addEventListener('click', () => {
                        currentPhotoTitle = itemText;
                        const existingImageData = uploadedImages[itemText];
                        const existingImageUrl = existingImageData ? (typeof existingImageData === 'string' ? existingImageData : existingImageData.url) : null;
                        
                        if (existingImageUrl) {
                            document.getElementById('imagePreviewModalLabel').textContent = `ดูรูปภาพ: ${currentPhotoTitle}`;
                            if (previewImage) previewImage.src = existingImageUrl;
                            previewModal.show();
                        } else {
                            // บันทึก Log ทันทีที่กดปุ่มถ่ายรูป/อัปโหลด (ก่อนเลือกไฟล์)
                            logActivity('ถ่ายรูป', 'บันทึกภาพ', lastKnownCoords, '📸');
                            
                            if (imageUploadInput) imageUploadInput.click();
                        }
                    });

                    col.appendChild(itemDiv);
                    container.appendChild(col);
                });
            }
        }
    }

    async function getGPSLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(lastKnownCoords);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                    lastKnownCoords = coords;
                    resolve(coords);
                },
                (error) => {
                    console.warn('[GPS] Error:', error.message);
                    resolve(lastKnownCoords);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 5000 }
            );
        });
    }

    async function logActivity(task, detail, coords, icon = '📝') {
        console.log(`[Log-Activity] Sending JSON log: ${task}`);
        try {
            await fetch(`https://be-claims-service.onrender.com/api/history/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({
                    order_id: orderId,
                    icon: icon,
                    task: task,
                    detail: detail,
                    lat: coords.lat,
                    lng: coords.lng
                })
            });
        } catch (e) {
            console.error('[Log-Activity] Failed:', e);
        }
    }

    async function handleImageUpload(event) {
        const files = event.target.files;
        if (!files.length || !currentPhotoTitle) return;

        console.log(`[Upload] Starting for: ${currentPhotoTitle}`);
        const itemDiv = document.querySelector(`.photo-item[data-title="${currentPhotoTitle}"]`);
        const originalContent = itemDiv ? itemDiv.innerHTML : '';
        if (itemDiv) itemDiv.innerHTML = `<div class="spinner-border spinner-border-sm text-primary" role="status"></div><span>Uploading...</span>`;

        // 1. Capture GPS
        const coords = await getGPSLocation();

        // 2. Prepare Multipart Upload
        const formData = new FormData();
        formData.append('order_id', orderId);
        
        const titleToCategoryMap = {};
        for (const categoryKey in photoCategories) {
            photoCategories[categoryKey].items.forEach(itemText => { titleToCategoryMap[itemText] = categoryKey; });
        }
        const bikeCategory = titleToCategoryMap[currentPhotoTitle] || 'damage';
        const bikeToAdminCategoryMap = { 'around': 'around', 'interior': 'accessories', 'damage': 'inspection', 'documents': 'documents' };
        const adminCategory = bikeToAdminCategoryMap[bikeCategory] || 'inspection';

        formData.append('pic_type', adminCategory);
        formData.append('pic_title', currentPhotoTitle);
        formData.append('lat', coords.lat || '');
        formData.append('lng', coords.lng || '');
        formData.append('images', files[0]);

        uploadingPathsCount++;

        try {
            const response = await fetch(`https://be-claims-service.onrender.com/api/upload/image/transactions`, {
                method: 'POST',
                headers: { 'Authorization': token },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            if (result.uploaded && result.uploaded.length > 0) {
                uploadedImages[currentPhotoTitle] = { url: result.uploaded[0].url, lat: coords.lat, lng: coords.lng };
                renderPhotoCategories();
                
                // 3. Log success after upload is complete
                await logActivity('ถ่ายรูป', `อัปโหลดภาพสำเร็จ: "${currentPhotoTitle}"`, coords, '📸');
            }
        } catch (error) {
            console.error('[Upload] Error:', error);
            alert(`เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ${error.message}`);
            if (itemDiv) itemDiv.innerHTML = originalContent;
        } finally {
            if (imageUploadInput) imageUploadInput.value = '';
            currentPhotoTitle = null;
            uploadingPathsCount--;
        }
    }

    async function updateStatus(newStatus) {
        console.log(`[Status] Updating to: ${newStatus}`);
        const coords = await getGPSLocation();
        
        // Prepare order_hist for this status change
        const order_hist = [{
            icon: '🚲',
            task: newStatus,
            detail: `เปลี่ยนสถานะงานเป็น: ${newStatus}`,
            lat: coords.lat,
            lng: coords.lng
        }];

        try {
            const response = await fetch(`https://be-claims-service.onrender.com/api/order-status/update/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ 
                    order_status: newStatus, 
                    lat: coords.lat, 
                    lng: coords.lng,
                    order_hist: order_hist
                })
            });
            if (!response.ok) throw new Error('Update failed');
            return true;
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
            return false;
        }
    }

    if (acceptBtn) acceptBtn.addEventListener('click', async () => { if (await updateStatus('รับงาน')) showWorkingView(); });
    if (rejectBtn) rejectBtn.addEventListener('click', async () => { if (await updateStatus('ปฏิเสธงาน')) window.location.href = DASHBOARD_PAGE; });
    if (replaceImageBtn) replaceImageBtn.addEventListener('click', () => { previewModal.hide(); if (currentPhotoTitle && imageUploadInput) imageUploadInput.click(); });

    const saveWorkBtn = document.getElementById('save-work-btn');
    if (saveWorkBtn) saveWorkBtn.addEventListener('click', () => { if (confirm('คุณต้องการส่งงานเพื่อตรวจสอบใช่หรือไม่?')) submitWork(); });

    async function submitWork() {
        if (uploadingPathsCount > 0) { alert('กรุณารอให้อัปโหลดรูปภาพเสร็จสิ้นก่อนทำการส่งงาน'); return; }
        const finalCoords = await getGPSLocation();
        
        const titleToCategoryMap = {};
        for (const categoryKey in photoCategories) {
            photoCategories[categoryKey].items.forEach(itemText => { titleToCategoryMap[itemText] = categoryKey; });
        }
        const bikeToAdminCategoryMap = { 'around': 'around', 'interior': 'accessories', 'damage': 'inspection', 'documents': 'documents' };

        const picArray = Object.keys(uploadedImages).map(title => {
            const imageData = uploadedImages[title];
            return {
                pic: typeof imageData === 'string' ? imageData : imageData.url,
                pic_type: bikeToAdminCategoryMap[titleToCategoryMap[title] || 'damage'] || 'inspection',
                pic_title: title,
                lat: imageData.lat,
                lng: imageData.lng
            };
        });

        const logDetail = `ส่งงานเพื่อตรวจสอบเบื้องต้น พร้อมรูปภาพจำนวน ${picArray.length} ใบ`;
        const order_hist = [{
            icon: '📤',
            task: 'ส่งงาน/ตรวจสอบเบื้องต้น',
            detail: logDetail,
            lat: finalCoords.lat,
            lng: finalCoords.lng
        }];

        const body = {
            order_status: 'รออนุมัติ', 
            order_pic: picArray,
            order_hist: order_hist,
            c_brand: document.getElementById('work-form-car-brand')?.value || '',
            c_version: document.getElementById('work-form-car-model')?.value || '',
            c_mile: document.getElementById('work-form-car-mileage')?.value || '',
            c_type: document.getElementById('work-form-car-type')?.value || '',
            lat: finalCoords.lat, 
            lng: finalCoords.lng
        };

        try {
            const response = await fetch(`https://be-claims-service.onrender.com/api/order-pic/update/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error('Submit failed');
            alert('ส่งงานเรียบร้อยแล้ว');
            window.location.href = DASHBOARD_PAGE;
        } catch (error) {
            alert(`เกิดข้อผิดพลาดในการส่งงาน: ${error.message}`);
        }
    }

    if (imageUploadInput) imageUploadInput.addEventListener('change', handleImageUpload);
    loadTaskDetails();
});
