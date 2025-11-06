document.addEventListener('DOMContentLoaded', () => {

    // Define populateModels and initCarModelDropdown here or ensure they are globally accessible
    // Assuming carModels is loaded from car-models.js
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

    initCarModelDropdown(document.getElementById('car-brand'), document.getElementById('car-model'));

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
            
            // Get user role from token
            const decodedToken = parseJwt(token);
            if (decodedToken && decodedToken.role === 'Bike' && result.order && result.order.creator) {
                delete result.order.creator; // Remove creator for 'Bike' role
            }

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
            document.getElementById('phone').value = details.tell_1;
            document.getElementById('province-category').value = details.c_car_province;

            const carBrandSelect = document.getElementById('car-brand');
            if (carBrandSelect) {
                carBrandSelect.value = details.c_brand;
                carBrandSelect.dispatchEvent(new Event('change')); // Trigger change to populate models
            }
            const carModelSelect = document.getElementById('car-model');
            if (carModelSelect) {
                carModelSelect.value = details.c_version;
            }
            document.getElementById('vin').value = details.c_number;
            document.getElementById('customer-name').value = details.c_name;
        }
    }

    function renderExistingImages(images) {
        images.forEach(image => {
            if (!image.pic_title || !image.pic) return;

            const titleDivs = document.querySelectorAll('div.title');
            let found = false;
            titleDivs.forEach(div => {
                const targetLabel = div.closest('label.image-gallery');
                // Find the first unfilled div that includes the image title
                if (!found && targetLabel && !targetLabel.hasAttribute('data-filled') && div.innerText.trim().includes(image.pic_title.trim())) {
                    
                    // Mark as filled to prevent multiple assignments
                    targetLabel.setAttribute('data-filled', 'true');

                    const imgTag = targetLabel.querySelector('img');
                    const icon = targetLabel.querySelector('i');

                    // Display the image
                    if (imgTag && icon) {
                        imgTag.src = image.pic;
                        imgTag.style.display = 'block';
                        icon.style.display = 'none';
                    }

                    // Create and append download button
                    const downloadUrl = createDownloadUrl(image.pic);
                    const downloadBtn = document.createElement('a');
                    downloadBtn.href = downloadUrl;
                    downloadBtn.setAttribute('download', '');
                    downloadBtn.className = 'btn btn-sm btn-outline-primary position-absolute top-0 end-0 m-2';
                    downloadBtn.innerHTML = '<i class="bx bx-download"></i>';
                    downloadBtn.title = 'ดาวน์โหลดรูปภาพ';
                    targetLabel.style.position = 'relative'; // Ensure parent is relative for absolute positioning
                    targetLabel.appendChild(downloadBtn);

                    found = true; // Move to the next image
                }
            });

            // If no fixed slot was found, assume it's an "other" image and create a dynamic slot
            if (!found) {
                createOtherImageUploadSlot(image.pic, image.pic_title);
            }
        });
    }

    function createDownloadUrl(cloudinaryUrl) {
        if (!cloudinaryUrl.includes('/upload/')) {
            return cloudinaryUrl; // Not a standard Cloudinary URL, return as is
        }
        return cloudinaryUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    let otherUploadSlotCounter = 0; // To give unique IDs to new dynamic slots

    function createOtherImageUploadSlot(initialFile = null, initialTitle = 'อื่นๆ') {
        const container = document.getElementById('dynamic-other-upload-container');
        const newSlotId = `other-image-slot-${++otherUploadSlotCounter}`;
        const newPreviewId = `other-preview-container-${otherUploadSlotCounter}`;

        const newSlot = document.createElement('div');
        newSlot.className = 'col-md-4 col-lg-3 mb-3 text-center image-upload-slot'; // Added image-upload-slot class
        newSlot.id = newSlotId;
        newSlot.innerHTML = `
            <label class="image-gallery w-100" style="cursor:pointer;">
                <img alt="Preview" class="preview-img" style="display:none; width:100%; height:150px; object-fit:cover;" />
                <i class="bi bi-camera fs-1"></i>
                <input type="text" class="form-control mt-2 image-title-input" placeholder="ระบุคำอธิบาย" value="${initialTitle}" style="font-weight: 600; text-align: center;">
                <input type="file" name="other_images_${otherUploadSlotCounter}" accept="image/*" capture="environment" hidden>
            </label>
            <button class="btn btn-outline-danger btn-sm remove-other-image-slot-btn" type="button" style="position:absolute; top:5px; right:5px; display:none;">
                <i class="bx bx-trash"></i>
            </button>
        `;
        container.appendChild(newSlot);

        const fileInput = newSlot.querySelector('input[type="file"]');
        const previewImg = newSlot.querySelector('.preview-img');
        const icon = newSlot.querySelector('i');
        const removeBtn = newSlot.querySelector('.remove-other-image-slot-btn');
        const label = newSlot.querySelector('label.image-gallery');

        if (initialFile) {
            previewImg.src = initialFile;
            previewImg.style.display = 'block';
            icon.style.display = 'none';
            label.setAttribute('data-filled', 'true');
            removeBtn.style.display = 'block'; // Show remove button for pre-filled slots
        }

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    previewImg.src = event.target.result;
                    previewImg.style.display = 'block';
                    icon.style.display = 'none';
                    label.setAttribute('data-filled', 'true');
                    removeBtn.style.display = 'block';
                };
                reader.readAsDataURL(e.target.files[0]);
            } else {
                previewImg.src = '';
                previewImg.style.display = 'none';
                icon.style.display = 'block';
                label.removeAttribute('data-filled');
                removeBtn.style.display = 'none';
            }
        });

        removeBtn.addEventListener('click', () => {
            newSlot.remove();
            // Hide remove button if only one dynamic slot remains
            if (document.querySelectorAll('#dynamic-other-upload-container .image-upload-slot').length === 1) {
                document.querySelector('#dynamic-other-upload-container .remove-other-image-slot-btn').style.display = 'none';
            }
        });

        // Show remove button if more than one dynamic slot
        if (document.querySelectorAll('#dynamic-other-upload-container .image-upload-slot').length > 1) {
            document.querySelectorAll('#dynamic-other-upload-container .remove-other-image-slot-btn').forEach(btn => btn.style.display = 'block');
        } else {
            // Hide remove button for the first slot if it's the only one
            removeBtn.style.display = 'none';
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
            case "ส่งงาน/ตรวจสอบเบื้องต้น": case "รออนุมัติ": case "ผ่าน": activeSteps = 4; break;
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
            if(btn) btn.style.display = 'none';
        });

        let buttonsToShow = [];
        switch (status) {
            case "เปิดงาน": case "รับเรื่องแล้ว": buttonsToShow = ['btn-accept', 'btn-reject']; break;
            case "รับงาน": buttonsToShow = ['btn-start']; break;
            case "เริ่มงาน/กำลังเดินทาง": buttonsToShow = ['btn-arrived']; break;
            case "ถึงที่เกิดเหตุ/ปฏิบัติงาน": buttonsToShow = ['btn-submit-task']; break;
        }
        buttonsToShow.forEach(id => { 
            const btn = document.getElementById(id);
            if(btn) btn.style.display = 'inline-block';
        });
    }

    async function setStatusFromClick(status) {
        const orderId = urlParams.get('id');
        if (!orderId) {
            alert('ไม่พบรหัสงาน');
            return;
        }

        try {
            const response = await fetch(`https://be-claims-service.onrender.com/api/order-status/update/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ order_id: orderId, order_status: status })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ไม่สามารถอัปเดตสถานะได้');
            }

            alert(`อัปเดตสถานะเป็น "${status}" สำเร็จ`);
            handleOrderStatus(status); // Update UI after successful API call
            window.location.reload(); // Reload to reflect changes and button states
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`เกิดข้อผิดพลาดในการอัปเดตสถานะ: ${error.message}`);
        }
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

    // --- Page Init --- //
    loadUserProfile();

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    if (orderId) {
        loadOrderData(orderId);
    } else {
        alert('ไม่พบรหัสงานใน URL');
    }
    
    // Add event listener for dynamic other image slots
    const addOtherImageSlotBtn = document.getElementById('add-other-image-slot-btn');
    if (addOtherImageSlotBtn) {
        addOtherImageSlotBtn.addEventListener('click', () => {
            createOtherImageUploadSlot();
        });
    }

    // Create initial empty dynamic slot
    createOtherImageUploadSlot();

    async function saveCarDetails(orderId, token) {
        const carBrand = document.getElementById('car-brand').value;
        const carModel = document.getElementById('car-model').value;

        const payload = {
            c_brand: carBrand,
            c_version: carModel,
            // Add other car details if needed, similar to task-detail.js
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

    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            const orderId = urlParams.get('id');
            if (!orderId) {
                alert('ไม่พบรหัสงานใน URL');
                return;
            }

            let allSuccess = true;
            const messages = [];

            // 1. Save Car Details
            const carDetailsResult = await saveCarDetails(orderId, token);
            if (carDetailsResult.success) {
                messages.push(carDetailsResult.message);
            } else {
                allSuccess = false;
                messages.push(carDetailsResult.message);
            }

            // 2. Upload Images (existing logic)
            const allFiles = [];

            // Collect files from fixed slots
            document.querySelectorAll('input[type="file"]:not([name^="other_images_"])').forEach(input => {
                if (input.files && input.files.length > 0) {
                    allFiles.push({
                        file: input.files[0],
                        pic_type: input.name,
                        pic_title: input.closest('label').querySelector('.title').textContent
                    });
                }
            });

            // Collect files from dynamic "other" slots
            document.querySelectorAll('#dynamic-other-upload-container input[type="file"]').forEach(input => {
                if (input.files && input.files.length > 0) {
                    allFiles.push({
                        file: input.files[0],
                        pic_type: input.name,
                        pic_title: input.closest('label').querySelector('.image-title-input').value
                    });
                }
            });

            if (allFiles.length > 0) { // Only attempt image upload if there are files
                const formData = new FormData();
                formData.append('order_id', orderId);
                formData.append('folder', `transactions/${orderId}`);

                allFiles.forEach(fileData => {
                    formData.append('images', fileData.file);
                    formData.append('pic_types', fileData.pic_type);
                    formData.append('pic_titles', fileData.pic_title);
                });

                try {
                    const response = await fetch(`https://be-claims-service.onrender.com/api/upload/image/transactions`, {
                        method: 'POST',
                        headers: {
                            'Authorization': token
                        },
                        body: formData
                    });

                    if (response.ok) {
                        messages.push('✅ อัปโหลดรูปภาพสำเร็จ!');
                    } else {
                        allSuccess = false;
                        const errorData = await response.json();
                        messages.push(`❌ เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ${errorData.message || response.statusText}`);
                    }
                } catch (error) {
                    allSuccess = false;
                    messages.push(`❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่ออัปโหลดรูปภาพ: ${error.message}`);
                    console.error('Upload error:', error);
                }
            } else if (allSuccess) { // If no files to upload, but car details saved successfully
                messages.push('ไม่มีรูปภาพให้อัปโหลด');
            }

            alert(messages.join('\n'));
            if (allSuccess) {
                window.location.reload(); // Reload to reflect changes
            }
        });
    }

    document.getElementById('btn-accept')?.addEventListener('click', () => setStatusFromClick('รับงาน'));
    document.getElementById('btn-reject')?.addEventListener('click', () => setStatusFromClick('ปฏิเสธงาน'));
    document.getElementById('btn-start')?.addEventListener('click', () => setStatusFromClick('เริ่มงาน/กำลังเดินทาง'));
    document.getElementById('btn-arrived')?.addEventListener('click', () => setStatusFromClick('ถึงที่เกิดเหตุ/ปฏิบัติงาน'));
    document.getElementById('btn-submit-task')?.addEventListener('click', () => setStatusFromClick('รออนุมัติ'));

    document.body.classList.remove('loading');
});