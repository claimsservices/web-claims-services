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
        newSlot.innerHTML = `
            <label class="image-gallery w-100" style="cursor:pointer; padding-bottom: 10px; margin-bottom: 0;">
                <img alt="Preview" class="preview-img" style="display:none; width:100%; height:150px; object-fit:cover;" />
                <i class="bi bi-camera fs-1"></i>
                <input type="file" name="${fileInputName}" data-category="${category}" accept="image/*" capture="environment" hidden>
            </label>
            <input type="text" class="form-control mt-2 image-title-input" placeholder="ระบุคำอธิบาย (ถ้ามี)" value="${initialPicTitle || defaultTitle}" style="font-weight: 600; text-align: center;">
            <button class="btn btn-outline-danger btn-sm remove-other-image-slot-btn" type="button" style="position:absolute; top:5px; right:5px;">
                <i class="bx bx-trash"></i>
            </button>
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

    // Map to hold files staged for upload
    const filesToUpload = new Map();

    async function saveCarDetails(orderId, token) {
        const carBrand = document.getElementById('car-brand').value;
        const carModel = document.getElementById('car-model').value;

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

    // NEW: Unified image selection handler (stages files instead of uploading)
    function handleImageSelection(fileInput) {
        const file = fileInput.files[0];
        const inputName = fileInput.name;

        if (!file) {
            // Clear the staged file if user cancels selection
            filesToUpload.delete(inputName);
            return;
        }

        // Determine the picType right away and store it with the file
        let picType = fileInput.dataset.category || 'unknown';
        
        // Stage the file and its type for upload
        filesToUpload.set(inputName, { file: file, type: picType });

        // Update UI to show preview
        const label = fileInput.closest('label.image-gallery');
        const imgPreview = label.querySelector('img');
        const icon = label.querySelector('i');
        
        const reader = new FileReader();
        reader.onload = (event) => {
            imgPreview.src = event.target.result;
            imgPreview.style.display = 'block';
            if (icon) icon.style.display = 'none';
            label.setAttribute('data-filled', 'true');
        };
        reader.readAsDataURL(file);
    }

    // NEW: Delegated event listener for all file inputs
    document.addEventListener('change', (e) => {
        if (e.target.matches('input[type="file"]')) {
            handleImageSelection(e.target);
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

    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            const orderId = urlParams.get('id');
            if (!orderId) {
                alert('ไม่พบรหัสงานใน URL');
                return;
            }

            if (filesToUpload.size === 0) {
                alert('กรุณาเลือกรูปภาพอย่างน้อย 1 รูปเพื่ออัปโหลด');
                return;
            }

            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> กำลังอัปโหลด...';

            const formData = new FormData();
            formData.append('order_id', orderId);
            formData.append('folder', `transactions/${orderId}`);

            console.log(`[DEBUG] Processing ${filesToUpload.size} files for upload.`);
            const compressionPromises = [];

            filesToUpload.forEach(({ file, type }, inputName) => {
                const fileInput = document.querySelector(`[name="${inputName}"]`);
                if (!fileInput) return;

                const picType = type; // Use the pre-determined type
                const picTitleInput = fileInput.closest('.image-upload-slot').querySelector('.image-title-input');
                const picTitle = picTitleInput ? picTitleInput.value.trim() : 'unknown';

                console.log(`[DEBUG] Staging File -> Name: ${file.name}, Type: ${picType}, Title: ${picTitle}`);

                const promise = imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true })
                    .then(compressedFile => addWatermark(compressedFile)) // Add watermark after compression
                    .then(watermarkedBlob => {
                        // Use the original file name for the watermarked blob
                        formData.append('images', watermarkedBlob, file.name);
                        formData.append('pic_type', picType);
                        formData.append('pic_title', picTitle);
                    })
                    .catch(err => {
                        console.error('Compression or Watermarking error:', err);
                        alert(`เกิดข้อผิดพลาดในการประมวลผลไฟล์: ${file.name}`);
                        throw err; // Propagate error to stop the upload process
                    });
                compressionPromises.push(promise);
            });

            try {
                await Promise.all(compressionPromises);
            } catch (error) {
                // Re-enable button and return if compression fails
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'บันทึกข้อมูล';
                return;
            }

            console.log('[DEBUG] FormData prepared. Sending to backend...');

            // Send the single request
            try {
                const response = await fetch(`https://be-claims-service.onrender.com/api/upload/image/transactions`, {
                    method: 'POST',
                    headers: { 'Authorization': token },
                    body: formData
                });

                const result = await response.json();
                if (response.ok) {
                    alert('✅ อัปโหลดรูปภาพทั้งหมดสำเร็จ!');
                    filesToUpload.clear(); // Clear the map after successful upload
                } else {
                    throw new Error(result.message || 'Upload failed');
                }
            } catch (err) {
                console.error('Upload error:', err);
                alert(`🚫 ไม่สามารถอัปโหลดรูปภาพได้: ${err.message}`);
            } finally {
                // Re-enable button
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'บันทึกข้อมูล';
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