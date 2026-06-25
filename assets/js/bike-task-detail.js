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
    let uploadedImages = {}; // To store { 'title': 'url' }
    let currentPhotoTitle = null; // To know which photo item is being uploaded/replaced
    let uploadingPathsCount = 0; // Number of images currently processing uploads

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

            if (result.order_pic && result.order_pic.length > 0) {
                // Group DB pictures by general category
                const dbPicsByCategory = {
                    around: [],
                    interior: [],
                    damage: [],
                    documents: []
                };

                result.order_pic.forEach(pic => {
                    if (!pic.pic_type || !pic.pic) return;
                    let category = 'damage'; // Default to damage
                    if (pic.pic_type.startsWith('around')) {
                        category = 'around';
                    } else if (pic.pic_type.startsWith('interior') || pic.pic_type.startsWith('accessories')) {
                        category = 'interior';
                    } else if (pic.pic_type.startsWith('inspection') || pic.pic_type.startsWith('damage')) {
                        category = 'damage';
                    } else if (pic.pic_type.startsWith('documents') || pic.pic_type.startsWith('fiber') || pic.pic_type.startsWith('license') || pic.pic_type.startsWith('id_card') || pic.pic_type.startsWith('car_doc') || pic.pic_type.startsWith('car_number')) {
                        category = 'documents';
                    }
                    dbPicsByCategory[category].push(pic);
                });

                // Standard categories config of Bike dashboard
                const categoriesConfig = {
                    around: ['ด้านหน้ารถ', 'ด้านซ้ายส่วนหน้า', 'ด้านซ้ายตรง', 'ด้านซ้ายส่วนหลัง', 'ด้านท้ายรถ', 'ด้านขวาส่วนหลัง', 'ด้านขวาตรง', 'ด้านขวาส่วนหน้า', 'หลังคา'],
                    interior: ['ห้องเครื่อง', 'คอลโซล', 'จอไมล์', 'วิทยุ', 'กล้องหน้ารถ', 'ฟิล์ม', 'ยางอะไหล่', 'ล้อหน้าด้านขวา', 'ล้อหน้าด้านซ้าย', 'ล้อหลังด้านขวา', 'ล้อหลังด้านซ้าย'],
                    damage: ['ความเสียหาย 1', 'ความเสียหาย 2', 'ความเสียหาย 3', 'ความเสียหาย 4', 'ความเสียหาย 5', 'ความเสียหาย 6', 'ความเสียหาย 7', 'ความเสียหาย 8', 'ความเสียหาย 9', 'ความเสียหาย 10', 'แผล 1', 'แผล 2', 'แผล 3', 'แผล 4', 'แผล 5', 'แผล 6', 'แผล 7', 'แผล 8', 'แผล 9', 'แผล 10'],
                    documents: ['ใบขับขี่', 'บัตรประชาชน', 'รายการจดทะเบียนรถ', 'เลขตัวถังหรือเลขคัสซี', 'ใบตรวจสภาพ', 'ลายเซ็น']
                };

                // Map damage/inspection images in sequence to 'ความเสียหาย 1', 'ความเสียหาย 2', ...
                let damageIndex = 0;
                dbPicsByCategory.damage.forEach(pic => {
                    const itemText = categoriesConfig.damage[damageIndex];
                    if (itemText) {
                        uploadedImages[itemText] = {
                            url: pic.pic,
                            lat: pic.lat,
                            lng: pic.lng,
                            db_title: pic.pic_title
                        };
                        damageIndex++;
                    }
                });

                // Map other categories by checking pic_title match, fallback to sequence
                for (const cat in dbPicsByCategory) {
                    if (cat === 'damage') continue;
                    
                    const unmappedPics = [];
                    dbPicsByCategory[cat].forEach(pic => {
                        let matchedItemText = categoriesConfig[cat].find(item => pic.pic_title && pic.pic_title.includes(item));
                        if (matchedItemText) {
                            uploadedImages[matchedItemText] = {
                                url: pic.pic,
                                lat: pic.lat,
                                lng: pic.lng,
                                db_title: pic.pic_title
                            };
                        } else {
                            unmappedPics.push(pic);
                        }
                    });
                    
                    let unmappedIndex = 0;
                    categoriesConfig[cat].forEach(itemText => {
                        if (!uploadedImages[itemText] && unmappedIndex < unmappedPics.length) {
                            const pic = unmappedPics[unmappedIndex];
                            uploadedImages[itemText] = {
                                url: pic.pic,
                                lat: pic.lat,
                                lng: pic.lng,
                                db_title: pic.pic_title
                            };
                            unmappedIndex++;
                        }
                    });
                }
            }

            if (result.order) {
                acceptClaimId.textContent = result.order.id;
                acceptLocation.textContent = result.order.location;
            }
            if (result.order_details) {
                acceptCustomerName.textContent = result.order_details.c_name;
                acceptCustomerPhone.textContent = result.order_details.tell_1;
                // Populate working view as well
                document.getElementById('work-customer-name').textContent = result.order_details.c_name;
                document.getElementById('work-customer-phone').textContent = result.order_details.tell_1;

                // Populate the new form
                document.getElementById('work-form-customer-name').value = result.order_details.c_name || '';
                document.getElementById('work-form-customer-phone').value = result.order_details.tell_1 || '';
                document.getElementById('work-form-car-brand').value = result.order_details.c_brand || '';
                document.getElementById('work-form-car-model').value = result.order_details.c_version || '';
                document.getElementById('work-form-car-mileage').value = result.order_details.c_mile || '';
                document.getElementById('work-form-car-type').value = result.order_details.c_type || '';
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
                acceptBtn.style.display = 'none';
                rejectBtn.style.display = 'none';
            }

        } catch (error) {
            console.error('Error loading task details:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
            window.location.href = DASHBOARD_PAGE;
        }
    }

    // --- View Switching ---
    function showAcceptView() {
        acceptView.style.display = 'block';
        workingView.style.display = 'none';
    }

    function showWorkingView() {
        acceptView.style.display = 'none';
        workingView.style.display = 'block';
        renderPhotoCategories();
    }

    // --- Photo Rendering & Upload Logic ---
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

                    const imageUrl = uploadedImages[itemText] ? (typeof uploadedImages[itemText] === 'string' ? uploadedImages[itemText] : uploadedImages[itemText].url) : null;
                    if (imageUrl) {
                        itemDiv.innerHTML = `<i class="bx bx-check-circle bx-sm d-block mb-1 text-success"></i><span>${itemText}</span>`;
                        itemDiv.style.borderColor = '#71dd37';
                    } else {
                        itemDiv.innerHTML = `<i class="bx bx-camera bx-sm d-block mb-1"></i><span>${itemText}</span>`;
                    }

                    itemDiv.addEventListener('click', () => {
                        currentPhotoTitle = itemText;
                        const existingImageUrl = uploadedImages[itemText] ? (typeof uploadedImages[itemText] === 'string' ? uploadedImages[itemText] : uploadedImages[itemText].url) : null;
                        if (existingImageUrl) {
                            // If image exists, show preview modal
                            document.getElementById('imagePreviewModalLabel').textContent = `ดูรูปภาพ: ${currentPhotoTitle}`;
                            previewImage.src = existingImageUrl;
                            previewModal.show();
                        } else {
                            // If no image, trigger upload
                            imageUploadInput.click();
                        }
                    });

                    col.appendChild(itemDiv);
                    container.appendChild(col);
                });
            }
        }
    }

    async function handleImageUpload(event) {
        const files = event.target.files;
        if (!files.length || !currentPhotoTitle) return;

        const formData = new FormData();
        formData.append('images', files[0]); // Simplified to one file per click for clarity

        const itemDiv = document.querySelector(`.photo-item[data-title="${currentPhotoTitle}"]`);
        if (itemDiv) itemDiv.innerHTML = `<div class="spinner-border spinner-border-sm text-primary" role="status"></div><span>Uploading...</span>`;

        uploadingPathsCount++; // Increment when upload starts

        try {
            const response = await fetch(`https://be-claims-service.onrender.com/api/image/transactions`, {
                method: 'POST',
                headers: { 'Authorization': token },
                body: formData
            });

            if (!response.ok) throw new Error('Image upload failed');

            const result = await response.json();
            if (result.uploaded && result.uploaded.length > 0) {
                uploadedImages[currentPhotoTitle] = { url: result.uploaded[0].url, db_title: currentPhotoTitle };
                renderPhotoCategories(); // Re-render to update the UI with a checkmark
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
            renderPhotoCategories(); // Re-render to revert UI on failure
        } finally {
            imageUploadInput.value = '';
            currentPhotoTitle = null;
            uploadingPathsCount--; // Decrement when upload is finished or failed
        }
    }

    // --- Event Listeners ---
    replaceImageBtn.addEventListener('click', () => {
        previewModal.hide();
        // currentPhotoTitle is already set from the item click
        if (currentPhotoTitle) {
            imageUploadInput.click();
        }
    });

    async function updateStatus(newStatus) {
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

    acceptBtn.addEventListener('click', async () => {
        const success = await updateStatus('รับงาน');
        if (success) {
            showWorkingView();
        }
    });

    rejectBtn.addEventListener('click', async () => {
        const success = await updateStatus('ปฏิเสธงาน');
        if (success) {
            alert('คุณได้ปฏิเสธงานเรียบร้อยแล้ว');
            window.location.href = DASHBOARD_PAGE;
        }
    });

    callBtn1.addEventListener('click', () => {
        const phoneNumber = currentOrderData?.order_details?.tell_1;
        if (phoneNumber) {
            window.location.href = `tel:${phoneNumber}`;
        } else {
            alert('ไม่พบเบอร์โทรศัพท์ลูกค้า');
        }
    });

    const callBtn2 = document.getElementById('call-btn-2');
    if (callBtn2) {
        callBtn2.addEventListener('click', () => {
            const phoneNumber = currentOrderData?.order_details?.tell_1;
            if (phoneNumber) {
                window.location.href = `tel:${phoneNumber}`;
            } else {
                alert('ไม่พบเบอร์โทรศัพท์ลูกค้า');
            }
        });
    }

    const saveWorkBtn = document.getElementById('save-work-btn');
    if (saveWorkBtn) {
        saveWorkBtn.addEventListener('click', () => {
            const confirmSubmit = confirm('คุณต้องการส่งงานเพื่อตรวจสอบใช่หรือไม่?');
            if (confirmSubmit) {
                submitWork();
            }
        });
    }

    async function submitWork() {
        if (uploadingPathsCount > 0) {
            alert('กรุณารอให้อัปโหลดรูปภาพเสร็จสิ้นก่อนทำการส่งงาน');
            return;
        }

        // Create a reverse map to find the category from the image title
        const titleToCategoryMap = {};
        for (const categoryKey in photoCategories) {
            photoCategories[categoryKey].items.forEach(itemText => {
                titleToCategoryMap[itemText] = categoryKey;
            });
        }

        // Map bike categories to the categories used in the main admin view
        const bikeToAdminCategoryMap = {
            'around': 'around',
            'interior': 'accessories',
            'damage': 'inspection',
            'documents': 'documents'
        };

        const picArray = Object.keys(uploadedImages).map(title => {
            const bikeCategory = titleToCategoryMap[title] || 'damage'; // Default to 'damage' if not found
            const adminCategory = bikeToAdminCategoryMap[bikeCategory] || 'inspection'; // Map to admin category, default to 'inspection'
            const imageData = uploadedImages[title];
            const actualUrl = typeof imageData === 'string' ? imageData : (imageData ? imageData.url : '');
            const actualDbTitle = (imageData && imageData.db_title) ? imageData.db_title : title;

            return {
                pic: actualUrl,
                pic_type: adminCategory, // Use the correct, mapped category
                pic_title: actualDbTitle
            };
        });

        const body = {
            order_status: 'ส่งงาน/ตรวจสอบเบื้องต้น',
            order_pic: picArray,
            c_brand: document.getElementById('work-form-car-brand').value,
            c_version: document.getElementById('work-form-car-model').value,
            c_mile: document.getElementById('work-form-car-mileage').value,
            c_type: document.getElementById('work-form-car-type').value
        };

        try {
            const response = await fetch(`https://be-claims-service.onrender.com/api/order-pic/update/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'ไม่สามารถส่งงานได้');
            }

            alert('ส่งงานเรียบร้อยแล้ว');
            window.location.href = DASHBOARD_PAGE;

        } catch (error) {
            console.error('Submit work error:', error);
            alert(`เกิดข้อผิดพลาดในการส่งงาน: ${error.message}`);
        }
    }

    // --- Initial Load & Event Binding ---
    imageUploadInput.addEventListener('change', handleImageUpload);
    loadTaskDetails();
});
